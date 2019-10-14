"use strict";

// this code is isolated inside an iframe
let workerManagers = []
let currentTick = 0

const createWorkerManager = (name, initialWorkerCode = undefined) => {
    // returns a wrapper that helps communicate more easily with the worker
    return new (function() {
        this.name = name

        const boilerplateWorkerCode = `
                    /* IFRAME_WEBWORKER_CODE */
                    `

        this.update = workerCode => {
            // generates a worker
            const workerBlob = new Blob(
                [boilerplateWorkerCode.replace('/* USER_CODE */', workerCode)],
                {
                    type: 'text/javascript',
                }
            )

            const worker = new Worker(URL.createObjectURL(workerBlob))

            worker.onmessage = function(event) {
                let parsedData
                try {
                    parsedData = JSON.parse(event.data)
                } catch (e) {
                    console.log(
                        'could not parse webworker message to JSON: ' +
                            event.data
                    )
                    return
                }

                // got a command
                switch (parsedData.topic) {
                    case 'noop':
                        console.log('action by inaction')
                        break
                    case 'choke':
                        console.log('epic fail')
                        break
                    default:
                        console.log('received action: ' + parsedData.topic)
                        break
                }

                // window.postMessage(event.data, '*')
            }

            this.tick = (state, timeout = 2000) =>
                postMessageWait(worker, { topic: 'tick', state }, undefined, {
                    timeout,
                }).then(response => response.ackData)
            this.postMessage = function() {
                console.warn('Did you mean to use postMessageWait?')
                return worker.postMessage.apply(worker, arguments)
            }

            this.terminate = () => {
                worker.terminate()

                // invalidate the commands afterwards to troubleshoot more easily
                this.tick = () => console.warn('tick: worker not active')
                this.postMessage = () =>
                    console.warn('postMessage: worker not active')

                this.terminate = () =>
                    console.warn('terminate: worker not active')
            }
        }

        if (initialWorkerCode !== undefined) {
            // createWorkerManager was supplied code immediately, so execute it immediately
            this.update(initialWorkerCode)
        }
    })()
}

const messageHandler = event => {
    console.log('iframe received message: ', (event || {}).data)

    switch (event.data.topic) {
        case 'add-webworker-once':
            // a more generic close command for more cleanups than webworkers
            // .. For now it's just closing the web workers though
            let onceWorkerManager = createWorkerManager(
                'temp',
                event.data.workerCode
            )

            onceWorkerManager
                .tick(event.data.state, event.data.timeout || 2000)
                .then(result => {
                    onceWorkerManager.terminate()

                    window.parent.postMessage(
                        {
                            topic: 'add-webworker-once-ack',
                            id: event.data.id,
                            ackData: result,
                        },
                        { targetOrigin: '*' }
                    )
                })

            break
        case 'add-or-update-webworker':
            // old blobs will not go away if you update
            // web workers via this method, so better create
            // a new iframe if you are frequently updating
            let workerManagerByName = workerManagers.find(
                workerManager => workerManager.name === event.data.name
            )

            if (workerManagerByName) {
                // worker exists
                workerManagerByName.update(event.data.workerCode)
            } else {
                workerManagers.push(
                    createWorkerManager(event.data.name, event.data.workerCode)
                )
            }

            window.parent.postMessage(
                { topic: 'add-or-update-webworker-ack', id: event.data.id },
                { targetOrigin: '*' }
            )
            break
        case 'tick-one-worker':
            // ticks one web worker, sends ack back with whether
            // there are workers left to tick. This is to make
            // sure that the next worker gets the updated state
            // that the last worker put its indirect effect on
            const getWorkersLeftToTick = () =>
                workerManagers.length - currentTick

            workerManagers[currentTick].tick().then(response => {
                currentTick++

                debugger
                if (getWorkersLeftToTick() === 0) {
                    currentTick = 0
                }

                window.parent.postMessage(
                    {
                        topic: 'tick-one-worker-ack',
                        id: event.data.id,
                        allWorkersTicked: currentTick === 0,
                        response,
                    },
                    { targetOrigin: '*' }
                )
            })
            break
        case 'close':
            // a more generic close command for more cleanups than webworkers
            // .. For now it's just closing the web workers though
            workerManagers.filter(workerManager => {
                workerManager.terminate()
                return false
            })

            if (messageHandler) {
                window.removeEventListener('message', messageHandler)
            }

            debugger

            window.parent.postMessage(
                { topic: 'close-ack', id: event.data.id },
                { targetOrigin: '*' }
            )
            break
        case 'close-webworkers':
            workerManagers.filter(worker => {
                worker.terminate()
                return false
            })

            if (messageHandler) {
                window.removeEventListener('message', messageHandler)
            }

            window.parent.postMessage(
                { topic: 'close-webworkers-ack', id: event.data.id },
                { targetOrigin: '*' }
            )
            break
        default:
            console.warn('topic not implemented: ' + event.data.topic)
            break
    }
}
window.addEventListener('message', messageHandler)

const getUniqueId = () => window.crypto.getRandomValues(new Uint32Array(1))[0]

const isTopicObject = obj => typeof obj === 'object' && obj !== null

const postMessageAck = (target, receivedMessage, postMessageOptions) => {
    let topicObject = isTopicObject(receivedMessage)

    if (topicObject) {
        target.postMessage(receivedMessage.topic + '-ack', postMessageOptions)
    } else {
        target.postMessage(receivedMessage + '-ack', postMessageOptions)
    }
}

const postMessageWait = (target, message, postMessageOptions, options = {}) =>
    new Promise((resolve, reject) => {
        let topicObject = isTopicObject(message)
        let isWebWorker = false

        try {
            isWebWorker = !!target.onmessage
        } catch (e) {
            // not a webworker anyway if this caused cross-origin errors
        }

        if (!topicObject) {
            message = { topic: message }
        }

        message.id = getUniqueId()

        let setTimeoutId

        let cleanUpAndExit = data => {
            if (setTimeoutId) {
                clearTimeout(setTimeoutId)
            }

            if (isWebWorker) {
                target.onmessage = undefined
            } else {
                window.removeEventListener('message', handler)
            }

            resolve(data)
        }

        let handler = event => {
            let data = event.data

            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data)
                } catch (e) {
                    // we tried and it failed, probably not meant to be parsed then
                }
            }

            if (data && data.topic === message.topic + '-ack') {
                cleanUpAndExit(data)
            }
        }

        if (isWebWorker) {
            target.onmessage = handler
        } else {
            window.addEventListener('message', handler)
        }

        target.postMessage(message, postMessageOptions)

        setTimeoutId = setTimeout(() => {
            console.warn(
                'message was not acknowledged within ' + options.timeout ||
                    2000 + 'ms.'
            )
            cleanUpAndExit(null)
        }, options.timeout || 2000)
    })

// signal that it's loaded so we can start receiving commands
window.parent.postMessage({ topic: 'iframe-loaded' }, { targetOrigin: '*' })
