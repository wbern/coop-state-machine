export const logService = new (function() {
    this.log = function(text) {
        window.dispatchEvent(
            new CustomEvent('output', {
                detail: text,
            })
        )
    }
})()

window.logService = logService
export default logService
