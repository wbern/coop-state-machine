export const getUniqueId = () =>
    window.crypto.getRandomValues(new Uint32Array(1))[0]

export const isTopicObject = obj => typeof obj === 'object' && obj !== null

export const postMessageAck = (target, receivedMessage, postMessageOptions) => {
    let topicObject = isTopicObject(receivedMessage)

    if (topicObject) {
        target.postMessage(receivedMessage.topic + '-ack', postMessageOptions)
    } else {
        target.postMessage(receivedMessage + '-ack', postMessageOptions)
    }
}

export const postMessageWait = (
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
