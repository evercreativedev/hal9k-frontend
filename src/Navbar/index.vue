<template>
  <div class="nav-bar">
    <Menu v-if="provider && address" />
    <button class="green" v-if="address" @click="disconnect">
      {{ compressAddress(address, 10, 5) }}
    </button>
    <button class="white" v-else @click="connectWallet">
      Connect Wallet
    </button>
  </div>
</template>
<script>
import { mapState } from "vuex";
import Menu from "./Menu";
import Web3Wrapper from "../utils/Web3Wrapper";
export default {
  components: {
    Menu,
  },
  computed: {
    ...mapState({
      address: (state) => state.account.address,
      provider: (state) => state.metamask.provider,
    }),
  },
  async created() {
    await this.connectWallet();
  },
  methods: {
    async connectWallet() {
      await Web3Wrapper.connect();
    },
    compressAddress(address, leftOffset, rightOffset) {
      return (
        address.substr(0, leftOffset) +
        "..." +
        address.substr(address.length - rightOffset, address.length)
      );
    },
    nftshop() {
      this.$router.push("/shop");
    },
    disconnect() {
      Web3Wrapper.disconnect();
    },
  },
};
</script>
<style scoped>
.nav-bar {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 5px 2rem;
}
</style>
