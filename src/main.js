import Vue from 'vue'
import App from './App'
import router from './router'
import cognito from './cognito'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  cognito,
  template: '<App/>',
  components: {
    App
  }
})
