<template>
    <div class="grid">
        <div v-for="(undefined, gridY) in rows * 2" :key="gridY" class="grid-row">
            <div
                v-for="(undefined, gridX) in columns * 2"
                :key="gridX"
                class="grid-block"
                :class="{
                    'grid-block--valid-floor-space': validFloorSpace(gridX, gridY),
                    'grid-block--valid-stack-space': validStackSpace(gridX, gridY),
                    'grid-block--floor-space-in-use': validFloorSpace(gridX, gridY) && floorSpaceInUse(gridToCoords(gridX, gridY)),
                    'grid-block--stack-space-in-use': validStackSpace(gridX, gridY) && stackSpaceInUse(gridX, gridY)
                }"
            >
                <div
                    v-if="validFloorSpace(gridX, gridY) && floorSpaceInUse(gridToCoords(gridX, gridY))"
                    :style="'opacity: 1; z-index: ' + getFloorSpaceZ(gridX, gridY) + ';'"
                >
                    <!-- <img class="grid-image" :src="getCoordsData(gridToCoords(gridX, gridY)).type" /> -->
                </div>
                <div
                    v-if="validStackSpace(gridX, gridY) && stackSpaceInUse(gridX, gridY)"
                    :style="'opacity: 1; z-index: ' + getStackSpaceZ(gridX, gridY) + ';'"
                >
                    <!-- <img class="grid-image" :src="findStackSpaceCoords(gridX, gridY).type" /> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HelloWorld',
    methods: {
        getTileNumber(i) {
            // '/buildings/buildingTiles_' + getTileNumber(y * x) + '.png'

            return '000'
            // return y.toString().padStart(3, '0')
        },
        gridToCoords(gridX, gridY) {
            if (gridX === 1 && gridY === 1) {
                debugger
            }

            if (!this.validFloorSpace(gridX, gridY)) {
                throw new Error(
                    'cannot convert to coords with uneven grid coords'
                )
            }

            // return {
            //     x: gridX / 2,
            //     y: gridY / 2,
            // }

            let offset = 0

            if (this.isOddSpace(gridX, gridY)) {
                offset = 1
            }

            const res = {
                x: gridX / 2,
                y: (gridY - offset) / 2,
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
        validStackSpace(gridX, gridY) {
            // anywhere is valid stack space
            return true
            // return (
            //     !this.isEvenSpace(gridX, gridY) &&
            //     !this.isOddSpace(gridX, gridY)
            // )
        },
        floorSpaceInUse(coords) {
            return !!this.getCoordsData(coords)
        },
        stackSpaceInUse(gridX, gridY) {
            return this.findStackSpaceCoords(gridX, gridY)
        },
        findStackSpaceCoords(startingGridX, startingGridY) {
            for (let i = startingGridY + 1; i < this.rows * 2; i++) {
                if (this.validFloorSpace(startingGridX, i)) {
                    let coords = this.gridToCoords(startingGridX, i)

                    let res = this.getCoordsData({
                        x: coords.x,
                        y: coords.y,
                        z: i - startingGridY,
                    })

                    if (
                        // * are there any floors this many rows to the right?
                        // * is floor in use?
                        // * does the floor have high enough elevation?
                        res
                    ) {
                        return res
                    }
                }
            }
        },
        getCoordsData(coords) {
            return (
                this.coordsData[coords.x] &&
                this.coordsData[coords.x][coords.y] &&
                this.coordsData[coords.x][coords.y][coords.z || 0]
            )
        },
        getFloorSpaceZ(x, y) {
            return y
        },
        getStackSpaceZ(x, y) {
            return y + 2
        },
    },
    data() {
        // y
        let coordsData = new Array(this.columns).fill(1).map(y =>
            // x
            new Array(this.rows).fill(1).map(x =>
                // z (floors)
                new Array(this.initialFloors).fill(1).map(z => ({
                    type: 'buildings/buildingTiles_000.png',
                }))
            )
        )

        coordsData[1][0] = new Array(3).fill({
            type: 'buildings/buildingTiles_000.png',
        })

        return {
            coordsData,
        }
    },
    computed: {},
    props: {
        rows: {
            type: Number,
            default: () => 6,
        },
        columns: {
            type: Number,
            default: () => 6,
        },
        initialFloors: {
            type: Number,
            default: () => 0,
        },
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.grid {
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
    border: 1px solid rgba(0, 100, 255, 0.5);
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 16px;
    height: 8px;
    /* for stacking buildings */
    /* height: 10px; */
}
.grid-block--valid-stack-space {
    background: rgba(189, 66, 255, 0.1);
}
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
