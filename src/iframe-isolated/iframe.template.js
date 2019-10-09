// this code is isolated inside an iframe, and will not run any user-submitted javascript

const createWorker = workerCode => {
    // returns a wrapper that helps communicate more easily with the worker
    return new (function() {
        const boilerplateWorkerCode = `
                    /* IFRAME_WEBWORKER_CODE */
                    `
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
                    'could not parse webworker message to JSON: ' + event.data
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

        this.terminate = () => worker.terminate()
        this.postMessage = worker.postMessage

        this.tick = (state, timeout = 2000) =>
            postMessageWait(worker, { topic: 'tick', state }, undefined, {
                timeout,
            })
    })()
}

window.addEventListener('message', event => {
    console.log('message from parent: ', (event || {}).data)

    switch (event.data.topic) {
        case 'add-webworker-once':
            // a more generic close command for more cleanups than webworkers
            // .. For now it's just closing the web workers though
            let onceWorker = createWorker(event.data.workerCode)

            onceWorker
                .tick(event.data.state, event.data.timeout || 2000)
                .then(result => {
                    onceWorker.terminate()

                    window.parent.postMessage(
                        {
                            topic: 'add-webworker-once-ack',
                            id: event.data.id,
                            ackData: result ? result.ackData : null,
                        },
                        { targetOrigin: '*' }
                    )
                })

            break
        case 'add-webworker':
            workers.push(createWorker(event.data.workerCode))
            window.parent.postMessage(
                { topic: 'add-webworker-ack', id: event.data.id },
                { targetOrigin: '*' }
            )
            break
        case 'tick-webworkers':
            workers.forEach(worker => {
                worker.postMessage({
                    name: 'tick',
                    ...(event.data.tickData || {}),
                })
            })
        case 'close':
            // a more generic close command for more cleanups than webworkers
            // .. For now it's just closing the web workers though
            workers.filter(worker => {
                worker.terminate()
                return false
            })
            window.parent.postMessage(
                { topic: 'close-ack', id: event.data.id },
                { targetOrigin: '*' }
            )
            break
        case 'close-webworkers':
            workers.filter(worker => {
                worker.terminate()
                return false
            })
            window.parent.postMessage(
                { topic: 'close-webworkers-ack', id: event.data.id },
                { targetOrigin: '*' }
            )
            break
        default:
            console.warn('topic not implemented: ' + event.data.topic)
            break
    }
})

let workers = []

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

const postMessageWait = (
    target,
    message,
    postMessageOptions,
    options = {}
) =>
    new Promise((resolve, reject) => {
        let topicObject = isTopicObject(message)
        let isWebWorker = false

        try {
            isWebWorker = !!target.onmessage
        } catch (e) {
            // not a webworker anyway if this caused cross-origin errors
        }

        let closeHandler

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
                window.removeEventListener('message', closeHandler)
            }

                        resolve(data)
        }

        let onMessage = event => {
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
            
            target.onmessage = onMessage
        } else {
            closeHandler = window.addEventListener('message', onMessage)
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
