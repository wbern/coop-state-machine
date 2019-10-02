<template>
    <div class="grid">
        <div v-for="(undefined, gridY) in rows * 2" :key="gridY" class="grid-row">
            <div
                v-for="(undefined, gridX) in columns * 2"
                :key="gridX"
                class="grid-block"
                :class="{
                    'grid-block--valid': validSpace(gridX, gridY),
                    'grid-block--in-use': validSpace(gridX, gridY) && inUse(gridToCoords(gridX, gridY))
                }"
            >
                <div v-if="inUse(gridToCoords(gridX, gridY))">
                    <img
                        v-if="validSpace(gridX, gridY)"
                        :style="'opacity: 1; z-index: ' + getZ(gridX, gridY) + ';'"
                        class="grid-image"
                        :src="getCoordsData(gridToCoords(gridX, gridY))[0].type"
                    />
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
            return {
                x: gridX / 2 - ((gridX / 2) % 2),
                y: gridY / 2 - ((gridY / 2) % 2),
            }
        },
        isEvenSpace(gridX, gridY) {
            return gridX % 2 === 0 && gridY % 2 === 0
        },
        isOddSpace(gridX, gridY) {
            return gridX % 2 === 1 && gridY % 2 === 1
        },
        validSpace(gridX, gridY) {
            return (
                this.isEvenSpace(gridX, gridY) || this.isOddSpace(gridX, gridY)
            )
        },
        inUse(coords) {
            return !!this.getCoordsData(coords)
        },
        getCoordsData(coords) {
            return (
                this.coordsData[coords.x] && this.coordsData[coords.x][coords.y]
            )
        },
        getZ(x, y) {
            let isStacked = false

            if (isStacked) {
                return this.rows - y
            } else {
                return 'inherit'
            }
        },
    },
    data() {
        // y
        let coordsData = new Array(this.columns).fill(
            // x
            new Array(this.rows).fill(
                // z
                new Array(this.initialFloors).fill(
                    { type: 'buildings/buildingTiles_000.png' },
                    0,
                    this.rows
                )
            )
        )

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
.grid-block--valid {
    background: rgba(0, 100, 255, 0.1);
}
.grid-block--in-use {
    background: rgba(2, 255, 50, 0.5);
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
