<template>
    <div class="wrapper">
        <p>Inspect the code from your room participants.</p>
        <ui-collapsible v-for="userName in usersInCurrentRoom" :key="userName">
            <div slot="header">
                {{ userName }}
            </div>
            <ui-checkbox checked :value="!disabledUsers.includes(userName)" @input="userEnableChange(userName, $event)"
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
import { UiAlert, UiCollapsible, UiCheckbox } from 'keen-ui'
import MultiplayerEditor from './MultiplayerEditor.vue'

import multiplayerService from './multiplayerService'
import gameService from './gameService'

export default {
    components: {
        UiAlert,
        UiCollapsible,
        UiCheckbox,
        MultiplayerEditor,
    },
    mounted() {
        multiplayerService.onRoomId.subscribe(roomId => {
            this.roomId = roomId
        })
        multiplayerService.onRoomId.subscribe(currentRoomId => {
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

            gameService.setDisabledUserScripts(this, this.disabledUsers);
        },
    },
    props: {},
    data: () => ({
        showAloneAlert: true,
        usersInCurrentRoom: [],
        userCodes: {},
        disabledUsers: [],
    }),
}
</script>
<style>
.wrapper .ui-collapsible__body {
    padding: 0;
}
</style>
<style scoped>
.wrapper {
    flex-direction: column;
    display: flex;
    flex: 1;
}

.alert-area {
    flex: 1;
}
</style>
