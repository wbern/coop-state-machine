import 'material-design-icons'
import 'keen-ui/dist/keen-ui.css'

import Vue from 'vue'

import Page from './Page.vue'
import { createStore } from './vuex-bootstrapper'

const store = createStore(Vue)

Vue.config.productionTip = false

new Vue({
    render: h => h(Page),
    store,
}).$mount('#app')
