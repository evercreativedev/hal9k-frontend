<template>
  <main-wrapper>
    <div
      class="zap-container"
      v-if="provider && address && started && !ongoing"
    >
      <div class="zap-caption">ZAPPER</div>
      <div>
        Swap ETH to HAL9K/ETH LP
      </div>
      <div class="input-container">
        <input
          class="zap-input"
          type="number"
          v-model="ethAmount"
          @keyup.enter="swap"
        />
        <button @click="getBalance">MAX</button>
      </div>
      <div class="estimate-container">
        <p>Estimate Amount:</p>
        <div>
          Swap <span class="yellow">{{ ethAmount }}</span> ETH to
          <span class="yellow">{{ estimateLpAmount }}</span> HAL9K/ETH LP
        </div>
      </div>
      <div class="stake-checkbox">
        <input type="checkbox" v-model="autoStake" id="auto-stake" />
        <label for="auto-stake">Stake automatically</label>
      </div>
      <div class="button-group">
        <button @click="swap">SWAP</button>
      </div>
    </div>
    <div v-else-if="!address || !provider">Please connect wallet</div>
    <div v-else-if="!started">Liquidity Event is not started</div>
    <div v-else>Liquidity Event is still ongoing</div>
  </main-wrapper>
</template>

<script>
import BigNumber from "bignumber.js";
import { mapState } from "vuex";
export default {
  data: () => ({
    ethAmount: 0,
    estimateLpAmount: 0,
    autoStake: false,
  }),
  computed: {
    ...mapState({
      started: (state) => state.event.started,
      ongoing: (state) => state.event.ongoing,
      address: (state) => state.account.address,
      web3: (state) => state.metamask.web3,
      provider: (state) => state.metamask.provider,
      hal9kv1Router: (state) => state.contract.hal9kv1Router,
    }),
  },
  watch: {
    async address(value) {
      if (value) await this.loadContract();
    },
    async ethAmount() {
      if (!this.provider) return;
      try {
        if (this.ethAmount <= 0) return;
        this.estimateLpAmount = new BigNumber(
          this.web3.utils.fromWei(
            await this.hal9kv1Router.methods
              .getLPTokenPerEthUnit(this.web3.utils.toWei(this.ethAmount))
              .call()
          )
        ).toFixed(2, 1);
      } catch (err) {
        this.$snotify.error(err.message);
        this.estimateLpAmount = 0;
      }
    },
  },
  methods: {
    async swap() {
      try {
        const {
          transactionHash,
        } = await this.hal9kv1Router.methods
          .addLiquidityETHOnly(this.address, this.autoStake)
          .send({
            from: this.address,
            value: this.web3.utils.toWei(this.ethAmount),
          });
        const tx = await this.web3.eth.getTransactionReceipt(transactionHash);
        if (tx) this.$snotify.success(`Successfully swapped ${this.ethAmount}`);
      } catch (error) {
        this.$snotify.error(error.message);
      }
    },
    async getBalance() {
      if (!this.web3) return;
      const balance = await this.web3.eth.getBalance(this.address);
      this.ethAmount = new BigNumber(this.web3.utils.fromWei(balance)).toFixed(
        2,
        1
      );
    },
    async loadContract() {
      if (!this.provider || !this.hal9kv1Router) return;
      await this.getBalance();
    },
  },
  async mounted() {
    await this.loadContract();
  },
};
</script>
<style lang="scss" scoped>
.zap-input {
  color: white;
  border: 1px solid white;
  font-size: 1rem;
  background: transparent;
  padding: 3px 5px;
  outline: none;
  width: 100%;
}
.estimate-container {
  margin: 1rem 0;
}
.input-container {
  display: flex;
  margin: 1rem 0;
  justify-content: space-between;
  align-items: center;
}
.zap-caption {
  font-weight: 800;
  font-size: 1.4rem;
  padding: 5px;
  letter-spacing: 3px;
}
.stake-checkbox {
  margin: 1rem 0;
  display: flex;
  align-items: center;
}
</style>
