<template>
    <div class="wrapper">
        <p>Inspect the code from your room participants.</p>
        <ui-collapsible
            v-for="userName in usersInCurrentRoom"
            :key="userName"
        >
            <div slot="header">{{ userName }}</div>
            <MultiplayerEditor></MultiplayerEditor>
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
import { UiAlert, UiCollapsible } from 'keen-ui'
import MultiplayerEditor from './MultiplayerEditor.vue'

import multiplayerService from './multiplayerService'

export default {
    components: {
        UiAlert,
        UiCollapsible,
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
    },
    props: {},
    data: () => ({
        showAloneAlert: true,
        usersInCurrentRoom: [],
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
