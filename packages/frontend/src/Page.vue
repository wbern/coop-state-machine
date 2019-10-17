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
                <Editor
                    v-if="tab.id === 'tab1'"
                    @code-change="onCodeChange($event, tab.id)"
                ></Editor>
            </ui-tab>
        </ui-tabs>
    </div>
</template>
<script>
import City from './City.vue'
import Editor from './Editor.vue'
import Output from './Output.vue'
import Controls from './Controls.vue'

import runnerService from './runnerService'
import gameService from './gameService'

import { UiAlert, UiButton, UiTabs, UiTab, UiIcon } from 'keen-ui'

export default {
    components: { City, Editor, Output, UiTabs, UiTab, UiIcon, Controls },
    mounted() {},
    data: () => ({
        controlTabs: [
            {
                title: 'Your Code',
                icon: 'looks_one',
                id: 'tab1',
            },
            {
                title: 'Others Code',
                icon: 'looks_two',
                id: 'tab2',
            },
            {
                title: 'Game config',
                icon: 'looks_3',
                id: 'tab3',
            },
        ],
        canTick: false,
    }),
    // computed: {
    //     canTick() {
    //         return runnerService.canTick()
    //     },
    // },
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
        onCodeChange(event, id) {
            runnerService.setCode(id, event.getText())
            this.canTick = true
            this.$forceUpdate()
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
