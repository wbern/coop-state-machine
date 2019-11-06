<template>
    <div class="page-wrapper-wrapper">
        <div class="page-disconnected-overlay" v-if="!connectedToSocketServer">
            <h1>Connecting to the socket server...</h1>
            <ui-icon
                :useSvg="false"
                class="page-disconnected-overlay__connecting-icon"
                icon="sync"
            ></ui-icon>
        </div>
        <div class="page-wrapper">
            <div class="left-wrapper">
                <City></City>
                <div class="city-controls">
                    <Controls
                        :can-tick="canTick && !gameBusy && !!userId"
                        :can-rewind="!gameBusy && !!userId"
                        :can-play="canTick && !gameBusy && !!userId"
                        :can-pause="gameBusy && playInProgress && !!userId"
                        :current-turn="this.$store.state.currentTurn"
                        @tick-to-turn-request="onTickToTurnRequest"
                        @rewind-request="onRewindRequest"
                        @tick-request="onTickRequest"
                        @play-request="onPlayRequest"
                        @pause-request="onPauseRequest"
                    ></Controls>
                </div>
                <div class="output-window">
                    <Output></Output>
                </div>
            </div>
            <ui-tabs
                type="icon-and-text"
                fullwidth
                fullheight
                ref="controlTabs"
            >
                <ui-tab
                    :id="tab.id"
                    :key="tab.id"
                    :title="
                        tab.title +
                            (tab.id === 'othersCode'
                                ? ' (' + Math.max(0, userCount - 1) + ')'
                                : '')
                    "
                    v-for="tab in controlTabs"
                >
                    <ui-icon :icon="tab.icon" slot="icon"></ui-icon>
                    <!-- {{ tab.title }} -->
                    <div class="tab-contents" v-if="tab.id === 'userCode'">
                        <Editor
                            @sync-room-request="onSyncRoomRequest"
                            @code-change="onLocalCommit($event, tab.id)"
                        ></Editor>
                    </div>
                    <div class="tab-contents" v-if="tab.id === 'othersCode'">
                        <Multiplayer></Multiplayer>
                    </div>
                    <!-- <div class="tab-contents" v-if="tab.id === 'gameConfig'"></div> -->
                </ui-tab>
            </ui-tabs>
        </div>
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
import socketService from './socketService'

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
                logService.log('your room id is ' + this.roomId)
            }
        })

        multiplayerService.onUserId.subscribe(userId => {
            if (!this.userId && userId) {
                this.userId = userId
                logService.log('your user id is ' + this.userId)
            }
        })

        multiplayerService.onUsersInRoom.subscribe(usersInCurrentRoom => {
            this.userCount = usersInCurrentRoom.length
        })

        gameService.onStartOver.subscribe(() => {
            this.applyCodeChanges()
        })

        gameService.onGameBusyChange.subscribe(busy => {
            this.gameBusy = busy
        })

        socketService.connectedChange.subscribe(connected => {
            this.connectedToSocketServer = connected
        })
    },
    data: () => ({
        connectedToSocketServer: false,
        playInProgress: false,
        gameBusy: false,
        roomId: null,
        userCount: 0,
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
            // {
            //     title: 'Game config',
            //     icon: 'memory',
            //     id: 'gameConfig',
            // },
        ],
        lastCodeChangeSinceStart: null,
        canTick: false,
    }),
    methods: {
        onSyncRoomRequest() {
            // take in all code changes submitted by the room
            gameService.acceptCodeChangesFromRoom(this)
            gameService.startOver(this)
            gameService.syncCodesToRunner(this)
        },
        async onTickToTurnRequest(turnNumber) {
            await gameService.gotoTurn(this, turnNumber)
        },
        async onRewindRequest() {
            await gameService.rewindTurn(this)
        },
        async onTickRequest() {
            await gameService.nextTurn(this)
        },
        async onPlayRequest(options) {
            this.playInProgress = true
            await gameService.playTurns(this, options.turn, options.delay)
            this.playInProgress = false
        },
        async onPauseRequest() {
            await gameService.pausePlay()
        },
        applyCodeChanges() {
            if (this.lastCodeChangeSinceStart) {
                gameService.acceptCodeChangesFromId(this, this.userId)

                gameService.syncSpecificUserCodeToRunner(
                    this,
                    this.userId,
                    false
                )

                this.lastCodeChangeSinceStart = null
                this.canTick = true
            }
        },
        onLocalCommit(event) {
            let code = event.getText()

            this.lastCodeChangeSinceStart = code

            // we notify other users of the new code no matter what
            // the logic sequencing will need to be handled by their client
            if (this.userId) {
                multiplayerService.sendCodeChange(this.lastCodeChangeSinceStart)
            }

            gameService.setCode(this, this.userId, code)

            if (!gameService.isGameStarted(this)) {
                this.applyCodeChanges()
            } else {
                this.canTick = false
            }
        },
    },
}
</script>
<style scoped>
.page-disconnected-overlay {
    position: fixed;
    background: rgba(255, 255, 255, 0.8);
    z-index: 9999;
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.page-disconnected-overlay__connecting-icon {
    animation-name: connecting-icon;
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    font-size: 48px;
}

@keyframes connecting-icon {
    0% {
        transform: rotate(360deg);
    }
    100% {
        transform: rotate(0deg);
    }
}

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
.page-wrapper-wrapper {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: row;
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

#kbshortcutmenu {
    width: 50%;
    height: 50%;
    margin: 15% 25%;
    min-width: 300px;
    /* height: 50%; */
    right: unset;
    top: unset;
    bottom: unset;
    left: unset;
    position: relative;
}
</style>
