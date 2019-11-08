function main(helpers, gameState, playerState, lastAction) {
    // Hi there! Want to get started?
    // Focus this editor, press `Ctrl + Space` and type "action" to get suggestions.

    if (
        gameState.currentTurn === 1 ||
        (lastAction.action === 'build' && lastAction.complete)
    ) {
        return {
            action: 'move',
            coords: helpers.getClosestOpenSpace()
        }
    }

    return {
        action: 'build',
        speed: 100,
        integration: 0,
        philosophies: [
            {
                name: 'react',
                speed: 100,
                integration: 0
            }
        ]
    }

    // When you're done, try the play controls under the game view
    // Pro tip: `console.log()` and `debugger;` statements for breakpoints work here!
}