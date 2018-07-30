import Vue from 'vue'
import App from './App.vue'
import Buefy from 'buefy'
import 'buefy/lib/buefy.css'
import 'mdi/css/materialdesignicons.min.css'

import _ from 'lodash';
window._ = _;
Vue.set(Vue.prototype, '_', _);


Vue.use(Buefy)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
