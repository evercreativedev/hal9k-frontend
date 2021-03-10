// Import Vue
import Vue from "vue";
import MainWrapper from "@/pages/Home/MainWrapper";

// Import Vue App, routes, store
import App from "./App";
import router from "./router";
import { sync } from "vuex-router-sync";
import store from "./store";
import NavBar from "./Navbar";
import "vue-snotify/styles/material.css";
import responsive from "vue-responsive";
import Snotify, { SnotifyPosition } from "vue-snotify";
Vue.directive("responsive", responsive);
//Amplify
import Amplify from "aws-amplify";
import "@aws-amplify/ui-vue";
import aws_exports from "./aws-exports";
Amplify.configure(aws_exports);

//////////////////////////////
Vue.use(Snotify, {
  toast: {
    timeout: 5000,
    bodyMaxLength: 5000,
    pauseOnHover: false,
    position: SnotifyPosition.rightTop,
  },
});
Vue.component("main-wrapper", MainWrapper);
Vue.component("nav-bar", NavBar);
// Configure router

sync(store, router);

export default new Vue({
  el: "#app",
  store,
  router,
  render: (h) => h(App),
});
