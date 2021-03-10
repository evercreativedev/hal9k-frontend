<template>
  <div>
    <loading v-if="loading" />
    <nav-bar />
    <router-view />
    <vue-snotify />
  </div>
</template>
<script>
import { mapState } from "vuex";
import { Artifact, API_URL, NFTConfig } from "./utils/config";
import axios from "axios";
import Loading from "./Loading";
export default {
  data: () =>  ({
    timerStarted: false
  }),
  components: {
    Loading,
  },
  computed: {
    ...mapState({
      loading: (state) => state.loading,
      address: (state) => state.account.address,
      stage: (state) => state.account.stage,
      lastUpdateTime: (state) => state.account.lastUpdateTime,
      hal9k: (state) => state.contract.hal9k,
      hal9kVault: (state) => state.contract.hal9kVault,
      hal9kNftPool: (state) => state.contract.hal9kNftPool,
      web3: (state) => state.metamask.web3,
      provider: (state) => state.metamask.provider,
      stakingStarted: (state) => state.account.stakingStarted,
      reward: (state) => state.account.reward
    }),
  },
  watch: {
    async address() {
      await this.load();
    },
    async provider() {
      await this.load();
    },
    async stakingStarted(value) {
      if (value) await this.load();
    },
  },
  methods: {
    getCardType(category) {
      let cardType = 0;
      switch (category) {
        case 1: // Common
          cardType = Math.floor(Math.random() * 5);
          break;
        case 2: // Rare
          cardType = Math.floor(Math.random() * 4) + 4;
          break;
        case 3: // Epic
          cardType = Math.floor(Math.random() * 3) + 7;
          break;
        case 4: // Legendary
        default:
          cardType = 10;
          break;
      }
      return cardType;
    },
    getRewardByStage(dropNumber, stage) {
      console.log("getRewardByStage() dropNumber, stage => ", dropNumber, stage);
      let dropchance;
      let sum = 0;
      if (stage === 1) {
        dropchance = NFTConfig.dropChanceByStage.stage1;
      } else if (stage === 2) {
        dropchance = NFTConfig.dropChanceByStage.stage2;
      } else if (stage >= 3) {
        dropchance = NFTConfig.dropChanceByStage.stage3;
      }

      for (let i = 0; i < dropchance.length; i++) {
        sum += dropchance[i];
        if (dropNumber <= sum) {
          return this.getCardType(i + 1);
        }
      }
      return 0;
    },
    async startTimer() {
      if (this.timerStarted) {
        return;
      }
      this.timerStarted = true;
      if (this.lastUpdateTime) {
        const now = Date.now() / 1000;
        // const passedDays = (now - this.lastUpdateTime) / 60 / 60 / 24;
        const passedDays = (now - this.lastUpdateTime) / 60;
        let dropNum = Math.floor(Math.random() * 10001);
        console.log("timer() dropNum => ", dropNum);
        // If already entered the stage but got no reward as a dropchance,
        // set it 11 so that he can get reward in the next stage
        // Entered a new stage and get reward by dropchance

        if (this.stage == 0 && passedDays >= 1) {
          // Stage 1
          let reward = 0;
          this.$store.commit("loading", true);
          if (this.reward == 11) {
            if (dropNum < NFTConfig.dropChanceByStage.stage1Total) {
              this.$snotify.info(
                "Congratulations! You received NFT rewards for stage 1!"
              );
              reward = this.getRewardByStage(dropNum, 1);
              await this.setUserReward(this.address, reward);
            } else {
              this.$snotify.info(
                "You've successfully entered to Stage 1, but you're unlucky to nail the NFT reward."
              );
              await this.setUserReward(this.address, 0);
            }
          }
          try {
            const res = await this.hal9kNftPool.methods
              .moveStageBackOrForth(false)
              .send({ from: this.address });
            if (res && res.events.stageUpdated.returnValues.stage > this.stage) {
              this.$snotify.success(
                `Stage updated to ${res.events.stageUpdated.returnValues.stage}`
              );
              // await this.setUserReward(this.address, 11);
              this.$store.commit("account/setAccount", {
                lastUpdateTime: res.events.stageUpdated.returnValues.lastUpdateTime,
                reward,
                stage: res.events.stageUpdated.returnValues.stage,
              });
            }
            this.$store.commit("loading", false);
          } catch (error) {
            this.$snotify.error(error.message);
            this.$store.commit("loading", false);
          }
        } else if (this.stage == 1 && passedDays >= 1 && this.reward == 11) {
          // Stage 1
          this.$store.commit("loading", true);
          let reward = 0;
          if (dropNum < NFTConfig.dropChanceByStage.stage1Total) {
            this.$snotify.info(
              "Congratulations! You received NFT rewards for stage 1!"
            );
            reward = this.getRewardByStage(dropNum, 1);
            await this.setUserReward(this.address, reward);
          } else {
            this.$snotify.info(
              "You've successfully entered to Stage 1, but you're unlucky to nail the NFT reward."
            );
            await this.setUserReward(this.address, 0);
          }
          this.$store.commit("loading", false);
        } else if (this.stage == 2 && passedDays >= 2 && this.reward == 11) {
          // Stage 2
          this.$store.commit("loading", true);
          let reward = 0;
          if (dropNum < NFTConfig.dropChanceByStage.stage2Total) {
            this.$snotify.info(
              "Congratulations! You received NFT rewards for stage 2!"
            );
            reward = this.getRewardByStage(dropNum, 2);
            await this.setUserReward(this.address, reward);
          } else {
            this.$snotify.info(
              "You've successfully entered to Stage 2, but you're unlucky to nail the NFT reward."
            );
            await this.setUserReward(this.address, 0);
          }
          this.$store.commit("loading", false);
        } else if (this.stage >= 3 && passedDays >= 2 && this.reward == 11) {
          // Stage 3 and above
          this.$store.commit("loading", true);
          if (dropNum < NFTConfig.dropChanceByStage.stage3Total) {
            this.$snotify.info(
              `Congratulations! You received NFT rewards for stage ${this
                .stage + 1}!`
            );
            let reward = this.getRewardByStage(dropNum, Number(this.stage) + 1);
            await this.setUserReward(this.address, reward);
          } else {
            this.$snotify.info(
              `You've successfully entered to Stage ${this.stage +
                1}, but you're unlucky to nail the NFT reward.`
            );
            await this.setUserReward(this.address, 0);
          }
          this.$store.commit("loading", false);
        }
      }
      this.timerStarted = false;
      setTimeout(this.startTimer, 1000 * 60 * 5);
    },
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
    async setUserReward(address, reward) {
      const userData = {
        address: address.toLowerCase(),
        reward: reward,
        lastUpdateTime: null,
        stage: null,
      };
      const response = await axios.post(API_URL + "/hal9k-user", userData);
      this.$store.commit("account/setReward", reward);
    },
    async prepare() {
      if (!this.hal9kVault || !this.hal9k) return;
      // Add new pool
      await this.hal9kVault.methods
        .add(100, Artifact.pairAddress, false, false)
        .send({ from: this.address });
      // Start Hal9k LGE
      await this.hal9k.methods
        .startLiquidityGenerationEventForHAL9K()
        .send({ from: this.address });
    },
    async isHal9kStakingStarted(sender) {
      if (!this.hal9kNftPool) return;
      const res = await this.hal9kNftPool.methods
        .isHal9kStakingStarted(sender)
        .call({ from: this.address });
      return res;
    },
    async getReward(address) {
      const response = await axios.get(API_URL + "/hal9k-user", {
        params: { address: address },
      });
      if (response.data.reward !== null && response.data.reward !== undefined) {
        this.$store.commit("account/setReward", response.data.reward);
        return true;
      } else {
        this.$store.dispatch("account/clearAccount");
        return false;
      }
    },
    async getStakeStartTime(sender) {
      if (!this.hal9kNftPool) return;
      const res = await this.hal9kNftPool.methods
        .getStakeStartTime(sender)
        .call({ from: this.address });
    },
    async getLastUpdateTime(sender) {
      if (!this.hal9kNftPool) return;
      const res = await this.hal9kNftPool.methods
        .getLastUpdateTime(sender)
        .call({ from: this.address });
      this.$store.commit("account/setLastUpdateTime", res);
    },
    async getStakedAmount(sender) {
      if (!this.hal9kNftPool) return;
      const res = await this.hal9kNftPool.methods
        .getStakedAmountOfUser(sender)
        .call({ from: this.address });
    },
    async getCurrentStage(sender) {
      if (!this.hal9kNftPool) return;
      const res = await this.hal9kNftPool.methods
        .getCurrentStage(sender)
        .call({ from: this.address });
      this.$store.commit("account/setStage", res);
    },
    async confirmVaultInitialize() {
      if (!this.hal9kVault) return;
      const res = await this.hal9kVault.methods._hal9kNftPool().call();
    },
    async load() {
      if (!this.hal9k) return;
      const startTimestamp = await this.hal9k.methods
        .contractStartTimestamp()
        .call();
      if (startTimestamp <= 0) return;
      this.$store.commit("event/setStarted", true);
      const liquidityOngoing = await this.hal9k.methods
        .liquidityGenerationOngoing()
        .call();
      this.$store.commit("event/setOngoing", liquidityOngoing);
      const isStakingStarted = await this.isHal9kStakingStarted(this.address);
      if (!isStakingStarted) return;
      await this.getReward(this.address);
      await this.getCurrentStage(this.address);
      await this.getStakeStartTime(this.address);
      await this.getLastUpdateTime(this.address);
      await this.getStakedAmount(this.address);
      this.startTimer();
    },
    async updateWaitTimeUnit(seconds) {
      if (!this.hal9kNftPool) return;
      const res = await this.hal9kNftPool.methods
        .updateWaitTimeUnit(seconds)
        .send({ from: this.address });
      if (res.events.waitTimeUnitUpdated.returnValues.waitTimeUnit) {
        this.$snotify.success("Successfully updated wait time unit");
      }
    },
    async getStakedAmountOfUser(sender) {
      if (!this.hal9kNftPool) return;
      const res = await this.hal9kNftPool.methods
        .getStakedAmountOfUser(sender)
        .call();
      console.log(res);
    },
  },
  async mounted() {
    await this.load();
  },
};
</script>
<style lang="scss">
@import "./css/style.scss";
@import "./css/pool.scss";
</style>
