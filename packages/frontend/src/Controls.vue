<template>
    <div class="city-controls">
        <ui-icon-button
            @click="onSkipToBack"
            :disabled="!canUndo"
            type="secondary"
            class="city-controls__icon"
            icon="restore"
        ></ui-icon-button>
        <ui-modal ref="rewindModal" title="Rewind back to turn..">
            <ui-textbox
                label="Turn #"
                type="number"
                :min="0"
                :max="currentTurn - 1"
                v-model.number="rewindToTurnNumber"
            ></ui-textbox>
            <ui-button
                raised
                class="city-controls__icon city-controls__icon--mirror"
                type="primary"
                icon="restore"
                :disabled="!(rewindToTurnNumber >= 0 && rewindToTurnNumber <= 1000 && rewindToTurnNumber < currentTurn)"
                :icon-position="'left'"
                :size="'normal'"
                @click="onRewindToTurnRequest"
                >Rewind to this turn
            </ui-button>
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
        <ui-modal ref="forwardModal" title="Skip to turn..">
            <ui-textbox
                label="Turn #"
                type="number"
                :min="currentTurn + 1"
                :max="1000"
                v-model.number="forwardToTurnNumber"
            ></ui-textbox>
            <ui-button
                raised
                class="city-controls__icon city-controls__icon--mirror"
                icon="restore"
                type="primary"
                :disabled="!(forwardToTurnNumber > 0 && forwardToTurnNumber <= 1000 && forwardToTurnNumber > currentTurn)"
                :icon-position="'left'"
                :size="'normal'"
                @click="onForwardToTurnRequest"
                >Skip to this turn
            </ui-button>
        </ui-modal>
    </div>
</template>
<script>
import { UiIconButton, UiModal, UiSlider, UiButton, UiTextbox } from 'keen-ui'

export default {
    components: { UiIconButton, UiModal, UiButton, UiTextbox },
    props: {
        currentTurn: Number,
        canTick: Boolean,
    },
    data: () => ({
        rewindToTurnNumber: 0,
        forwardToTurnNumber: 10,
    }),
    methods: {
        onRewindToTurnRequest() {
            this.$emit('tick-to-turn-request', this.rewindToTurnNumber)
            this.$refs['rewindModal'].close();
        },
        onForwardToTurnRequest() {
            this.$emit('tick-to-turn-request', this.forwardToTurnNumber)
            this.$refs['forwardModal'].close();
        },
        onSkipToBack() {
            this.$refs['rewindModal'].open()
            // this.$emit('start-over-request')
        },
        onBack() {
            this.$emit('rewind-request')
        },
        onPlay() {
            // play continously
        },
        onSkipToEnd() {
            this.$refs['forwardModal'].open()
        },
        onForward() {
            // this should not only be redoing, but also generating the "next step"
            this.$emit('tick-request')
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
