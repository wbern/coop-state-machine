// Important note: gameService must interact
// with the vuex store for data that should be undo/redo-able

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
        turnNumber = vueInstance.$store.state.currentTurn - 1
    ) {
        if (turnNumber === 0) {
            // go back to start
            console.log('going back to start')
            vueInstance.$store.commit('emptyState')
        } else if (vueInstance.$store.state.currentTurn > turnNumber) {
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
            } while (vueInstance.$store.state.currentTurn > turnNumber)
        }
    }

    this.nextTurn = async function(
        vueInstance,
        turnNumber = vueInstance.$store.state.currentTurn + 1
    ) {
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
                    }
                )
            }
        } while (vueInstance.$store.state.currentTurn < turnNumber)
    }

    this.processAction = function(name, actionObj, store) {
        this.ensurePlayerState(store, name)

        switch (actionObj.action) {
            case 'move':
                store.commit('setPlayerPosition', {
                    name,
                    coords: actionObj.coords,
                })
                store.commit('recordPlayerAction', {
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
                } else {
                    logService.log(
                        'player ' +
                            name +
                            ' attempted to build without moving to a XY position prior to it.'
                    )
                }

                break
            default:
                logService.log(
                    'player ' + name + ' attempted an incorrect action.'
                )

                store.commit('recordPlayerAction', {
                    ...actionObj,
                    success: false,
                    completed: false,
                })

                break
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
