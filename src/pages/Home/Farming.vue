<template>
  <main-wrapper>
    <div v-if="provider && address && started && !ongoing">
      <div>
        <img width="30%" src="@/static/images/farm.png" />
      </div>
      <p>
        HAL9K/ETH Stake Pool
      </p>
      <div class="info-box">
        <!-- <div>
          <span class="yellow">{{ apy }}</span> APY
        </div> -->
        <div>
          <span class="yellow">{{ totalStaked }}</span> Tokens Staked (total)
        </div>
        <div>
          <span class="yellow">{{ yourStaked }}</span> Tokens Staked (yours)
        </div>
        <div>
          <span class="yellow">{{ claimableHal9k }}</span> Claimable HAL9K
        </div>
      </div>
      <input
        class="stake-input"
        type="number"
        v-model="stakeAmount"
        @keyup.enter="stake"
      />
      <div class="button-group">
        <button v-if="!isApproved" @click="approve">Approve LP</button>
        <button v-else @click="stake">Stake</button>
        <button @click="claim">Claim</button>
        <button @click="withdraw">Withdraw</button>
      </div>
    </div>
    <div v-else-if="!address || !provider">Please connect wallet</div>
    <div v-else-if="!started">Liquidity Event is not started</div>
    <div v-else>Liquidity Event is still ongoing</div>
  </main-wrapper>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import { Artifact, API_URL } from "../../utils/config";
import BigNumber from "bignumber.js";
export default {
  data: () => ({
    totalStaked: 0,
    apy: 0,
    stakeAmount: 0,
    yourStaked: 0,
    claimableHal9k: 0,
    isApproved: false,
  }),
  computed: {
    ...mapState({
      started: (state) => state.event.started,
      ongoing: (state) => state.event.ongoing,
      address: (state) => state.account.address,
      lastUpdateTime: (state) => state.account.lastUpdateTime,
      hal9kVault: (state) => state.contract.hal9kVault,
      hal9kWethPair: (state) => state.contract.hal9kWethPair,
      hal9kNftPool: (state) => state.contract.hal9kNftPool,
      web3: (state) => state.metamask.web3,
      provider: (state) => state.metamask.provider,
    }),
  },
  watch: {
    async address(value) {
      if (value) await this.loadContract();
    },
  },
  methods: {
    /****************** SMART CONTRACT METHODS **********************/
    async getDaysPassedAfterStakingStart() {
      //TODO: Test Needed
      const passedDays = await this.hal9kNftPool.methods
        .getDaysPassedAfterStakingStart()
        .call();
      console.log(passedDays);
      return passedDays;
    },
    async getDaysPassedAfterLastUpdateTime() {
      const passedDays = await this.hal9kNftPool.methods
        .getDaysPassedAfterLastUpdateTime()
        .call();
      console.log(passedDays);
      return passedDays;
    },
    async getCurrentStage() {
      const currentStage = await this.hal9kNftPool.methods
        .getCurrentStage()
        .call();
      console.log(currentStage);
      return currentStage;
    },

    /****************** BACKEND CALL METHODS **********************/
    async createUser(address, reward) {
      const userData = {
        address: address,
        reward: reward,
      };
      const response = await axios.put(API_URL + "/hal9k-user", userData);
      if (response.data.address) {
        this.$snotify.info("Your NFT dropchance has started!");
      }
    },
    async updateUser(address, reward) {
      const userData = {
        address: address,
        reward: reward,
      };
      const response = await axios.post(API_URL + "/hal9k-user", userData);
      console.log("Successfully updated the user :", response);
    },
    /****************************************/
    async claim() {
      try {
        this.$store.commit("loading", true);
        const { transactionHash } = await this.hal9kVault.methods
          .withdraw(0, 0)
          .send({ from: this.address });
        const tx = await this.web3.eth.getTransactionReceipt(transactionHash);
        if (tx) await this.checkVaultInfo();
        this.$store.commit("loading", false);
      } catch (error) {
        this.$snotify.error(error.message);
        console.error(error);
        this.$store.commit("loading", false);
      }
    },
    async withdraw() {
      try {
        this.$store.commit("loading", true);
        const { transactionHash } = await this.hal9kVault.methods
          .withdraw(0, this.web3.utils.toWei(this.stakeAmount))
          .send({ from: this.address });
        const tx = await this.web3.eth.getTransactionReceipt(transactionHash);
        if (tx) await this.checkVaultInfo();
        this.$store.commit("loading", false);
      } catch (error) {
        this.$snotify.error(error.message);
        console.error(error);
        this.$store.commit("loading", false);
      }
    },
    async stake() {
      try {
        this.$store.commit("loading", true);
        const res = await this.hal9kVault.methods
          .deposit(0, this.web3.utils.toWei(this.stakeAmount))
          .send({ from: this.address });
        const startTime = res.events.Deposit.returnValues.startTime;
        this.$store.commit("account/setLastUpdateTime", startTime);
        const tx = await this.web3.eth.getTransactionReceipt(
          res.transactionHash
        );
        if (tx) {
          await this.checkVaultInfo();
          this.$snotify.success("Deposit succeed...");
          if (!this.lastUpdateTime) {
            await this.createUser(this.address, 11);
            this.$snotify.success("Staking started...");
            this.$store.commit("account/setStakingStarted", true);
          } else {
            await this.updateUser(this.address, 11);
          }
          this.$store.commit("loading", false);
        }
      } catch (error) {
        this.$snotify.error(error.message);
        console.error(error);
        this.$store.commit("loading", false);
      }
    },
    async approve() {
      try {
        this.$store.commit("loading", true);
        const res = await this.hal9kWethPair.methods
          .approve(
            Artifact.hal9kVault,
            new BigNumber(10).pow(new BigNumber(60)).toFixed()
          )
          .send({ from: this.address });
        if (res.transactionHash) await this.checkAllowance();
        this.$store.commit("loading", false);
      } catch (err) {
        this.$snotify.error(error.message);
        console.error(err.message);
        this.$store.commit("loading", false);
      }
    },
    async checkAllowance() {
      try {
        const allowance = await this.hal9kWethPair.methods
          .allowance(this.address, Artifact.hal9kVault)
          .call();
        if (allowance > 0) this.isApproved = true;
      } catch (error) {
        this.$snotify.error(error.message);
        console.error(error);
        this.isApproved = false;
      }
    },
    async checkVaultInfo() {
      try {
        const res = await this.hal9kWethPair.methods
          .balanceOf(Artifact.hal9kVault)
          .call();
        this.totalStaked = new BigNumber(this.web3.utils.fromWei(res)).toFixed(
          3,
          1
        );
        const { amount } = await this.hal9kVault.methods
          .userInfo(0, this.address)
          .call();
        this.yourStaked = new BigNumber(
          this.web3.utils.fromWei(this.web3.utils.toBN(amount || 0))
        ).toFixed(3, 1);
        const pendingHal9k = await this.hal9kVault.methods
          .pendingHal9k(0, this.address)
          .call();
        this.claimableHal9k = new BigNumber(
          this.web3.utils.fromWei(pendingHal9k)
        ).toFixed(3, 1);
      } catch (error) {
        this.$snotify.error(error.message);
        console.error(error);
      }
    },
    async loadContract() {
      if (!this.hal9kWethPair) return;
      await this.checkAllowance();
      await this.checkVaultInfo();
    },
  },
  async mounted() {
    await this.loadContract();
  },
};
</script>
<style lang="scss" scoped>
.stake-input {
  margin-bottom: 1rem;
  color: white;
  padding: 3px;
  border: 1px solid white;
  background: transparent;
  outline: none;
}
</style>
