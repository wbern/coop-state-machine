// Important note: gameService must interact
// with the vuex store for data that should be undo/redo-able

import { Subject } from 'rxjs'

import runnerService from './runnerService'
import logService from './logService'

export const gameService = new (function() {
    this.connectStore = function(store) {
        this.store = store
    }

    // this.getGameState = function(store) {
    //     const { state } = store

    //     return {
    //         worldCoords: state.worldCoords,
    //         playerStates: state.playerStates,
    //     }
    // }

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
        if (requestedTurnNumber > vueInstance.$store.state.currentTurn) {
            do {
                if (vueInstance.canRedo) {
                    console.log('redoing one step')
                    vueInstance.redo()
                } else {
                    // tick
                    console.log('ticking one step')
                    vueInstance.$store.commit('beginNextTurn')

                    let lastKnownState

                    await runnerService.tick(
                        vueInstance.$store.state,
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

                        store.commit('setWorldCoords', {
                            coords,
                            data: {
                                type: 'buildings/buildingTiles_000.png',
                            },
                        })
                        logService.log(
                            'player ' +
                                name +
                                ' is building at ' +
                                JSON.stringify(coords)
                        )

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
            logService.log('player ' + name + ' attempted an incorrect action.')

            store.commit('recordPlayerAction', {
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
