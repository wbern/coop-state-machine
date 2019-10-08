import iframeHtmlTemplate from '!raw-loader!./runner-iframe.html'
import iframeJsTemplate from '!raw-loader!./runner-iframe.js'

export const runScript = (code, data = {}, timeout = 1000) => {
    const iframe = document.createElement('iframe')

    iframe.setAttribute('sandbox', 'allow-scripts')
    iframe.style.display = 'none'

    const iframeHtml = iframeHtmlTemplate
        .replace('/* WORKER_CODE */', iframeJsTemplate)
        .replace(
            '/* DATA_CODE */',
            "...JSON.parse('" + JSON.stringify(data) + "')\n"
        )
        .replace('/* USER_CODE */', code)

    iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(iframeHtml)

    window.addEventListener(
        'message',
        event => {
            debugger
            // event.data;
        },
        false
    )

    document.body.appendChild(iframe)

    // setTimeout(() => {
    //     document.body.removeChild(iframe)
    // }, timeout)
}
