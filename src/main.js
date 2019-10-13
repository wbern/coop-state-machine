import 'material-design-icons'
import 'keen-ui/dist/keen-ui.css'

import Vue from 'vue'

import City from './City.vue'
import { setup, createStore } from './vuex-bootstrapper'

setup(Vue)
const store = createStore()

Vue.config.productionTip = false

new Vue({
    render: h => h(City),
    store,
}).$mount('#app')
