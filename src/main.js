import 'material-design-icons'
import 'keen-ui/dist/keen-ui.css';

import Vue from 'vue'

import City from './City.vue'


Vue.config.productionTip = false

new Vue({
  render: h => h(City),
}).$mount('#app')
