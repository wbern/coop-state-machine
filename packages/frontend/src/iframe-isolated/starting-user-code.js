function main(helpers, gameState, playerState, lastAction) {
    // Hi there! Want to get started?
    // Focus this editor, press `Ctrl + Space` and type "action" to get suggestions.

    debugger;

    if (gameState.currentTurn === 1) {
        return {
            action: 'move',
            coords: gameState.tallestBuilding
        }
    }

    return {
        action: 'build'
    }

    // When you're done, try the play controls under the game view
}
