import Vue from "vue";
import VueRouter from "vue-router";
import Welcome from "@/pages/Home/Welcome";
import Farming from "@/pages/Home/Farming";
import Tokenomics from "@/pages/Home/Tokenomics";
import Zapper from "@/pages/Home/Zapper";
import Event from "@/pages/Event";
import Gallery from "@/pages/Gallery";
import MyDeck from "@/pages/MyDeck";
import Market from "@/pages/Market";
import Drop from "@/pages/Drop";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Welcome",
    component: Welcome,
  },
  {
    path: "/farm",
    name: "Farming",
    component: Farming,
  },
  {
    path: "/zap",
    name: "zapper",
    component: Zapper,
  },
  {
    path: "/tokenomics",
    name: "Tokenomics",
    component: Tokenomics,
  },
  {
    path: "/event",
    name: "Event",
    component: Event,
  },
  {
    path: "/gallery",
    name: "Gallery",
    component: Gallery,
  },
  {
    path: "/market",
    name: "Market",
    component: Market,
  },
  {
    path: "/drop",
    name: "Drop",
    component: Drop,
  },
  {
    path: "/deck",
    name: "Deck",
    component: MyDeck,
  },
];
const router = new VueRouter({
  routes,
  linkActiveClass: "active",
  mode: "history",
});

// router.beforeEach(async (to, from, next) => {
//   if (to.name !== "Event") next({ path: "/event" });
//   next();
// });

export default router;
