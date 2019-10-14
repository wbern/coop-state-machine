// Important note: gameService must interact
// with the vuex store for data that should be undo/redo-able

export const gameService = new (function() {
    this.connectStore = function(store) {
        this.store = store
    }

    this.getGameState = function(store) {
        const { state } = store;

        return {
            worldCoords: state.worldCoords,
        }
    }

    this.processAction = function(actionObj, store) {
        switch (actionObj.action) {
            case 'build':
                store.commit('setWorldCoords', {
                    coords: { x: 12, y: 12, z: 0 },
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
