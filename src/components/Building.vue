<template>
    <div v-if="source && source.value" :class="'building-type-' + type">
        <img
            v-if="showImages"
            class="building-image"
            :src="source.value.type"
            :style="{'z-index': z }"
        />
    </div>
</template>
<script>
export default {
    props: {
        source: {
            type: Object,
        },
        type: {
            type: String,
        },
        showImages: {
            type: Boolean,
            default: true,
        },
    },
    mounted() {
        // debugger;
    },
    computed: {
        z() {
            return this.source.y + this.source.z
        },
    },
}
</script>
<style scoped>
.building-image {
    position: relative;
    /* height: 4rem;
  width: 4rem; */
    /* position: absolute; */
    /* visibility: hidden; */
    width: 32px;
    height: 32px;
}
/* .grid-block--valid-stack-space {
    background: rgba(189, 66, 255, 0.1);
} */
/* .grid-block--valid-floor-space {
    background: rgba(0, 255, 50, 0.1);
} */
.building-type-floor {
    /* background: rgba(0, 255, 50, 1); */
}
.building-type-stack {
    /* background: rgba(200, 50, 255, 1); */
}
</style>