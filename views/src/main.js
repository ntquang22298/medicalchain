import Vue from 'vue'
import App from './App.vue'
import VueLocalStorage from 'vue-localstorage'
import BootstrapVue from 'bootstrap-vue'
import VueResource from "vue-resource"
import VueRouter from "vue-router"
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Routes from "./routes"

Vue.use(BootstrapVue)
Vue.use(VueResource)
Vue.use(VueRouter)
Vue.use(VueLocalStorage)

const router = new VueRouter({
  routes: Routes
})

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');
  console.log(localStorage.getItem('user'));
  
  if (authRequired && !loggedIn) {
    return next({ 
      path: '/login', 
      query: { returnUrl: to.path } 
    });
  }

  next();
})

new Vue({
  localStorage: {
    global: {
      type: Object,
      default: {
        user_id: null
      }
    }
  },
  el: '#app',
  router: router,
  render: h => h(App)
})
