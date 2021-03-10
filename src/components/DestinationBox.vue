<template>
  <section class="destination-box">
    <p class="blink">Choose a destination...</p>
    <div class="menu-list">
      <router-link class="menu-item" to="/">&#8227; Welcome</router-link>
      <router-link
        class="menu-item"
        to="/zap"
        v-if="address && provider && started && !ongoing"
        :class="{ active: $route.name === 'zapper' }"
        >&#8227; Zapper</router-link
      >
      <router-link
        class="menu-item"
        to="/farm"
        v-if="address && provider && started && !ongoing"
        >&#8227; Farming</router-link
      >
      <router-link
        class="menu-item"
        to="/tokenomics"
        :class="{ active: $route.name === 'Tokenomics' }"
        >&#8227; Tokenomics</router-link
      >
      <a class="menu-item" @click="openTwitter">&#8227; Twitter</a>
      <a class="menu-item" @click="openTelegram">&#8227; Telegram</a>
      <a class="menu-item" @click="openDiscord">&#8227; Discord</a>
    </div>
  </section>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "destination-box",
  computed: {
    ...mapState({
      address: (state) => state.account.address,
      started: (state) => state.event.started,
      ongoing: (state) => state.event.ongoing,
      provider: (state) => state.metamask.provider,
    }),
  },
  methods: {
    openTwitter() {
      window.open("https://www.twitter.com/hal9k_ai");
    },
    openTelegram() {
      window.open("https://t.me/hal9k_ai");
    },
    openDiscord() {
      window.open("https://discord.gg/H8mZgRWuMB");
    },
  },
};
</script>

<style lang="scss" scoped>
.menu-list {
  display: flex;
  flex-direction: column;
}
.menu-item {
  background-color: #0057b7;
  cursor: pointer;
  color: #fff;
  font-weight: bold;
  padding: 6px 10px;
  text-decoration: none;
  border: none;
  &.router-link-exact-active {
    background-color: #fff;
    color: #0057b7;
  }
  &:hover {
    background-color: #fff;
    color: #0057b7;
  }
  &:active {
    position: relative;
    top: 1px;
  }
}

.destination-box {
  padding: 0.5rem;
}
</style>
