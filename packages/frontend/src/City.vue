// eslint-disable vue/no-use-v-if-with-v-for
<template>
    <div id="city" class="grid">
        <div
            v-for="(undefined, screenX) in readOnlyWorldCoords.length -
                getLowestWorldX()"
            :key="screenX"
            class="grid-column"
            :data-screen-x="screenX"
        >
            <div v-if="shouldShowColumn(screenToWorldCoords(screenX).x)">
                <div
                    v-for="(cell, screenY) in worldSize.height -
                        getLowestWorldY()"
                    :data-len="worldSize.height"
                    :key="screenY"
                    :data-screen-x="screenX"
                    :data-screen-y="screenY"
                    :data-floor="
                        validFloorSpace(screenX, screenY) ? 'yes' : 'no'
                    "
                    :data-world-x="
                        validFloorSpace(screenX, screenY)
                            ? screenToWorldCoords(screenX, screenY).x
                            : (findStackSpaceCoords(screenX, screenY) || {}).x
                    "
                    :data-world-y="
                        validFloorSpace(screenX, screenY)
                            ? screenToWorldCoords(screenX, screenY).y
                            : (findStackSpaceCoords(screenX, screenY) || {}).y
                    "
                    :data-world-z="
                        (validFloorSpace(screenX, screenY) ? '0' : 'n/a') +
                            ' + ' +
                            ((findStackSpaceCoords(screenX, screenY) || {}).z ||
                                'n/a')
                    "
                >
                    <div
                        class="grid-block"
                        :class="{
                            'grid-block--valid-floor-space': validFloorSpace(
                                screenX,
                                screenY
                            ),
                            'grid-block--valid-stack-space': true,
                            'grid-block--floor-space-in-use':
                                validFloorSpace(screenX, screenY) &&
                                floorSpaceInUse(
                                    screenToWorldCoords(screenX, screenY)
                                ),
                            'grid-block--stack-space-in-use': stackSpaceInUse(
                                screenX,
                                screenY
                            ),
                            'grid-block--stack-and-floor-space-in-use':
                                validFloorSpace(screenX, screenY) &&
                                floorSpaceInUse(
                                    screenToWorldCoords(screenX, screenY)
                                ) &&
                                stackSpaceInUse(screenX, screenY),
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
                            :source="
                                getWorldCoords(
                                    screenToWorldCoords(screenX, screenY)
                                )
                            "
                            :showImages="showImages"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import BuildingBlock from './components/BuildingBlock.vue'

export default {
    name: 'City',
    components: { 'building-block': BuildingBlock },
    methods: {
        shouldShowColumn(x) {
            let columnHasContent = !!(
                this.readOnlyWorldCoords[x] &&
                this.readOnlyWorldCoords[x].some(col => !!col)
            )

            let contentBetweenColumn = false
            let contentBeforeColumn = false
            let contentAfterColumn = false
            for (let preX = 0; preX < x; preX++) {
                contentBeforeColumn =
                    contentBeforeColumn ||
                    (this.readOnlyWorldCoords[preX] &&
                        this.readOnlyWorldCoords[preX].some(col => !!col))
            }

            for (
                let postX = this.readOnlyWorldCoords.length;
                postX > this.readOnlyWorldCoords.length;
                postX--
            ) {
                contentAfterColumn =
                    contentAfterColumn ||
                    (this.readOnlyWorldCoords[postX] &&
                        this.readOnlyWorldCoords[postX].some(col => !!col))
            }

            contentBetweenColumn = contentBeforeColumn && contentAfterColumn

            return columnHasContent || contentBetweenColumn
        },
        getLowestWorldX() {
            return Math.max(
                0,
                this.$store.state.worldCoords.findIndex(
                    (val, index, arr) => index in arr
                )
            )

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
            let lowestWorldY = Math.max(
                0,
                (this.$store.state.worldCoords[lowestWorldX] || []).findIndex(
                    (val, index, arr) => index in arr
                )
            )

            // respects how tall something is in order to get the lowest y coordinate
            // we want to make sure to render tall buildings as well
            this.$store.state.worldCoords.forEach(
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

            // make sure that we are in the same column visually
            const visuallyInSameColumn = (y1, x2) => y1 % 2 === x2 % 2

            for (
                let currentY = startingScreenY + 1;
                currentY < this.$store.state.worldSettings.maxSizeY;
                currentY++
            ) {
                if (
                    this.validFloorSpace(startingScreenX, currentY) &&
                    visuallyInSameColumn(currentY, startingScreenX)
                ) {
                    let searchCoords = {
                        ...this.screenToWorldCoords(startingScreenX, currentY),
                        z: currentY - startingScreenY,
                    }

                    let res = this.getWorldCoords(searchCoords)
                    if (res) {
                        lastOneFound = res
                    }
                }
            }

            return lastOneFound
        },
        getWorldCoords(coords) {
            let value =
                this.$store.state.worldCoords[coords.x] &&
                this.$store.state.worldCoords[coords.x][coords.y] &&
                this.$store.state.worldCoords[coords.x][coords.y][coords.z || 0]

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
            this.$store.commit('setWorldCoords', { coords, data })
        },
        getFloorSpaceZ(x, y) {
            return y
        },
        getStackSpaceZ(gridX, gridY) {
            let stackSource = this.findStackSpaceCoords(gridX, gridY)

            return stackSource.y + stackSource.z
        },
        init() {
            this.$store.commit('emptyState', {
                ...this.$props,
            })
        },
    },
    created() {
        // this.init()
        window.City = this
    },
    data() {
        return {}
    },
    computed: {
        readOnlyWorldCoords() {
            return this.$store.state.worldCoords
        },
        worldSize() {
            let width = this.readOnlyWorldCoords.length
            let height = 0
            this.readOnlyWorldCoords.forEach(c => {
                if (c && height < c.length) {
                    height = c.length
                }
            })

            return { height, width }
        },
    },
    props: {
        initialSizeX: {
            type: Number,
            default: () => 0,
        },
        initialSizeY: {
            type: Number,
            default: () => 0,
        },
        maxSizeX: {
            type: Number,
            default: () => 6,
        },
        maxSizeY: {
            type: Number,
            default: () => 6,
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
