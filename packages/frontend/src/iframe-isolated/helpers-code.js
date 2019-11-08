var getHelpersObject = (gameState, playerState, lastAction) =>
    new (function() {
        this.getTallestBuilding = function() {
            let tallestNumber = 0
            let coords = null

            gameState.worldCoords.forEach((col, x) => {
                if (col) {
                    col.forEach((row, y) => {
                        if (
                            row &&
                            (row.length > tallestNumber || coords === null)
                        ) {
                            tallestNumber = row.length
                            coords = {
                                x,
                                y,
                            }
                        }
                    })
                }
            })

            return coords
        }
        this.getClosestSwedishOpenSpace = function() {
            // because why would you ever want to sit next to someone?
            return this.getClosestOpenSpace(2)
        }
        this.getClosestOpenSpace = function(space = 0) {
            let closestDistance = null
            let closestOpenPoint = null

            let position = this._getPlayerPositionOrCenterOfWorld()
            let worldSize = this.getSizeOfWorld()

            // get the closest point from the player (not including where player is standing)
            for (let x = 0; x < worldSize.width; x++) {
                for (let y = 0; y < worldSize.height; y++) {
                    if (
                        (!gameState.worldCoords[x] ||
                            !gameState.worldCoords[x][y]) &&
                        (position.x !== x || position.y !== y) &&
                        // don't be within the space of the current position
                        (x < position.x - space || x > position.x + space) &&
                        (y < position.y - space || y > position.y + space)
                    ) {
                        let distance = Math.hypot(
                            position.x - x,
                            position.y - y
                        )

                        if (
                            closestDistance === null ||
                            closestDistance > distance
                        ) {
                            closestDistance = distance
                            closestOpenPoint = { x, y }
                        }
                    }
                }
            }

            return closestOpenPoint
        }
        this._getPlayerPositionOrCenterOfWorld = function() {
            let playerHasPosition =
                gameState.playerStates[name] &&
                gameState.playerStates[name].position

            let position = {}
            if (playerHasPosition) {
                position = gameState.playerStates[name].position
            } else {
                // just start from the center
                position.x = Math.round(gameState.worldCoords.length / 2)

                let worldSize = this.getSizeOfWorld()

                position.y = Math.round(worldSize.height / 2)
            }

            return position
        }
        this.getSizeOfWorld = function() {
            return {
                width: gameState.worldSettings.maxSizeX,
                height: gameState.worldSettings.maxSizeY,
            }

            // let width = gameState.worldCoords.length
            // let height = 0
            // gameState.worldCoords.forEach(c => {
            //     if (c && height < c.length) {
            //         height = c.length
            //     }
            // })

            // return { height, width }
        }
        this.getClosestBuilding = function() {
            let closestDistance = null
            let closestPoint = null

            let position = this._getPlayerPositionOrCenterOfWorld()
            // get the closest point from the player (not including where player is standing)
            gameState.worldCoords.forEach((col, x) => {
                if (col) {
                    col.forEach((cell, y) => {
                        if (cell && (position.x !== x || position.y !== y)) {
                            let distance = Math.hypot(
                                position.x - x,
                                position.y - y
                            )

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

            return closestPoint
        }
    })()
