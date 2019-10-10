<template>
    <div class="page-wrapper">
        <City></City>
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
                title: 'Tab 1',
                icon: 'looks_one',
                id: 'tab1',
            },
            {
                title: 'Tab 2',
                icon: 'looks_two',
                id: 'tab2',
            },
            {
                title: 'Tab 3',
                icon: 'looks_3',
                id: 'tab3',
            },
            {
                title: 'Tab 4',
                icon: 'looks_4',
                id: 'tab4',
            },
        ],
    }),
}
</script>
<style>
@import '~material-design-icons/iconfont/material-icons.css';

.ui-tabs {
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
<style scoped>
.page-wrapper {
    flex: 1;
    display: flex;
    flex-direction: row;
}
</style>