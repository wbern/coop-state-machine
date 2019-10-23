<template>
    <div class="page-wrapper">
        <div class="left-wrapper">
            <City></City>
            <div class="city-controls">
                <Controls
                    :can-tick="canTick"
                    :current-turn="this.$store.state.currentTurn"
                    @tick-to-turn-request="onTickToTurnRequest"
                    @rewind-request="onRewindRequest"
                    @tick-request="onTickRequest"
                ></Controls>
            </div>
            <div class="output-window">
                <Output></Output>
            </div>
        </div>
        <ui-tabs type="icon-and-text" fullwidth fullheight ref="controlTabs">
            <ui-tab
                :disabled="tab.id === 'tab2'"
                :id="tab.id"
                :key="tab.id"
                :title="tab.title"
                v-for="tab in controlTabs"
            >
                <ui-icon :icon="tab.icon" slot="icon"></ui-icon>
                <!-- {{ tab.title }} -->
                <div class="tab-contents" v-if="tab.id === 'userCode'">
                    <Editor
                        @code-change="onCodeChange($event, tab.id)"
                    ></Editor>
                </div>
                <div class="tab-contents" v-if="tab.id === 'othersCode'">
                    <Multiplayer></Multiplayer>
                </div>
                <div class="tab-contents" v-if="tab.id === 'gameConfig'"></div>
            </ui-tab>
        </ui-tabs>
    </div>
</template>
<script>
import City from './City.vue'
import Editor from './Editor.vue'
import Output from './Output.vue'
import Controls from './Controls.vue'
import Multiplayer from './Multiplayer.vue'

import runnerService from './runnerService'
import gameService from './gameService'
import logService from './logService'

import multiplayerService from './multiplayerService'

import { UiAlert, UiButton, UiTabs, UiTab, UiIcon } from 'keen-ui'

export default {
    components: {
        City,
        Editor,
        Output,
        UiTabs,
        UiTab,
        UiIcon,
        Controls,
        Multiplayer,
    },
    mounted() {
        multiplayerService.onRoomId.subscribe(roomId => {
            if (!this.roomId && roomId) {
                this.roomId = roomId
                logService.log('room id is ' + this.roomId)
            }
        })

        multiplayerService.onUserId.subscribe(userId => {
            if (!this.userId && userId) {
                this.userId = userId
                logService.log('room id is ' + this.userId)
            }
        })

        gameService.onStartOver.subscribe(() => {
            this.applyCodeChanges()
        })
    },
    data: () => ({
        roomId: null,
        userId: null,
        controlTabs: [
            {
                title: 'Your Code',
                icon: 'person',
                id: 'userCode',
            },
            {
                title: 'Others Code',
                icon: 'people',
                id: 'othersCode',
            },
            {
                title: 'Game config',
                icon: 'memory',
                id: 'gameConfig',
            },
        ],
        lastCodeChangeSinceStart: null,
        canTick: false,
    }),
    methods: {
        async onTickToTurnRequest(turnNumber) {
            await gameService.gotoTurn(this, turnNumber)
        },
        async onRewindRequest() {
            await gameService.rewindTurn(this)
        },
        async onTickRequest() {
            await gameService.nextTurn(this)
        },
        applyCodeChanges() {
            if (this.lastCodeChangeSinceStart) {
                gameService.setCode(this.userId, this.lastCodeChangeSinceStart)

                this.lastCodeChangeSinceStart = null
                this.canTick = true

            }
        },
        onCodeChange(event) {
            if (this.userId) {
                this.lastCodeChangeSinceStart = event.getText()

                // we notify other users of the new code no matter what
                // the logic sequencing will need to be handled by their client
                multiplayerService.sendCodeChange(this.lastCodeChangeSinceStart)

                if (!gameService.isGameStarted(this)) {
                    this.applyCodeChanges()
                } else {
                    this.canTick = false;
                }
            }
        },
    },
}
</script>
<style scoped>
.city-controls {
    flex: 0.1 0.1;
    width: 100%;
}
.output-window {
    flex: 0.4 0.4;
    width: 100%;
    align-self: center;
}
.city-controls_icon {
    font-size: 36px;
}
.left-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
}
.page-wrapper {
    height: 100%;
    border: 8px solid #dddddd;
    flex: 1;
    display: flex;
    flex-direction: row;
}
</style>
<style>
@import '~material-design-icons/iconfont/material-icons.css';

.tab-contents {
    display: flex;
    flex: 1;
}

.ui-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
}

.ui-tabs__body {
    flex: 1;
    display: flex;
    padding: 0;
    border: 0;
}

.ui-tab {
    display: flex;
    flex: 1;
}
</style>
