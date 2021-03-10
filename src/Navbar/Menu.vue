<template>
  <section>
    <div
      class="menu"
      @mouseover="isOpened = true"
      @mouseleave="isOpened = false"
    >
      MENU
      <div class="menu-list" v-if="isOpened" @click="isOpened = false">
        <router-link class="menu-item" to="/">MAIN CONSOLE</router-link>
        <router-link class="menu-item" to="/event">LGE EVENT</router-link>
        <router-link class="menu-item" to="/gallery">NFT GALLERY</router-link>
        <router-link class="menu-item" to="/market">MARKET</router-link>
        <router-link class="menu-item" to="/deck">MY DECK</router-link>
        <router-link class="menu-item" to="/drop" v-if="stage"
          >NFT REWARD</router-link
        >
      </div>
    </div>
  </section>
</template>
<script>
import { mapState } from "vuex";
export default {
  data: () => ({
    isOpened: false,
  }),
  computed: {
    ...mapState({
      started: (state) => state.event.started,
      ongoing: (state) => state.event.ongoing,
      stage: (state) => state.account.stage,
    }),
  }
};
</script>
<style lang="scss" scoped>
.menu {
  font-weight: bold;
  padding: 6px 10px;
  cursor: pointer;
  color: white;
  background: black;
  border: 1px solid white;
  position: relative;
  .menu-list {
    position: absolute;
    display: flex;
    flex-direction: column;
    top: calc(100% + 1px);
    left: -1px;
    width: 150px;
    .menu-item {
      text-decoration: none;
      background: white;
      padding: 12px 16px;
      text-align: left;
      color: #444;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>
