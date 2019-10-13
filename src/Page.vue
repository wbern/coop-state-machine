<template>
    <div class="page-wrapper">
        <div class="left-wrapper">
            <City></City>
            <div class="city-controls">
                <Controls></Controls>
            </div>
            <div class="output-window">
                <Output></Output>
            </div>
        </div>
        <ui-tabs type="icon-and-text" fullwidth fullheight ref="controlTabs">
            <ui-tab
                :disabled="tab.id === 'tab2' && disableTab2"
                :id="tab.id"
                :key="tab.id"
                :title="tab.title"
                v-for="tab in controlTabs"
            >
                <ui-icon :icon="tab.icon" slot="icon"></ui-icon>
                <!-- {{ tab.title }} -->
                <Editor></Editor>
            </ui-tab>
        </ui-tabs>
    </div>
</template>
<script>
import City from './City'
import Editor from './Editor'
import Output from './Output'
import Controls from './Controls'

import { UiAlert, UiButton, UiTabs, UiTab, UiIcon } from 'keen-ui'

export default {
    components: { City, Editor, Output, UiTabs, UiTab, UiIcon, Controls },
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
    }),
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