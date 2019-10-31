/* USER_CODE */

// 
// END OF YOUR CODE
// -----------------------
self.onmessage = function(event) {
    if (event.data && event.data.topic === 'tick') {
        const userFnWrapper = function(
            helpers,
            gameState,
            playerState,
            lastAction
        ) {
            // user must have defined a main method

            /* global main */
            if (main && typeof main === 'function') {
                let result = main(helpers, gameState, playerState, lastAction)

                if (Object.getOwnPropertyNames(result || {}).length > 0) {
                    return result
                }
            }

            // default action
            return { action: 'skip' }
        }

        let userFnOut

        try {
            const filteredGameState = { ...event.data.state }
            // not sure why these are present
            delete filteredGameState.topic
            delete filteredGameState.callId

            let playerStates = event.data.state.playerStates || {}
            let playerState = playerStates[event.data.name] || {}

            let playerActions = playerState.actions || []
            let lastAction =
                playerActions.length > 0
                    ? playerActions[playerActions.length - 1]
                    : null

            userFnOut = new userFnWrapper(
                /* global getHelpersObject */
                getHelpersObject(filteredGameState, playerState, lastAction),
                filteredGameState,
                playerState,
                lastAction
            )
        } catch (e) {
            userFnOut = { action: 'worker-error', error: e.toString() }
        }

        self.postMessage(
            JSON.stringify({
                topic: 'tick-ack',
                callId: event.data.callId,
                ackData: userFnOut,
            })
        )
    }
}

// HELPERS GENERATION CODE, gets assigned to window
/* IFRAME_WEBWORKER_HELPERS_CODE */
