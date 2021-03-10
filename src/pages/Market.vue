<template>
  <div class="shop-page">
    <div class="background-1"></div>
    <div class="signal">
      <img src="@/static/images/glow-mobile.gif" />
    </div>
    <div class="caption">Market</div>
    <div class="pool-container">
      <pool-item
        :pools="pools"
        buttonText="Buy"
        @click="buy"
        :showMarketInfo="true"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import PoolItem from "@/components/PoolItem";
import { POOLS_KEY, MULTISIG_ADDR, UPGRADE_ID } from "@/utils/config";
export default {
  data: () => ({
    pools: [],
  }),
  components: {
    PoolItem,
  },
  computed: {
    ...mapState({
      web3: (state) => state.metamask.web3,
      provider: (state) => state.metamask.provider,
      hal9kLtd: (state) => state.contract.hal9kLtd,
      address: (state) => state.account.address,
      hal9kNftPool: (state) => state.contract.hal9kNftPool,
    }),
  },
  watch: {
    async address(value) {
      if (value) await this.loadContract();
    },
  },
  async mounted() {
    await this.loadContract();
  },
  methods: {
    async loadContract() {
      if (!this.hal9kLtd || !this.hal9kNftPool) return;
      this.$store.commit("loading", true);
      this.pools = [];
      const { data } = await axios.get(POOLS_KEY + "V1968");
      const upgradeCards = data.filter((elem) => elem.rarity === "Upgrade");
      try {
        upgradeCards.map(async (card) => {
          const res = await this.hal9kLtd.methods.totalSupply(card.id).call();
          const owned = await this.hal9kLtd.methods
            .balanceOf(this.address, card.id)
            .call();
          const {
            sellStartTime,
            sellEndTime,
            cardAmount,
            soldAmount,
            price,
          } = await this.hal9kNftPool.methods.getSellEventData(card.id).call();

          this.pools.push({
            ...card,
            minted: parseInt(res),
            sellStartTime,
            sellEndTime,
            cardAmount,
            soldAmount,
            owns: owned,
            price: price ? this.web3.utils.fromWei(price) : 0,
          });
        });
      } catch (error) {
        console.error(error);
        this.$snotify.error(error.message);
      }
      this.$store.commit("loading", false);
    },
    async buy(item) {
      if (!this.hal9kNftPool) return;
      const { price } = this.pools.find((elem) => elem.id === item.id);
      try {
        const {
          transactionHash,
        } = await this.hal9kNftPool.methods
          .mintCardForUserDuringSellEvent(item.id, 1)
          .send({ from: this.address, value: this.web3.utils.toWei(price) });
        const tx = await this.web3.eth.getTransactionReceipt(transactionHash);
        if (tx) {
          this.$snotify.success("Successfully minted the card");
          await this.loadContract();
        }
      } catch (err) {
        this.$snotify.error(err.message);
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
