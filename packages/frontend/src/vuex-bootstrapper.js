import ImplicitVue from 'vue'
import Vuex from 'vuex'
import VuexUndoRedo from 'vuex-undo-redo'

let Vue = ImplicitVue

const setup = _Vue => {
    Vue = _Vue
    _Vue.use(Vuex)
    _Vue.use(VuexUndoRedo /*, { ignoreMutations: ['toggleGrid'] }*/)
}

let latestWorldCreationOptions

const createWorldCoords = options => {
    const defaults = {
        initialSizeX: 0,
        initialSizeY: 0,
        maxSizeX: 6,
        maxSizeY: 6,
        initialFloors: 0,
        randomizeBuildings: false,
    }

    let o = { ...defaults, ...options }

    latestWorldCreationOptions = o

    let created = new Array(o.maxSizeX + o.initialSizeX)
        .fill(1, o.maxSizeX, o.maxSizeX + o.initialSizeX)
        .map(x =>
            new Array(o.maxSizeY + o.initialSizeY)
                .fill(1, o.maxSizeY, o.maxSizeY + o.initialSizeY)
                .map(
                    y =>
                        // z (floors)
                        new Array(o.maxSizeZ)
                )
        )

    if (o.randomizeBuildings || o.initialFloors > 0) {
        for (
            let xIndex = o.maxSizeX;
            xIndex < o.maxSizeX + o.initialSizeX;
            xIndex++
        ) {
            for (
                let yIndex = o.maxSizeY;
                yIndex < o.maxSizeY + o.initialSizeY;
                yIndex++
            ) {
                created[xIndex][yIndex] = (o.randomizeBuildings
                    ? new Array(Math.max(Math.floor(Math.random() * 10) - 6, 0))
                    : new Array(o.initialFloors)
                )
                    .fill(1)
                    .map(z => ({
                        type: 'buildings/buildingTiles_000.png',
                    }))
            }
        }
    }
    // created.forEach(row =>
    //     row.forEach(
    //         cell =>
    //             (cell = new Array(
    //                 Math.max(Math.floor(Math.random() * 10) - 7, 0)
    //             )
    //                 .fill(1)
    //                 .map(z => ({
    //                     type: 'buildings/buildingTiles_000.png',
    //                 })))
    //     )
    // )
    // } else if (this.initialFloors > 0) {
    //     created.forEach(row =>
    //         row.forEach(
    //             cell =>
    //                 (cell = new Array(this.initialFloors)
    //                     .fill(1)
    //                     .map(z => ({
    //                         type: 'buildings/buildingTiles_000.png',
    //                     })))
    //         )
    //     )
    // }

    return created
}

export const getDefaultState = () => ({
    worldCoords: createWorldCoords(),
    worldSettings: { ...latestWorldCreationOptions },
    playerStates: {},
    currentTurn: 0,
})

// Make sure to call Vue.use(Vuex) first if using a module system
export const createStore = _Vue => {
    setup(_Vue || ImplicitVue)

    return new Vuex.Store({
        state: getDefaultState(),
        mutations: {
            beginNextTurn(state) {
                state.currentTurn++
            },
            resetWorldCoords(state, payload) {
                state.worldCoords = createWorldCoords(payload)
                state.worldSettings = { ...latestWorldCreationOptions }
            },
            setWorldCoords(state, payload) {
                let wc = this.state.worldCoords
                let c = payload.coords

                if (c.y - (c.z || 0) < 0) {
                    throw new Error(
                        'cannot break the positive 3D dimensions, sorry'
                    )
                }

                wc = wc || new Array(0)

                // x
                wc[c.x] = wc[c.x] || new Array(0)

                // y
                wc[c.x][c.y] = wc[c.x][c.y] || new Array(0)

                // z
                // s[c.x][c.y][c.z || 0] = s[c.x][c.y][c.z || 0] || []

                // set data
                wc[c.x][c.y][c.z || 0] = payload.data

                // to trigger vue's reactivity
                Vue.set(this.state.worldCoords, this.state.worldCoords)
                // this.state.worldCoords = [...this.state.worldCoords];
            },
            // player-related
            createEmptyPlayerState(state, payload) {
                state.playerStates[payload] = {
                    actions: [],
                }
            },
            setPlayerPosition(state, payload) {
                state.playerStates[payload.name].position = payload.coords
            },
            setPlayerProgress(state, payload) {
                // turns left until build/move actions finish, etc
                state.playerStates[payload.name].turnsLeft = payload.turnsLeft
            },
            recordPlayerAction(state, payload) {
                if (typeof payload.name !== 'string') {
                    throw new Error('name is not defined or is not a string')
                }

                state.playerStates[payload.name].actions.push(payload)
            },
            // needed for undo/redo plugin
            emptyState() {
                this.replaceState(getDefaultState())
            },
        },
    })
}
