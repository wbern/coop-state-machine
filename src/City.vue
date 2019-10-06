<template>
    <div id="city" class="grid">
        <div v-for="(column, gridX) in coordsData" :key="gridX" class="grid-column">
            <div
                v-for="(cell, gridY) in column"
                :key="gridY"
                :x="gridX"
                :y="gridY"
                class="grid-block"
                :class="{
                    'grid-block--valid-floor-space': validFloorSpace(gridX, gridY),
                    'grid-block--valid-stack-space': true,
                    'grid-block--floor-space-in-use': validFloorSpace(gridX, gridY) && floorSpaceInUse(gridToCoords(gridX, gridY)),
                    'grid-block--stack-space-in-use': stackSpaceInUse(gridX, gridY),
                }"
            >
                <building-block
                    type="stack"
                    :source="findStackSpaceCoords(gridX, gridY)"
                    :showImages="showImages"
                />
                <building-block
                    v-if="validFloorSpace(gridX, gridY)"
                    type="floor"
                    :source="getCoordsData(gridToCoords(gridX, gridY))"
                    :showImages="showImages"
                />
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
        getTileNumber(i) {
            // '/buildings/buildingTiles_' + getTileNumber(y * x) + '.png'

            return '000'
            // return y.toString().padStart(3, '0')
        },
        gridToCoords(gridX, gridY) {
            if (!this.validFloorSpace(gridX, gridY)) {
                throw new Error(
                    'cannot convert to coords with uneven grid coords'
                )
            }

            let xOffset = 0

            if (this.isOddSpace(gridX, gridY)) {
                xOffset = 1
            }

            const res = {
                x: (gridX - xOffset) / 2,
                y: gridY,
            }

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
            return !!this.getCoordsData(coords)
        },
        stackSpaceInUse(gridX, gridY) {
            return !!this.findStackSpaceCoords(gridX, gridY)
        },
        findStackSpaceCoords(startingGridX, startingGridY) {
            let lastOneFound

            for (let i = startingGridY + 1; i < this.size; i++) {
                if (this.validFloorSpace(startingGridX, i)) {
                    let coords = this.gridToCoords(startingGridX, i)

                    let searchCoords = {
                        x: coords.x,
                        y: coords.y,
                        z: i - startingGridY,
                    }
                    let res = this.getCoordsData(searchCoords)

                    if (
                        // * are there any floors this many rows to the right?
                        // * is floor in use?
                        // * does the floor have high enough elevation?
                        res
                    ) {
                        lastOneFound = res
                    }
                }
            }

            return lastOneFound
        },
        getCoordsData(coords) {
            let value =
                this.coordsData[coords.x] &&
                this.coordsData[coords.x][coords.y] &&
                this.coordsData[coords.x][coords.y][coords.z || 0]

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
        getFloorSpaceZ(x, y) {
            return y
        },
        getStackSpaceZ(gridX, gridY) {
            let stackSource = this.findStackSpaceCoords(gridX, gridY)

            return stackSource.y + stackSource.z
        },
        clearCoordsData() {
            this.coordsData = this.getEmptyCoordsData()
        },
        getEmptyCoordsData() {
            return new Array(this.size).fill(1).map(y =>
                // x
                new Array(this.size).fill(1).map(x =>
                    // z (floors)
                    new Array(this.initialFloors).fill(1).map(z => ({
                        type: 'buildings/buildingTiles_000.png',
                    }))
                )
            )
        },
        getRandomizedCoordsData() {
            return new Array(this.size).fill(1).map(y =>
                // x
                new Array(this.size).fill(1).map(x =>
                    // z (floors)
                    new Array(Math.max(Math.floor(Math.random() * 10) - 7, 0))
                        .fill(1)
                        .map(z => ({
                            type: 'buildings/buildingTiles_000.png',
                        }))
                )
            )
        },
        init() {
            this.coordsData = this.randomizeBuildings
                ? this.getRandomizedCoordsData()
                : this.getEmptyCoordsData()
        },
    },
    created() {
        this.init()
    },
    data() {
        return {
            coordsData: undefined,
        }
    },
    computed: {},
    props: {
        // rows: {
        //     type: Number,
        //     default: () => 12,
        // },
        // columns: {
        //     type: Number,
        //     default: () => 6,
        // },
        size: {
            type: Number,
            default: () => 10,
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
        size() {
            this.init()
        },
        initialFloors() {
            this.init()
        },
        randomizeBuildings() {
            this.init()
        },
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
    border: 1px dotted black;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
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
.grid-image {
    /* height: 4rem;
  width: 4rem; */
    /* position: absolute; */
    /* visibility: hidden; */
    width: 32px;
    height: 32px;
}
</style>
