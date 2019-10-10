<template>
    <div class="page-wrapper">
        <div class="left-wrapper">
            <City></City>
            <div class="city-controls">
                <ui-icon class="city-controls_icon" icon="skip_previous"></ui-icon>
                <ui-icon class="city-controls_icon" icon="play_arrow"></ui-icon>
                <ui-icon class="city-controls_icon" icon="skip_next"></ui-icon>
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

import { UiAlert, UiButton, UiTabs, UiTab, UiIcon } from 'keen-ui'

export default {
    components: { City, Editor, UiTabs, UiTab, UiIcon },
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