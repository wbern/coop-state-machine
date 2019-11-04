<template>
    <div class="city-controls">
        <div class="left">
            <small>Turn #{{ currentTurn }}</small>
        </div>
        <div class="center">
            <ui-icon-button
                @click="onSkipToBack"
                type="primary"
                :disabled="rewindToTurnDisabled"
                :color="rewindToTurnDisabled ? 'default' : 'primary'"
                class="city-controls__icon"
                tooltip="Rewind / start over to a specific turn"
                icon="restore"
            ></ui-icon-button>
            <ui-modal ref="rewindModal" title="Rewind back to turn..">
                <ui-textbox
                    label="Turn #"
                    :autofocus="true"
                    type="number"
                    :min="0"
                    :max="currentTurn - 1"
                    v-model.number="rewindToTurnNumber"
                ></ui-textbox>
                <ui-button
                    raised
                    class="city-controls__icon city-controls__icon--mirror"
                    type="primary"
                    color="primary"
                    icon="restore"
                    :disabled="
                        !(
                            rewindToTurnNumber >= 0 &&
                            rewindToTurnNumber <= 1000 &&
                            rewindToTurnNumber < currentTurn
                        )
                    "
                    :icon-position="'left'"
                    :size="'normal'"
                    @click="onRewindToTurnRequest"
                    >Rewind to this turn
                </ui-button>
            </ui-modal>
            <ui-icon-button
                @click="onBack"
                :disabled="rewindOneDisabled"
                type="primary"
                :color="rewindOneDisabled ? 'default' : 'primary'"
                class="city-controls__icon"
                tooltip="Rewind one turn"
                icon="skip_previous"
            ></ui-icon-button>
            <ui-icon-button
                v-if="canPause && !canPlay"
                @click="onPause"
                type="primary"
                :disabled="pauseDisabled"
                :color="pauseDisabled ? 'default' : 'primary'"
                class="city-controls__icon"
                tooltip="Pause the execution"
                icon="pause"
            ></ui-icon-button>
            <ui-icon-button
                v-if="canPlay || (!canPlay && !canPause)"
                @click="onPlay"
                type="primary"
                :disabled="playDisabled"
                :color="playDisabled ? 'default' : 'primary'"
                class="city-controls__icon"
                tooltip="Play until a specified turn at a specified interval"
                icon="play_arrow"
            ></ui-icon-button>
            <ui-modal ref="playModal" title="Play turns">
                <h1>Description</h1>
                <p>
                    Use your current code (plus the code input by the other
                    online players in the present room) to play the game for a
                    given amount of turns. Pressing this button won't affect any
                    other player's browser.
                </p>
                <ui-textbox
                    :autofocus="true"
                    label="Play until turn #.."
                    type="number"
                    :min="currentTurn + 1"
                    :max="1000"
                    v-model.number="playToTurnNumber"
                ></ui-textbox>
                <ui-textbox
                    :autofocus="true"
                    label="Milliseconds delay between turn (lower = faster)"
                    type="number"
                    :min="0"
                    :max="60000"
                    v-model.number="playDelayNumber"
                ></ui-textbox>
                <ui-button
                    raised
                    class="city-controls__icon city-controls__icon--mirror"
                    icon="play_arrow"
                    type="primary"
                    color="primary"
                    :disabled="playDisabled"
                    :icon-position="'left'"
                    :size="'normal'"
                    @click="onPlayRequest"
                    >Play
                </ui-button>
            </ui-modal>
            <ui-icon-button
                @click="onForward"
                type="primary"
                :disabled="skipOneDisabled"
                :color="skipOneDisabled ? 'default' : 'primary'"
                class="city-controls__icon"
                tooltip="Go forward one turn"
                icon="skip_next"
            ></ui-icon-button>
            <ui-icon-button
                @click="onSkipToEnd"
                type="primary"
                :disabled="skipToTurnDisabled"
                :color="skipToTurnDisabled ? 'default' : 'primary'"
                class="city-controls__icon city-controls__icon--mirror"
                tooltip="Skip to a specific turn"
                icon="restore"
            ></ui-icon-button>
            <ui-modal ref="forwardModal" title="Skip to turn..">
                <ui-textbox
                    :autofocus="true"
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
                    color="primary"
                    :disabled="
                        !(
                            forwardToTurnNumber > 0 &&
                            forwardToTurnNumber <= 1000 &&
                            forwardToTurnNumber > currentTurn
                        )
                    "
                    :icon-position="'left'"
                    :size="'normal'"
                    @click="onForwardToTurnRequest"
                    >Skip to this turn
                </ui-button>
            </ui-modal>
        </div>
        <div class="right"></div>
    </div>
</template>
<script>
import { UiIconButton, UiModal, UiSlider, UiButton, UiTextbox } from 'keen-ui'

export default {
    components: { UiIconButton, UiModal, UiButton, UiTextbox },
    props: {
        currentTurn: Number,
        canTick: Boolean,
        canRewind: Boolean,
        canPlay: Boolean,
        canPause: Boolean,
    },
    data: () => ({
        rewindToTurnNumber: 0,
        forwardToTurnNumber: 10,
        playToTurnNumber: 50,
        playDelayNumber: 500,
    }),
    computed: {
        rewindToTurnDisabled() {
            return !this.canRewind || !this.canUndo || this.currentTurn === 0
        },
        rewindOneDisabled() {
            return !this.canRewind || !this.canUndo || this.currentTurn === 0
        },
        pauseDisabled() {
            return false
        },
        playDisabled() {
            return !this.canRewind || !this.canTick || !this.canPlay
        },
        skipOneDisabled() {
            return !(this.canRedo || this.canTick)
        },
        skipToTurnDisabled() {
            return !(this.canRedo || this.canTick)
        },
    },
    methods: {
        onRewindToTurnRequest() {
            this.$emit('tick-to-turn-request', this.rewindToTurnNumber)
            this.$refs['rewindModal'].close()
        },
        onForwardToTurnRequest() {
            this.$emit('tick-to-turn-request', this.forwardToTurnNumber)
            this.$refs['forwardModal'].close()
        },
        onSkipToBack() {
            this.$refs['rewindModal'].open()
            setTimeout(() => {
                this.$refs['rewindModal'].$el.focus()
                this.$refs['rewindModal'].$el.querySelector('input').focus()
            }, 10)
            // this.$emit('start-over-request')
        },
        onPlayRequest() {
            this.$emit('play-request', {
                turn: this.playToTurnNumber,
                delay: this.playDelayNumber,
            })

            this.$refs['playModal'].close()
        },
        onBack() {
            this.$emit('rewind-request')
        },
        onPlay() {
            this.$refs['playModal'].open()
            // play continously
        },
        onPause() {
            this.$emit('pause-request')
        },
        onSkipToEnd() {
            this.$refs['forwardModal'].open()
            setTimeout(() => {
                this.$refs['forwardModal'].$el.focus()
                this.$refs['forwardModal'].$el.querySelector('input').focus()
            }, 10)
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
.left,
.right {
    flex: 1;
}
.city-controls__icon {
    margin: 0 4px;
}

.city-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 4px 0;
    padding: 0 10px;
}
</style>
