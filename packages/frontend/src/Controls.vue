<template>
    <div class="city-controls">
        <ui-icon-button
            @click="onSkipToBack"
            :disabled="!canUndo"
            type="secondary"
            class="city-controls__icon"
            icon="restore"
        ></ui-icon-button>
        <ui-modal ref="skipBackModal" title="Skip back X turns..">
            Hello! How far do you want to go back?
            <ui-slider
                show-marker
                :min="0"
                :max="100"
                :step="5"
                v-model="skipBackTurnsAmount"
            ></ui-slider>
            <ui-button icon="restore" :icon-position="'left'" :size="'normal'"
                >Go Back</ui-button
            >
        </ui-modal>
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
        <ui-icon-button
            @click="onSkipToEnd"
            type="secondary"
            class="city-controls__icon city-controls__icon--mirror"
            icon="restore"
        ></ui-icon-button>
        <ui-modal ref="skipForwardModal" title="Skip to turn..">
            Hello! How far do you want to skip?
            <ui-slider
                show-marker
                :min="1"
                :max="100"
                :step="5"
                v-model="skipForwardTurnsAmount"
            ></ui-slider>
            <ui-button
                class="city-controls__icon city-controls__icon--mirror"
                icon="restore"
                :icon-position="'left'"
                :size="'normal'"
                >Skip Forward
            </ui-button>
        </ui-modal>
    </div>
</template>
<script>
import { UiIconButton, UiModal, UiSlider, UiButton } from 'keen-ui'

export default {
    components: { UiIconButton, UiModal, UiSlider, UiButton },
    props: {
        canTick: Boolean,
    },
    data: () => ({
        skipBackTurnsAmount: 10,
        skipForwardTurnsAmount: 1,
    }),
    methods: {
        onSkipToBack() {
            this.$refs['skipBackModal'].open()
            // this.$emit('start-over-request')
        },
        onBack() {
            this.undo()
        },
        onPlay() {
            // play continously
        },
        onSkipToEnd() {
            this.$refs['skipForwardModal'].open()
        },
        onForward() {
            // this should not only be redoing, but also generating the "next step"
            if (this.canRedo) {
                this.redo()
            } else if (this.canTick) {
                this.$emit('tick-request')
            }
        },
    },
}
</script>
<style>
.city-controls__icon--mirror .ui-icon.material-icons.restore {
    transform: scale(-1, 1) translate(-1px, 0px);
}
</style>
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
