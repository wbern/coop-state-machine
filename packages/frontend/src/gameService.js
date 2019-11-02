// Important note: gameService must interact
// with the vuex store for data that should be undo/redo-able

import { Subject } from 'rxjs'

import runnerService from './runnerService'
import logService from './logService'

export const gameService = new (function() {
    this.connectStore = function(store) {
        this.store = store
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

    this.setDisabledUserScripts = function(vueInstance, users) {
        if (vueInstance.$store.state.currentTurn === 0) {
            this.disabledUserScripts = [...users]
        } else {
            this.disabledUserScriptsPending = users
        }
    }

    this.isGameStarted = function(vueInstance) {
        return vueInstance.$store.state.currentTurn > 0
    }

    this.onStartOver = new Subject()
    this.onGameBusyChange = new Subject()
    this.startOver = function(vueInstance) {
        console.log('going back to start')
        vueInstance.$store.commit('emptyState')

        this.disabledUserScripts = [...this.disabledUserScriptsPending]

        this.onStartOver.next()
    }

    this.setCode = function(id, code) {
        if (this.disabledUserScripts.every(_id => _id !== id)) {
            runnerService.setCode(id, code, false)
        }
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
    }

    this.nextTurn = async function(
        vueInstance,
        requestedTurnNumber = vueInstance.$store.state.currentTurn + 1
    ) {
        this.onGameBusyChange.next(true)

        if (requestedTurnNumber > vueInstance.$store.state.currentTurn) {
            do {
                if (vueInstance.canRedo) {
                    console.log('redoing one step')
                    vueInstance.redo()
                } else {
                    // tick
                    console.log('ticking one step')
                    vueInstance.$store.commit('beginNextTurn')
                    logService.log(
                        'TURN #' + vueInstance.$store.state.currentTurn
                    )

                    let lastKnownState

                    await runnerService.tick(
                        this.generateUsefulGameState(
                            vueInstance.$store.state
                        ),
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
            } while (vueInstance.$store.state.currentTurn < requestedTurnNumber)

            logService.log(
                'END OF TURN #' + vueInstance.$store.state.currentTurn
            )

            this.onGameBusyChange.next(false)
        }
    }

    this.processAction = function(name, actionObj, store) {
        this.ensurePlayerState(store, name)

        try {
            switch (actionObj.action) {
                case 'move':
                    store.commit('setPlayerPosition', {
                        name,
                        coords: actionObj.coords,
                    })
                    store.commit('recordPlayerAction', {
                        name,
                        ...actionObj,
                        success: true,
                        completed: true,
                    })
                    logService.log(
                        'player ' +
                            name +
                            ' moved to ' +
                            JSON.stringify(actionObj.coords) +
                            '.'
                    )
                    break
                case 'build':
                    if (store.state.playerStates[name].position !== undefined) {
                        let coords = store.state.playerStates[name].position

                        logService.log(
                            'player ' +
                                name +
                                ' is building at ' +
                                JSON.stringify(coords) +
                                (store.state.worldCoords[coords.x][coords.y][
                                    coords.z || 0
                                ]
                                    ? ' (present building will be replaced)'
                                    : '')
                        )

                        store.commit('setWorldCoords', {
                            coords,
                            data: {
                                type: 'buildings/buildingTiles_000.png',
                            },
                        })

                        store.commit('recordPlayerAction', {
                            name,
                            ...actionObj,
                            success: true,
                            completed: true,
                        })
                    } else {
                        logService.log(
                            'player ' +
                                name +
                                ' attempted to build without moving to a XY position prior to it.'
                        )

                        store.commit('recordPlayerAction', {
                            name,
                            ...actionObj,
                            success: false,
                            completed: true,
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
                    ' attempted an incorrect action. See devtools for detailed json validation output.'
            )

            store.commit('recordPlayerAction', {
                name,
                ...actionObj,
                success: false,
                completed: true,
            })
        }

        return store.state
    }

    this.ensurePlayerState = function(store, name) {
        if (!store.state.playerStates[name]) {
            store.commit('createEmptyPlayerState', name)
        }
    }
})()

window.gameService = gameService
export default gameService
