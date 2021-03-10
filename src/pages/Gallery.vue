<template>
  <div class="shop-page">
    <div class="background-1"></div>
    <div class="signal">
      <img src="@/static/images/glow-mobile.gif" />
    </div>
    <div class="caption">NFT Gallery</div>
    <div class="pool-container">
      <pool-item
        :pools="pools"
        buttonText="Check Open Sea"
        @click="checkOpenSea"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import PoolItem from "@/components/PoolItem";
import { POOLS_KEY, Artifact } from "@/utils/config";
export default {
  data: () => ({
    pools: [],
  }),
  computed: {
    ...mapState({
      web3: (state) => state.metamask.web3,
      address: (state) => state.account.address,
      provider: (state) => state.metamask.provider,
      hal9kLtd: (state) => state.contract.hal9kLtd,
    }),
  },
  components: {
    PoolItem,
  },
  watch: {
    async address(value) {
      console.log(value);
      if (value) await this.loadContract();
    },
  },
  async mounted() {
    await this.loadContract();
  },
  methods: {
    checkOpenSea(item) {
      window.open(`https://opensea.io/assets/${Artifact.hal9kLtd}/${item.id}`);
    },
    async loadContract() {
      await this.loadPool("V1968");
    },
    async loadPool(pool) {
      if (!this.hal9kLtd) return;
      this.$store.commit("loading", true);
      const { data } = await axios.get(POOLS_KEY + pool);
      try {
        data.map(async (card) => {
          const res = await this.hal9kLtd.methods.totalSupply(card.id).call();
          this.pools = [...this.pools, { ...card, minted: parseInt(res) }];
        });
      } catch (error) {
        console.error(error);
        this.$snotify.error(error.message);
      }
      this.$store.commit("loading", false);
    },
  },
};
</script>
<style lang="scss" scoped></style>
