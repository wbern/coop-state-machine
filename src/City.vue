// eslint-disable vue/no-use-v-if-with-v-for
<template>
    <div id="city" class="grid">
        <div
            v-for="(undefined, screenX) in worldCoords.length - getLowestWorldX()"
            :key="screenX"
            class="grid-column"
            :data-screen-x="screenX"
        >
            <div
                v-for="(cell, screenY) in (worldCoords[screenToWorldCoords(screenX).x] || []).length - getLowestWorldY()"
                :data-len="(worldCoords[screenToWorldCoords(screenX).x] || []).length"
                :key="screenY"
                :data-screen-x="screenX"
                :data-screen-y="screenY"
                :data-world-x="validFloorSpace(screenX, screenY) && screenToWorldCoords(screenX, screenY).x"
                :data-world-y="validFloorSpace(screenX, screenY) && screenToWorldCoords(screenX, screenY).y"
            >
                <div
                    class="grid-block"
                    :class="{
                    'grid-block--valid-floor-space': validFloorSpace(screenX, screenY),
                    'grid-block--valid-stack-space': true,
                    'grid-block--floor-space-in-use': validFloorSpace(screenX, screenY) && floorSpaceInUse(screenToWorldCoords(screenX, screenY)),
                    'grid-block--stack-space-in-use': stackSpaceInUse(screenX, screenY),
                    'grid-block--stack-and-floor-space-in-use': validFloorSpace(screenX, screenY) && floorSpaceInUse(screenToWorldCoords(screenX, screenY)) && stackSpaceInUse(screenX, screenY)
                }"
                >
                    <!-- <span style="font-size: 8px;">Hello</span> -->
                    <building-block
                        type="stack"
                        :source="findStackSpaceCoords(screenX, screenY)"
                        :showImages="showImages"
                    />
                    <building-block
                        v-if="validFloorSpace(screenX, screenY)"
                        type="floor"
                        :source="getWorldCoords(screenToWorldCoords(screenX, screenY))"
                        :showImages="showImages"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import BuildingBlock from './components/BuildingBlock'

export default {
    name: 'City',
    components: { 'building-block': BuildingBlock },
    methods: {
        getLowestWorldX() {
            return this.worldCoords.findIndex((val, index, arr) => index in arr)

            if (isNaN(lowestWorldX)) {
                throw new Error(
                    'Easy there cowboy! there are no created world coordinates yet, probably'
                )
            }
        },
        getLowestWorldY(
            lowestWorldX = this.getLowestWorldX(),
            screenX = 0,
            bla = 0
        ) {
            // gets a starting value
            let lowestWorldY = this.worldCoords[lowestWorldX].findIndex(
                (val, index, arr) => index in arr
            )

            // respects how tall something is in order to get the lowest y coordinate
            // we want to make sure to render tall buildings as well
            this.worldCoords.forEach(
                row =>
                    Array.isArray(row) &&
                    row.forEach(
                        (cell, yIndex) =>
                            Array.isArray(cell) &&
                            cell.forEach((floor, zIndex) => {
                                if (cell && lowestWorldY > yIndex - zIndex) {
                                    lowestWorldY = yIndex - zIndex
                                }
                            })
                    )
            )

            if (lowestWorldY < 0) {
                throw new Error(
                    'building is too tall, it broke out of the dimensions'
                )
            }

            return lowestWorldY
        },
        getTileNumber(i) {
            // '/buildings/buildingTiles_' + getTileNumber(y * x) + '.png'

            return '000'
            // return y.toString().padStart(3, '0')
        },
        screenToWorldCoords(screenX, screenY) {
            if (
                !this.validFloorSpace(
                    screenX,
                    screenY !== undefined ? screenY : screenX
                )
            ) {
                throw new Error(
                    'cannot convert to coords with uneven grid coords'
                )
            }

            // make screenX and screenY equal to the world coords (first that is not "empty")
            let lowestWorldX = this.getLowestWorldX()

            let res = {}

            let lowestWorldY = this.getLowestWorldY(lowestWorldX)

            // res.x =
            //     (lowestWorldX +
            //         screenX -
            //         (this.isOddSpace(
            //             lowestWorldX + screenX,
            //             lowestWorldY +
            //                 (screenY !== undefined ? screenY : screenX)
            //         )
            //             ? 1
            //             : 0)) /
            //     2
            res.x = lowestWorldX + (screenX - (screenX % 2)) / 2

            res.y = (screenY !== undefined ? screenY : screenX) + lowestWorldY

            return res
        },
        // gridToCoords(gridX, gridY) {
        //     if (!this.validFloorSpace(gridX, gridY)) {
        //         throw new Error(
        //             'cannot convert to coords with uneven grid coords'
        //         )
        //     }

        //     let xOffset = 0

        //     if (this.isOddSpace(gridX, gridY)) {
        //         xOffset = 1
        //     }

        //     const res = {
        //         x: (gridX - xOffset) / 2,
        //         y: gridY,
        //     }

        //     return res
        // },
        isEvenSpace(gridX, gridY) {
            return gridX % 2 === 0 && gridY % 2 === 0
        },
        isOddSpace(gridX, gridY) {
            return gridX % 2 === 1 && gridY % 2 === 1
        },
        validFloorSpace(gridX, gridY) {
            return (
                this.isEvenSpace(gridX, gridY) || this.isOddSpace(gridX, gridY)
            )
        },
        floorSpaceInUse(coords) {
            return !!this.getWorldCoords(coords)
        },
        stackSpaceInUse(gridX, gridY) {
            return !!this.findStackSpaceCoords(gridX, gridY)
        },
        findStackSpaceCoords(startingScreenX, startingScreenY) {
            let lastOneFound
            let yLength

            let coords

            for (
                // let i = startingScreenY + 1 + ((startingScreenY + 1) % 2);
                let i = startingScreenY + 1;
                i < yLength || yLength === undefined;
                i++
            ) {
                if (!coords && this.validFloorSpace(startingScreenX, i)) {
                    coords = this.screenToWorldCoords(startingScreenX, i)
                }

                if (coords) {
                    if (yLength === undefined) {
                        yLength = this.worldCoords[coords.x].length
                    }

                    let searchCoords = {
                        x: coords.x,
                        y: coords.y,
                        z: i - startingScreenY,
                    }
                    let res = this.getWorldCoords(searchCoords)

                    if (
                        // * are there any floors this many rows to the right?
                        // * is floor in use?
                        // * does the floor have high enough elevation?
                        res
                    ) {
                        lastOneFound = res
                    }

                    coords.y++
                }
            }

            return lastOneFound
        },
        getWorldCoords(coords) {
            let value =
                this.worldCoords[coords.x] &&
                this.worldCoords[coords.x][coords.y] &&
                this.worldCoords[coords.x][coords.y][coords.z || 0]

            if (value) {
                return {
                    x: coords.x,
                    y: coords.y,
                    z: coords.z || 0,
                    value,
                }
            }
            return undefined
        },
        setWorldCoords(coords, data = {}) {
            let s = this.worldCoords
            let c = coords

            if (coords.y - (coords.z || 0) < 0) {
                throw new Error(
                    'cannot break the positive 3D dimensions, sorry'
                )
            }

            s = s || new Array(0)

            // x
            s[c.x] = s[c.x] || new Array(0)

            // y
            s[c.x][c.y] = s[c.x][c.y] || new Array(0)

            // z
            // s[c.x][c.y][c.z || 0] = s[c.x][c.y][c.z || 0] || []

            // set data
            s[c.x][c.y][c.z || 0] = data
        },
        getFloorSpaceZ(x, y) {
            return y
        },
        getStackSpaceZ(gridX, gridY) {
            let stackSource = this.findStackSpaceCoords(gridX, gridY)

            return stackSource.y + stackSource.z
        },
        clearCoordsData() {
            this.worldCoords = this.createWorldCoords()
        },
        createWorldCoords() {
            let created = new Array(this.maxSizeX + this.initialSizeX)
                .fill(1, this.maxSizeX, this.maxSizeX + this.initialSizeX)
                .map(x =>
                    new Array(this.maxSizeY + this.initialSizeY)
                        .fill(
                            1,
                            this.maxSizeY,
                            this.maxSizeY + this.initialSizeY
                        )
                        .map(
                            y =>
                                // z (floors)
                                new Array(this.maxSizeZ)
                        )
                )

            if (this.randomizeBuildings || this.initialFloors > 0) {
                for (
                    let xIndex = this.maxSizeX;
                    xIndex < this.maxSizeX + this.initialSizeX;
                    xIndex++
                ) {
                    for (
                        let yIndex = this.maxSizeY;
                        yIndex < this.maxSizeY + this.initialSizeY;
                        yIndex++
                    ) {
                        created[xIndex][yIndex] = (this.randomizeBuildings
                            ? new Array(
                                  Math.max(
                                      Math.floor(Math.random() * 10) - 6,
                                      0
                                  )
                              )
                            : new Array(this.initialFloors)
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
        },
        getRandomizedCoordsData() {
            return new Array(this.maxSizeX + this.initialSizeX)
                .fill(1, this.maxSizeX, this.maxSizeX + this.initialSizeX)
                .map(x =>
                    new Array(this.maxSizeY + this.initialSizeY)
                        .fill(1, this.maxSizeY, this.initialSizeY)
                        .map(y =>
                            // z (floors)
                            new Array(
                                Math.max(Math.floor(Math.random() * 10) - 7, 0)
                            )
                                .fill(1)
                                .map(z => ({
                                    type: 'buildings/buildingTiles_000.png',
                                }))
                        )
                )
        },
        init() {
            this.worldCoords = this.createWorldCoords()
        },
    },
    created() {
        this.init()
    },
    data() {
        return {
            worldCoords: undefined,
        }
    },
    computed: {},
    props: {
        initialSizeX: {
            type: Number,
            default: () => 6,
        },
        initialSizeY: {
            type: Number,
            default: () => 3,
        },
        maxSizeX: {
            type: Number,
            default: () => 12,
        },
        maxSizeY: {
            type: Number,
            default: () => 12,
        },
        initialFloors: {
            type: Number,
            default: () => 0,
        },
        showImages: {
            type: Boolean,
            default: () => true,
        },
        randomizeBuildings: {
            type: Boolean,
            default: () => true,
        },
    },
    watch: {
        initialSizeX() {
            this.init()
        },
        initialSizeY() {
            this.init()
        },
        maxSizeX() {
            this.init()
        },
        maxSizeY() {
            this.init()
        },
        initialFloors() {
            this.init()
        },
        randomizeBuildings() {
            this.init()
        },
    },
    mounted() {
        window.VueComponent = this
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#city {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}

.grid {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
.grid-column {
    display: flex;
    /* width: 100%;
    height: 100%; */
    /* flex: 1; */
    flex-direction: column;
    justify-content: center;
}
.grid-block {
    box-sizing: border-box;
    /* border: 1px solid rgba(0, 100, 255, 0.5); */
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 8vh;
    height: 4.6vh;
    max-height: 4.6vh;
    /* max-width: 16px; */
    /* height: 9px; */
    /* for stacking buildings */
    /* height: 10px; */
}
/* .grid-block--valid-stack-space {
    background: rgba(189, 66, 255, 0.1);
} */
.grid-block--valid-floor-space {
    background: rgba(0, 255, 50, 0.1);
}
.grid-block--floor-space-in-use {
    background: rgba(0, 255, 50, 1);
}
.grid-block--stack-space-in-use {
    background: rgba(200, 50, 255, 1);
}
.grid-block--stack-and-floor-space-in-use {
    background: rgba(100, 170, 255, 1);
}
.grid-image {
    /* height: 4rem;
  width: 4rem; */
    /* position: absolute; */
    /* visibility: hidden; */
    width: 32px;
    height: 32px;
}
</style>
