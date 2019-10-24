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
            <MultiplayerEditor :code="userCodes[userName]"></MultiplayerEditor>
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
import Vue from 'Vue'
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
        multiplayerService.onRoomId.subscribe(roomId => {
            this.roomId = roomId
            if (this.currentRoomId === null) {
                this.currentRoomId = this.roomId
            }
        })
        multiplayerService.onUserId.subscribe(userId => {
            this.userId = userId
        })
        multiplayerService.onCurrentRoomId.subscribe(currentRoomId => {
            this.currentRoomId = currentRoomId
        })
        multiplayerService.onUsersInRoom.subscribe(usersInCurrentRoom => {
            this.usersInCurrentRoom = usersInCurrentRoom
        })
        multiplayerService.onCodeChange.subscribe(change => {
            Vue.set(this.userCodes, change.user, change.code)
        })
    },
    methods: {
        userEnableChange(userName, e) {
            let newList = (this.disabledUsers = this.disabledUsers.filter(
                user => user !== userName
            ))

            if (e === false) {
                // user is disabled, add to array
                newList.push(userName)
            }

            this.disabledUsers = newList

            gameService.setDisabledUserScripts(this, this.disabledUsers)
        },
        onRoomChangeRequest() {
            multiplayerService.sendRoomChange(this.roomInputValue)
        },
    },
    data: () => ({
        showAloneAlert: true,
        usersInCurrentRoom: [],
        userCodes: {},
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
