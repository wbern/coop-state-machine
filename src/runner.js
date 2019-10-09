import IFRAME_HTML from '!raw-loader!./iframe-isolated/iframe.html'
import IFRAME_CODE from '!raw-loader!./iframe-isolated/iframe.template.js'
import IFRAME_WEBWORKER_CODE from '!raw-loader!./iframe-isolated/webworker.template.js'

import { postMessageWait } from './postMessageBroker'

const iframeTopics = {
    close: 'close',
    'close-webworkers': 'close-webworkers',
}

export const TIMEOUT = 2000
export const TIMEOUT_DEBUG = 100000000

export const getExistingSandbox = () => document.querySelector('iframe#runner')

export const killSandbox = (timeout = TIMEOUT_DEBUG) => {
    let runnerIframe = getExistingSandbox()
    if (runnerIframe) {
        return postMessageWait(
            runnerIframe.contentWindow,
            iframeTopics.close,
            { targetOrigin: '*' },
            { timeout }
        ).then(() => runnerIframe.remove())
    } else {
        return new Promise(resolve => resolve(false))
    }
}

export const killWorkers = () => {
    let runnerIframe = getExistingSandbox()
    if (runnerIframe) {
        return postMessageWait(
            runnerIframe.contentWindow,
            iframeTopics['close-webworkers'],
            { targetOrigin: '*' },
            { timeout }
        )
    } else {
        return new Promise(resolve => resolve(false))
    }
}

export const createSandboxIfNotExists = () =>
    new Promise((resolve, reject) => {
        let existing = getExistingSandbox()

        if (existing === null) {
            try {
                const iframe = document.createElement('iframe')

                iframe.setAttribute('id', 'runner')

                iframe.setAttribute('sandbox', 'allow-scripts')
                iframe.style.display = 'none'

                const iframeHtml = IFRAME_HTML.replace(
                    '/* IFRAME_CODE */',
                    IFRAME_CODE
                ).replace('/* IFRAME_WEBWORKER_CODE */', IFRAME_WEBWORKER_CODE)
                // .replace(
                //     '/* DATA_CODE */',
                //     "...JSON.parse('" + JSON.stringify(data) + "')\n"
                // )
                // .replace('/* USER_CODE */', code)

                iframe.src =
                    'data:text/html;charset=utf-8,' + encodeURI(iframeHtml)

                let timeoutId
                let loadListener = window.addEventListener(
                    'message',
                    event => {
                        if (event.data.topic === 'iframe-loaded') {
                            if (timeoutId) {
                                clearTimeout(timeoutId)
                            }

                            window.removeEventListener('message', loadListener)

                            resolve(iframe)
                        }
                    },
                    false
                )

                document.body.appendChild(iframe)

                setTimeout(() => {
                    killSandbox()
                    reject(new Error('iframe failed to initialize'))
                }, TIMEOUT_DEBUG)
            } catch (e) {
                reject(e)
            }
        } else {
            resolve(existing)
        }
    })

export const restartSandbox = (timeout = TIMEOUT_DEBUG) =>
    killSandbox().then(createSandboxIfNotExists)

export const runScript = (code, state, options = {}) => {
    // add a web worker, run it, then exit

    const defaultOptions = {
        data: undefined,
        timeout: TIMEOUT_DEBUG,
        reuseSandbox: true,
    }

    const { data, timeout, reuseSandbox } = { ...defaultOptions, ...options }

    console.time('runScript')

    let getSandboxPromise = reuseSandbox
        ? createSandboxIfNotExists()
        : restartSandbox()

    return getSandboxPromise
        .then(sandboxIframe =>
            postMessageWait(
                sandboxIframe.contentWindow,
                { topic: 'add-webworker-once', workerCode: code, state },
                {
                    targetOrigin: '*',
                },
                { timeout: 100000000 }
            )
        )
        .then(result => {
            if (result) {
                console.timeEnd('runScript')
                return result.ackData
            } else {
                console.timeEnd('runScript')
                throw new Error('failed to execute script')
            }
        }).catch(e => {
            console.timeEnd('runScript')
            throw e
        })
}
