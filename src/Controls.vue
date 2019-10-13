<template>
    <div class="city-controls">
        <ui-icon-button
            @click="onBack"
            :disabled="!canUndo"
            type="secondary"
            class="city-controls__icon"
            icon="skip_previous"
        ></ui-icon-button>
        <ui-icon-button
            @click="onPlay"
            :disabled="true"
            type="primary"
            class="city-controls__icon"
            icon="play_arrow"
        ></ui-icon-button>
        <ui-icon-button
            @click="onForward"
            :disabled="!(canRedo || canTick)"
            type="secondary"
            class="city-controls__icon"
            icon="skip_next"
        ></ui-icon-button>
    </div>
</template>
<script>
import { UiIconButton } from 'keen-ui'

export default {
    components: { UiIconButton },
    props: {
        canTick: Boolean,
    },
    methods: {
        onBack() {
            this.undo()
        },
        onPlay() {
            // play continously
        },
        onForward() {
            // this should not only be redoing, but also generating the "next step"
            if(this.canRedo) {
                this.redo()
            } else if(this.canTick) {
                this.$emit('tick-request');
            }
        },
    },
}
</script>
<style scoped>
.city-controls__icon {
    margin: 0 4px;
}

.city-controls {
    display: flex;
    justify-content: center;
    margin: 4px 0;
}
</style>