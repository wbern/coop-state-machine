// Important note: gameService must interact
// with the vuex store for data that should be undo/redo-able

import { Subject, BehaviorSubject } from 'rxjs'

import runnerService from './runnerService'
import logService from './logService'

export const gameService = new (function() {
    this.connectStore = function(store) {
        this.store = store
    }

    this.gameConstants = {
        initialTurns: 1,
        maxPoints: 100,
        turnsMultiplier: 0.1,
        maxPhilosophies: 3,
    }

    this.generateUsefulGameState = function(state) {
        return {
            // stuff like worldCoords, etc
            ...state,
            // while there may be more added here later,
            // there are more helper-like functions like getClosestBuilding()
            // inside the web workers helper functions object.
            // look in helpers-code.js for details
        }
    }

    this.disabledUserScriptsPending = []
    this.disabledUserScripts = []

    this.userCodes = {}
    this.userCodesPending = {}

    this.setDisabledUserScripts = function(vueInstance, users) {
        if (vueInstance.$store.state.currentTurn === 0) {
            // start respecting the disabled users
            this.disabledUserScripts = [...users]
        } else {
            this.disabledUserScriptsPending = users
        }
    }

    this.isGameStarted = function(vueInstance) {
        return vueInstance.$store.state.currentTurn > 0
    }

    this.onStartOver = new Subject()
    this.onGameBusyChange = new BehaviorSubject()
    this.startOver = function(vueInstance) {
        console.log('going back to start')
        vueInstance.$store.commit('emptyState')

        this.onStartOver.next()
    }

    this.acceptCodeChangesFromId = function(vueInstance, id) {
        this.userCodes[id] = this.userCodesPending[id] || this.userCodes[id]
    }

    this.acceptCodeChangesFromRoom = function(vueInstance) {
        this.disabledUserScripts = [...this.disabledUserScriptsPending]
        let newUserCodes = { ...this.userCodes, ...this.userCodesPending }

        this.disabledUserScripts.forEach(id => {
            newUserCodes[id]
        })

        this.userCodes = newUserCodes
    }

    this.setCode = function(vueInstance, id, code) {
        const codeIsDisabled = !this.disabledUserScripts.every(
            _id => _id !== id
        )

        if (codeIsDisabled || this.isGameStarted(vueInstance)) {
            this.userCodesPending[id] = code
        } else {
            this.userCodes[id] = code
        }
    }

    this.syncCodesToRunner = function(vueInstance) {
        runnerService.setCodes(this.userCodes)
    }

    // most likely to be used by the local player's code
    this.syncSpecificUserCodeToRunner = function(
        vueInstance,
        id,
        untrustedCode = true
    ) {
        runnerService.setCode(id, this.userCodes[id], untrustedCode)
    }

    this.gotoTurn = async function(vueInstance, turnNumber) {
        if (typeof turnNumber !== 'number') {
            throw new Error('invalid number')
        }

        if (vueInstance.$store.state.currentTurn > turnNumber) {
            return this.rewindTurn(vueInstance, turnNumber)
        } else if (vueInstance.$store.state.currentTurn < turnNumber) {
            return this.nextTurn(vueInstance, turnNumber)
        } else {
            // already at the turn that was requested
            throw new Error('already at the requested turn')
        }
    }

    this.rewindTurn = async function(
        vueInstance,
        requestedTurnNumber = vueInstance.$store.state.currentTurn - 1
    ) {
        let gameAlreadyBusy = this.onGameBusyChange.value
        if (!gameAlreadyBusy) {
            this.onGameBusyChange.next(true)
        }

        if (requestedTurnNumber === 0) {
            // go back to start
            this.startOver(vueInstance)
        } else if (
            requestedTurnNumber > 0 &&
            vueInstance.$store.state.currentTurn > requestedTurnNumber
        ) {
            // go back
            do {
                if (vueInstance.canUndo) {
                    console.log('undoing one step')
                    vueInstance.undo()
                } else {
                    throw new Error(
                        'cannot undo to requested turn, for some reason'
                    )
                }
            } while (vueInstance.$store.state.currentTurn > requestedTurnNumber)
        }

        if (!gameAlreadyBusy) {
            this.onGameBusyChange.next(false)
        }
    }

    this.nextTurn = async function(
        vueInstance,
        requestedTurnNumber = vueInstance.$store.state.currentTurn + 1
    ) {
        let gameAlreadyBusy = this.onGameBusyChange.value
        if (!gameAlreadyBusy) {
            this.onGameBusyChange.next(true)
        }

        while (requestedTurnNumber > vueInstance.$store.state.currentTurn) {
            if (vueInstance.canRedo) {
                console.log('redoing one step')
                vueInstance.redo()
            } else {
                // tick
                console.log('ticking one step')
                vueInstance.$store.commit('beginNextTurn')
                logService.log('TURN #' + vueInstance.$store.state.currentTurn)

                let lastKnownState

                await runnerService.tick(
                    this.generateUsefulGameState(vueInstance.$store.state),
                    (name, action, lastKnownState) => {
                        lastKnownState = this.processAction(
                            name,
                            action,
                            vueInstance.$store
                        )
                        return lastKnownState
                    },
                    this.disabledUserScripts
                )
            }

            logService.log(
                'END OF TURN #' + vueInstance.$store.state.currentTurn
            )
        }

        if (!gameAlreadyBusy) {
            this.onGameBusyChange.next(false)
        }
    }

    this.pausePlay = function() {
        this.pauseRequested = true
    }

    // like nextTurn but with delay
    this.playTurns = async function(vueInstance, requestedTurnNumber, delayMs) {
        let gameAlreadyBusy = this.onGameBusyChange.value
        if (!gameAlreadyBusy) {
            this.onGameBusyChange.next(true)
        }

        this.pauseRequested = false

        while (
            requestedTurnNumber > vueInstance.$store.state.currentTurn &&
            !this.pauseRequested
        ) {
            const startMs = performance.now()

            await this.nextTurn(
                vueInstance,
                vueInstance.$store.state.currentTurn + 1
            )

            const executionTimeMs = startMs - performance.now()

            if (executionTimeMs > delayMs) {
                console.warn(
                    'turn took longer than the requested delay, artificial delays are removed to compensate as usual but the play is now slower than usual. (' +
                        executionTimeMs +
                        'ms vs the requested ' +
                        delayMs +
                        ')'
                )
            }

            if (!this.pauseRequested) {
                // a sleep function
                await new Promise(resolve =>
                    setTimeout(resolve, Math.max(0, delayMs - executionTimeMs))
                )
            } else {
                console.log(
                    'stopped play execution because the user requested it.'
                )
            }
        }

        if (!gameAlreadyBusy) {
            this.onGameBusyChange.next(false)
        }
    }

    this.processAction = function(name, submittedAction, store) {
        this.ensurePlayerState(store, name)

        const gameState = store.state
        const playerState = gameState.playerStates[name]
        const lastAction = playerState.actions[playerState.actions.length - 1]

        let repeatAction =
            lastAction &&
            submittedAction.action === lastAction.action &&
            !lastAction.complete

        // for easier interpretation, repeats are essentially the last action plus more stuff
        let currentAction = repeatAction ? lastAction : submittedAction

        const philosophiesAreDefined =
            currentAction.philosophies &&
            Array.isArray(currentAction.philosophies) &&
            currentAction.philosophies.length > 0

        try {
            switch (submittedAction.action) {
                case 'move':
                    store.commit('setPlayerPosition', {
                        name,
                        coords: submittedAction.coords,
                    })
                    store.commit('recordPlayerAction', {
                        name,
                        ...submittedAction,
                        success: true,
                        complete: true,
                    })
                    logService.log(
                        'player ' +
                            name +
                            ' moved to ' +
                            JSON.stringify(submittedAction.coords) +
                            '.'
                    )
                    break
                case 'build':
                    if (playerState.position !== undefined) {
                        if (philosophiesAreDefined) {
                            if (
                                currentAction.philosophies.some(
                                    p =>
                                        p.integration < 0 ||
                                        p.speed < 0 ||
                                        p.integration + p.speed >
                                            this.gameConstants.maxPoints
                                )
                            ) {
                                throw new Error(
                                    'even for a philosophy, speed and integration total cannot be over ' +
                                        this.gameConstants.maxPoints +
                                        ' points, and neither can be under 0. Nice try!'
                                )
                            }

                            if (
                                currentAction.philosophies.length >
                                this.gameConstants.maxPhilosophies
                            ) {
                                throw new Error(
                                    'cannot specify over ' +
                                        this.gameConstants.maxPhilosophies +
                                        ' philosophies'
                                )
                            }
                        }

                        let coords = {
                            ...playerState.position,
                        }
                        delete coords.z

                        let hasBottomLevel = !!(
                            gameState.worldCoords[coords.x] &&
                            gameState.worldCoords[coords.x][coords.y] &&
                            gameState.worldCoords[coords.x][coords.y][0]
                        )

                        let buildingHeight = hasBottomLevel
                            ? gameState.worldCoords[coords.x][coords.y].filter(
                                  b => b
                              ).length
                            : 0

                        let nextAvailableZLevel = hasBottomLevel
                            ? buildingHeight
                            : 0

                        let getBonusValuesOfBuilding = building => {
                            let integration = 0
                            let speed = 0

                            if (building) {
                                building.forEach(block => {
                                    if (block) {
                                        integration + block.integration || 0

                                        // also account for philosophy
                                        if (philosophiesAreDefined) {
                                            currentAction.philosophies.forEach(
                                                philosophy => {
                                                    if (
                                                        block.philosophies &&
                                                        Array.isArray(
                                                            currentAction.philosophies
                                                        ) &&
                                                        block.philosophies
                                                            .length > 0
                                                    ) {
                                                        // block has philosophies, let's compare
                                                        let blockHasMatchingPhilosophy = block.philosophies.some(
                                                            p =>
                                                                p &&
                                                                philosophy.name ===
                                                                    p.name
                                                        )

                                                        if (
                                                            blockHasMatchingPhilosophy
                                                        ) {
                                                            // a good thing, utilize the extra points
                                                            integration += Math.max(
                                                                0,
                                                                philosophy.integration
                                                            )
                                                            speed += Math.max(
                                                                0,
                                                                philosophy.speed
                                                            )
                                                        } else {
                                                            // this is bad, give a negative addition instead
                                                            integration -= Math.max(
                                                                0,
                                                                philosophy.integration
                                                            )
                                                            speed -= Math.max(
                                                                0,
                                                                philosophy.speed
                                                            )
                                                        }
                                                    }
                                                }
                                            )
                                        }
                                    }
                                })
                            }

                            return {
                                speed,
                                integration,
                            }
                        }

                        let getBuildingHeight = building => {
                            let height = 0

                            if (building) {
                                height = building.filter(b => b).length
                            }

                            return height
                        }

                        // bonus values are based on the philosophies
                        let bonusValuesInRegion = { integration: 0, speed: 0 }
                        let buildingBlocksInRegion = 0

                        for (let x = coords.x - 1; x < coords.x + 1; x++) {
                            if (x > 0) {
                                for (
                                    let y = coords.y - 1;
                                    y < coords.y + 1;
                                    y++
                                ) {
                                    if (y > 0) {
                                        if (
                                            gameState.worldCoords[x] &&
                                            gameState.worldCoords[x][y]
                                        ) {
                                            buildingBlocksInRegion += getBuildingHeight(
                                                gameState.worldCoords[x][y]
                                            )
                                            let bonusValues = getBonusValuesOfBuilding(
                                                gameState.worldCoords[x][y]
                                            )

                                            Object.keys(bonusValues).forEach(
                                                key => {
                                                    bonusValuesInRegion[key] =
                                                        (bonusValuesInRegion[
                                                            key
                                                        ] || 0) +
                                                        (bonusValues[key] || 0)
                                                }
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        let justStarted = null

                        if (!repeatAction) {
                            // it's a new action because the name changed, or the old action completed

                            // validate points allocation
                            if (
                                typeof submittedAction.speed !== 'number' &&
                                typeof submittedAction.integration === 'number'
                            ) {
                                submittedAction.speed =
                                    this.gameConstants.maxPoints -
                                    Math.max(0, submittedAction.integration)
                                logService.log(
                                    'player ' +
                                        name +
                                        ' did not supply speed value, setting to ' +
                                        submittedAction.speed +
                                        '..'
                                )
                            } else if (
                                typeof submittedAction.speed === 'number' &&
                                typeof submittedAction.integration !== 'number'
                            ) {
                                submittedAction.integration =
                                    this.gameConstants.maxPoints -
                                    Math.max(0, submittedAction.speed)
                                logService.log(
                                    'player ' +
                                        name +
                                        ' did not supply integration value, setting to ' +
                                        submittedAction.integration +
                                        '..'
                                )
                            } else if (
                                typeof submittedAction.speed !== 'number' ||
                                typeof submittedAction.integration !== 'number'
                            ) {
                                submittedAction.speed = 50
                                submittedAction.integration = 50
                                logService.log(
                                    'player ' +
                                        name +
                                        ' did not supply speed and integration values, setting both to 50..'
                                )
                            }

                            if (
                                submittedAction.speed < 0 ||
                                submittedAction.integration < 0 ||
                                submittedAction.speed +
                                    submittedAction.integration >
                                    this.gameConstants.maxPoints
                            ) {
                                throw new Error(
                                    'speed and integration total cannot be over ' +
                                        this.gameConstants.maxPoints +
                                        ' points, and neither can be under 0. Nice try!'
                                )
                            }

                            let initialTurnsLeft =
                                // initial cost minus speed, which philosophies might alleviate (or worsen)
                                (this.gameConstants.maxPoints -
                                    submittedAction.speed -
                                    bonusValuesInRegion.speed +
                                    // add the tech debt from previous lack of speed, which philosophies might alleviate (or worsen)
                                    buildingBlocksInRegion *
                                        this.gameConstants.maxPoints -
                                    bonusValuesInRegion.integration) *
                                // speed up the process a tad
                                this.gameConstants.turnsMultiplier

                            // sanitize the number
                            initialTurnsLeft = Math.max(
                                Math.round(initialTurnsLeft),
                                0
                            )

                            logService.log(
                                'player ' +
                                    name +
                                    ' started building at ' +
                                    JSON.stringify(coords) +
                                    (hasBottomLevel
                                        ? ' (will build vertically)'
                                        : '') +
                                    ', ' +
                                    initialTurnsLeft +
                                    ' turns left.'
                            )
                            justStarted = true

                            // set the progress
                            store.commit('setPlayerProgress', {
                                name,
                                turnsLeft: initialTurnsLeft,
                            })
                        } else {
                            // we're repeating action since last time
                            // decrease turns left by 1
                            store.commit('setPlayerProgress', {
                                name,
                                turnsLeft: playerState.turnsLeft - 1,
                            })
                        }

                        // now, is the player finished or not?
                        if (playerState.turnsLeft === 0) {
                            // finished, place the building
                            store.commit('setWorldCoords', {
                                coords: { ...coords, z: nextAvailableZLevel },
                                data: {
                                    type: 'buildings/buildingTiles_000.png',
                                    integration: currentAction.integration || 0,
                                    philosophies: currentAction.philosophies,
                                },
                            })

                            store.commit('recordPlayerAction', {
                                name,
                                ...currentAction,
                                success: true,
                                complete: true,
                                turnsLeft: playerState.turnsLeft,
                            })

                            logService.log(
                                'player ' +
                                    name +
                                    ' finished building at ' +
                                    JSON.stringify(coords) +
                                    ' (block level: ' +
                                    nextAvailableZLevel +
                                    ')'
                            )
                        } else {
                            store.commit('recordPlayerAction', {
                                name,
                                ...currentAction,
                                success: true,
                                complete: false,
                                turnsLeft: playerState.turnsLeft,
                            })

                            if (!justStarted) {
                                logService.log(
                                    'player ' +
                                        name +
                                        ' is building at ' +
                                        JSON.stringify(coords) +
                                        (hasBottomLevel
                                            ? ' (will build vertically)'
                                            : '') +
                                        ', ' +
                                        playerState.turnsLeft +
                                        ' turns left.'
                                )
                            }
                        }
                    } else {
                        logService.log(
                            'player ' +
                                name +
                                ' attempted to build without moving to a XY position prior to it.'
                        )

                        store.commit('recordPlayerAction', {
                            name,
                            ...submittedAction,
                            success: false,
                            complete: true,
                        })
                    }

                    break
                default:
                    throw new Error('invalid command type')
            }
        } catch (e) {
            logService.log(
                'player ' +
                    name +
                    ' attempted an incorrect action. See devtools for detailed output.'
            )

            console.error(e)

            store.commit('recordPlayerAction', {
                name,
                ...submittedAction,
                success: false,
                complete: true,
            })
        }

        return gameState
    }

    this.ensurePlayerState = function(store, name) {
        if (!store.state.playerStates[name]) {
            store.commit('createEmptyPlayerState', name)
        }
    }
})()

window.gameService = gameService
export default gameService
