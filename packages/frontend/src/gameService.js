// Important note: gameService must interact
// with the vuex store for data that should be undo/redo-able

import runnerService from './runnerService'

export const gameService = new (function() {
    this.connectStore = function(store) {
        this.store = store
    }

    this.getGameState = function(store) {
        const { state } = store

        return {
            worldCoords: state.worldCoords,
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
                    this.getGameState(vueInstance.$store),
                    (action, lastKnownState) => {
                        lastKnownState = this.processAction(
                            action,
                            vueInstance.$store
                        )
                        return lastKnownState
                    }
                )
            }
        } while (vueInstance.$store.state.currentTurn < turnNumber)
    }

    this.processAction = function(actionObj, store) {
        switch (actionObj.action) {
            case 'build':
                store.commit('setWorldCoords', {
                    coords: { x: actionObj.x, y: actionObj.y, z: actionObj.z || 0 },
                    data: {
                        type: 'buildings/buildingTiles_000.png',
                    },
                })
                break
            default:
                break
        }

        return this.getGameState(store)
    }
})()

window.gameService = gameService
export default gameService
