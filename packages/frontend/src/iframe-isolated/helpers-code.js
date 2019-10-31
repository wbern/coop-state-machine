var getHelpersObject = (gameState, playerState, lastAction) => ({
    getTallestBuilding: () => {
        let tallestNumber = 0
        let coords = null

        gameState.worldCoords.forEach((cols, x) => {
            cols.forEach((row, y) => {
                if (row.length > tallestNumber || coords === null) {
                    tallestNumber = row.length
                    coords = {
                        x,
                        y,
                    }
                }
            })
        })

        return coords
    },
    getClosestBuilding: () => {
        // get the distance
        let d = (x, y) => {
            return Math.pow(x, 2) + Math.pow(y, 2)
        }

        let closestDistance = null
        let closestPoint = null

        // does the player even have a position yet?
        if (
            gameState.playerStates[name] &&
            gameState.playerStates[name].position
        ) {
            // get the closest point from the player (not including where player is standing)
            gameState.worldCoords.forEach((col, x) => {
                if (col) {
                    col.forEach((cell, y) => {
                        if (
                            cell &&
                            (gameState.playerStates[name].position.x !== x ||
                                gameState.playerStates[name].position.y !== y)
                        ) {
                            let distance = d(x, y)
                            if (
                                closestDistance === null ||
                                closestDistance > distance
                            ) {
                                closestDistance = distance
                                closestPoint = { x, y }
                            }
                        }
                    })
                }
            })
        }

        return closestPoint
    },
})
