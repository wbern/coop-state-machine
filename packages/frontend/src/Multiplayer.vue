<template>
    <div class="multiplayer-wrapper">
        <div class="room-management">
            <ui-textbox
                class="change-room-input"
                v-model="roomInputValue"
                :label="'Room ID (current: ' + currentRoomId + ')'"
            ></ui-textbox>
            <ui-button
                raised
                type="primary"
                color="primary"
                class="change-room-button"
                :disabled="!roomInputValue || roomInputValue === roomId"
                @click="onRoomChangeRequest"
                >Change Room
            </ui-button>
        </div>
        <p>Inspect the code from your room participants.</p>
        <ui-collapsible v-for="userName in usersInCurrentRoom" :key="userName">
            <div slot="header">
                {{
                    'User: ' + userName + (userName === userId ? ' (you)' : '')
                }}
            </div>
            <ui-checkbox
                style="padding: 8px 8px 0;"
                checked
                :value="!disabledUsers.includes(userName)"
                @input="userEnableChange(userName, $event)"
                >Enabled</ui-checkbox
            >
            <MultiplayerEditor
                :code="userCodesInEditorBoxes[userName]"
            ></MultiplayerEditor>
        </ui-collapsible>

        <div class="alert-area">
            <ui-alert
                @dismiss="showAloneAlert = false"
                v-if="usersInCurrentRoom.length === 0 && showAloneAlert"
            >
                It looks like nobody has joined your room. Want to join another
                room?
            </ui-alert>
        </div>
    </div>
</template>
<script>
import Vue from 'vue'
import {
    UiAlert,
    UiCollapsible,
    UiCheckbox,
    UiTextbox,
    UiButton,
} from 'keen-ui'
import MultiplayerEditor from './MultiplayerEditor.vue'

import multiplayerService from './multiplayerService'
import gameService from './gameService'

export default {
    components: {
        UiAlert,
        UiCollapsible,
        UiCheckbox,
        UiTextbox,
        UiButton,
        MultiplayerEditor,
    },
    mounted() {
        const sendCodeToServerWhenReady = () => {
            if (this.roomId && this.userId) {
                this.initialCodeSent = true

                multiplayerService.sendCodeChange(
                    gameService.userCodes[this.userId]
                )
            }
        }

        multiplayerService.onRoomId.subscribe(roomId => {
            this.roomId = roomId
            if (this.currentRoomId === null) {
                this.currentRoomId = this.roomId
                sendCodeToServerWhenReady()
            }
        })
        multiplayerService.onUserId.subscribe(userId => {
            this.userId = userId
            sendCodeToServerWhenReady()
        })
        multiplayerService.onCurrentRoomId.subscribe(currentRoomId => {
            this.currentRoomId = currentRoomId
        })
        multiplayerService.onUsersInRoom.subscribe(roomMembers => {
            this.usersInCurrentRoom = roomMembers.map(item => item.userId)

            roomMembers.forEach(item => {
                if (item.code) {
                    this.updateUserCode(item.userId, item.code)
                }
            })
        })
        multiplayerService.onCodeChange.subscribe(change => {
            this.updateUserCode(change.user, change.code)
        })
    },
    methods: {
        updateUserCode(userId, code = '') {
            Vue.set(this.userCodesInEditorBoxes, userId, code || '')
            gameService.setCode(this, userId, code || '')
        },
        userEnableChange(userId, e) {
            let newList = (this.disabledUsers = this.disabledUsers.filter(
                user => user !== userId
            ))

            if (e === false) {
                // user is disabled, add to array
                newList.push(userId)
            }

            this.disabledUsers = newList

            gameService.setDisabledUserScripts(this, this.disabledUsers)
        },
        onRoomChangeRequest() {
            multiplayerService.sendRoomChange(this.roomInputValue)
        },
    },
    data: () => ({
        initialCodeSent: false,
        showAloneAlert: true,
        usersInCurrentRoom: [],
        userCodesInEditorBoxes: {},
        disabledUsers: [],
        roomInputValue: '',
        roomId: null,
        userId: null,
        currentRoomId: null,
    }),
}
</script>
<style>
.multiplayer-wrapper .ui-collapsible__body {
    padding: 0;
}
</style>
<style scoped>
.multiplayer-wrapper {
    padding: 12px;

    flex-direction: column;
    display: flex;
    flex: 1;
}

.room-management {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.change-room-button {
    margin-left: 12px;
}

.change-room-input {
    flex: 1;
}

.alert-area {
    flex: 1;
}
</style>
