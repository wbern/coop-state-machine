import Vue from 'vue'
import City from './City.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(City),
}).$mount('#city')
