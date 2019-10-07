<template>
    <div id="city" class="city">
        <div class="grid">
            <!-- Screen XY starts from 0, even though the data coords/worldXY actually start much higher than 0. -->
            <div v-for="(undefined, screenY) in sizeY" :key="screenY" class="grid-row">
                <div
                    v-for="(undefined, screenX) in sizeX * 2"
                    :key="screenX"
                    :x="screenX"
                    :y="screenY"
                    class="grid-block"
                    :class="{
                    'grid-block--valid-floor-space': validFloorSpace(screenX, screenY),
                    'grid-block--valid-stack-space': true,
                    'grid-block--floor-space-in-use': validFloorSpace(screenX, screenY) && floorSpaceInUse(screenToWorldCoords(screenX, screenY)),
                    'grid-block--stack-space-in-use': stackSpaceInUse(screenX, screenY),
                }"
                >
                    <span style="font-size: 6px;">{{ screenX + ' ' + screenY }}</span>
                    <building-block
                        type="stack"
                        :source="findStackSpaceCoords(screenX, screenY)"
                        :showImages="showImages"
                    />
                    <building-block
                        v-if="validFloorSpace(screenX, screenY)"
                        type="floor"
                        :source="getCoordsData(screenToWorldCoords(screenX, screenY))"
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
        getTileNumber(i) {
            // '/buildings/buildingTiles_' + getTileNumber(y * x) + '.png'

            return '000'
            // return y.toString().padStart(3, '0')
        },
        screenToWorldCoords(screenX, screenY) {
            if (!this.validFloorSpace(screenX, screenY)) {
                throw new Error(
                    'cannot convert to coords with uneven grid coords'
                )
            }

            // make screenX and screenY equal to the world coords (first that is not "empty")
            let lowestWorldX = this.coordsData.findIndex(
                (val, index, arr) => index in arr
            )

            if (isNaN(lowestWorldX)) {
                throw new Error('there are no created world coordinates')
            }

            let lowestWorldY = this.coordsData[lowestWorldX].findIndex(
                (val, index, arr) => index in arr
            )

            let worldX =
                (lowestWorldX +
                    screenX -
                    (this.isOddSpace(
                        lowestWorldX + screenX,
                        lowestWorldY + screenY
                    )
                        ? 1
                        : 0)) /
                2
            let worldY = lowestWorldY + screenY

            return {
                x: worldX,
                y: worldY,
            }
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
        findStackSpaceCoords(startingScreenX, startingScreenY) {
            let lastOneFound

            for (let i = startingScreenY + 1; i < this.sizeY * 2; i++) {
                if (this.validFloorSpace(startingScreenX, i)) {
                    let coords = this.screenToWorldCoords(startingScreenX, i)

                    let searchCoords = {
                        x: coords.x,
                        y: coords.y,
                        z: i - startingScreenY,
                    }
                    let res = this.getCoordsData(searchCoords)

                    if (
                        // * are there any floors this many sizeY to the right?
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
            return new Array(this.maxSizeX + this.sizeX)
                .fill(1, this.maxSizeX, this.maxSizeX + this.sizeX)
                .map(x =>
                    new Array(this.maxSizeY + this.sizeY)
                        .fill(1, this.maxSizeY, this.maxSizeY + this.sizeY)
                        .map(y =>
                            // z (floors)
                            new Array(this.initialFloors).fill(1).map(z => ({
                                type: 'buildings/buildingTiles_000.png',
                            }))
                        )
                )

            // return new Array(this.maxSizeX + this.sizeX).fill(1).map(y =>
            //     // x
            //     new Array(this.sizeY).fill(1).map(x =>
            //         // z (floors)
            //         new Array(this.initialFloors).fill(1).map(z => ({
            //             type: 'buildings/buildingTiles_000.png',
            //         }))
            //     )
            // )
        },
        getRandomizedCoordsData() {
            return new Array(this.sizeX).fill(1).map(y =>
                // x
                new Array(this.sizeY).fill(1).map(x =>
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

        window.VueComponent = this;
    },
    data() {
        return {
            coordsData: undefined,
        }
    },
    computed: {},
    props: {
        sizeX: {
            type: Number,
            default: () => 3,
        },
        sizeY: {
            type: Number,
            default: () => 3,
        },
        maxSizeX: {
            type: Number,
            default: () => 5,
        },
        maxSizeY: {
            type: Number,
            default: () => 5,
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
            default: () => false,
        },
    },
    watch: {
        sizeX() {
            this.init()
        },
        sizeY() {
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
    margin-top: 60px;
}

.city {
    border: 1px dotted black;
    /* height: 400px; */
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    /* justify-content: space-between; */
}

.grid-row {
    display: flex;
    width: 100%;
    flex: 1;
}
.grid-block {
    box-sizing: border-box;
    /* border: 1px solid rgba(0, 100, 255, 0.5); */
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    /* height: 4.6vh;
    max-height: 4.6vh; */
    width: 5.8vh;
    max-width: 5.8vh;
    max-height: 3.39vh;
    /* max-width: 16px;
    height: 9px; */
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
