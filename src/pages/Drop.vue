<template>
  <div>
    <div class="background-1"></div>

    <div class="signal">
      <img src="@/static/images/glow-mobile.gif" />
    </div>
    <div class="caption">NFT Reward</div>
    <div class="row drop-container">
      <section class="d1 screen">
        <p class="label">NFT</p>
        <div class="nft-box" v-if="droppedNft.length > 0">
          <pool-item :pools="droppedNft" :hasButton="false" />
        </div>
        <div class="nft-box" v-else>
          <div class="no-nft">No NFT Reward</div>
        </div>
      </section>
      <section class="e2 screen">
        <p class="label">Upgrade</p>
        <div class="upgrade-box">
          <div class="stage-box">
            <img src="@/static/images/stagelabel.png" width="30%" />
            <div class="stage-label">{{ Number(stage) === 0 ? 1 : stage }}</div>
          </div>
          <div>Welcome to NFT dropchance</div>
          <div class="button-group">
            <!-- <button class="button-4" v-if="droppedNft.length" @click="upgrade">
              Upgrade
            </button> -->
            <div v-if="eligible && Number(stage) > 0">
              <button class="button-4" v-if="droppedNft.length > 0" @click="claim">
                Claim
              </button>
              <button class="button-4" @click="moveToNextStage">
                Next Stage
              </button>
            </div>
            <div v-else>
              {{ remainEligibleTimeLabel }}
            </div>
          </div>
        </div>
      </section>
      <section class="screen">
        <p class="label">Chart</p>
        <img width="100%" src="@/static/images/dropchances.gif" />
      </section>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import PoolItem from "../components/PoolItem.vue";
import axios from "axios";
import { Artifact, API_URL, NFTConfig } from "../utils/config";
import { msToTime } from "../utils/helper";

export default {
  data: () => ({
    droppedNft: [],
    eligible: false,
    remainEligibleTime: 0,
    remainEligibleTimeLabel: ""
  }),
  components: { PoolItem },
  computed: {
    ...mapState({
      stage: (state) => state.account.stage,
      address: (state) => state.account.address,
      lastUpdateTime: (state) => state.account.lastUpdateTime,
      reward: (state) => state.account.reward,
      hal9k: (state) => state.contract.hal9k,
      hal9kNftPool: (state) => state.contract.hal9kNftPool,
    }),
  },
  watch: {
    async reward() {
      if (this.reward > 0) {
        this.getCardInfo(this.reward);
      } else {
        this.droppedNft = [];
      }
    },
    async lastUpdateTime() {
      const now = Date.now() / 1000;
      const passedDays = (now - this.lastUpdateTime) / 60 / 60 / 24;
      // const passedDays = (now - this.lastUpdateTime) / 60;
      if (this.reward != 11) {
        this.eligible = true;
        this.remainEligibleTime = 0;
        return;
      }
      if (this.stage == 0) {
        if (passedDays >= 1) {
          this.eligible = true;
        } else {
          this.eligible = false;
          this.remainEligibleTime = Math.floor((60 * 60 * 24) - (now - this.lastUpdateTime));
          this.remainEligibleTimeLabel = `You will be able to get chance to claim after ${msToTime(((60 * 60 * 24) - (now - this.lastUpdateTime)) * 1000)}`;
          this.startTimer();
        }
      }
      if (this.stage == 1) {
        if (passedDays >= 1) {
          this.eligible = true;
        } else {
          this.eligible = false;
          this.remainEligibleTime = Math.floor((60 * 60 * 24) - (now - this.lastUpdateTime));
          this.remainEligibleTimeLabel = `You will be able to get chance to claim after ${msToTime(((60 * 60 * 24 * 2) - (now - this.lastUpdateTime)) * 1000)}`;
          this.startTimer();
        }
      }
      if (this.stage >= 2) {
        if (passedDays >= 2) {
          this.eligible = true;
        } else {
          this.eligible = false;
          this.remainEligibleTime = Math.floor((60 * 60 * 24 * 2) - (now - this.lastUpdateTime));
          this.remainEligibleTimeLabel = `You will be able to get chance to claim after ${msToTime(((60 * 60 * 24 * 2) - (now - this.lastUpdateTime)) * 1000)}`;
          this.startTimer();
        }
      }
    }
  },
  methods: {
    async startTimer() {
      if (this.reward != 11) {
        this.eligible = true;
        this.remainEligibleTime = 0;
        return;
      }
      if (this.remainEligibleTime < 1) {
        this.remainEligibleTimeLabel = "You will be able to get chance to claim soon!";
        return;
      }
      this.remainEligibleTimeLabel = `You will be able to get chance to claim after ${msToTime((this.remainEligibleTime - 1) * 1000)}`;
      this.remainEligibleTime = this.remainEligibleTime - 1;
      if (this.remainEligibleTime >= 1) {
        setTimeout(this.startTimer, 1000);
      }
    },
    async moveStage(backOrForth) {
      // Back if true, Forth if false
       
      const res = await this.hal9kNftPool.methods
        .moveStageBackOrForth(backOrForth)
        .send({ from: this.address });
      if (res && res.events.stageUpdated.returnValues) {
        if (res.events.stageUpdated.returnValues.stage > this.stage) {
          this.$snotify.success(
            `Stage updated to ${res.events.stageUpdated.returnValues.stage}`
          );
        } else {
          this.$snotify.success(
            `Stage downgraded to ${res.events.stageUpdated.returnValues.stage == 0 ? 1 : res.events.stageUpdated.returnValues.stage}`
          );
        }
        await this.setUserReward(this.address, 11);
        this.$store.commit("account/setAccount", {
          lastUpdateTime: res.events.stageUpdated.returnValues.lastUpdateTime,
          reward: 11,
          stage: res.events.stageUpdated.returnValues.stage,
        });
      }
    },
    async getCardInfo(reward) {
      if (reward == 11) {
        this.droppedNft = [];
      } else {
        const response = await axios.get("https://api.hal9k.ai/hals/" + reward);
        this.droppedNft = [
          {
            id: reward,
            image: response.data.image,
            name: response.data.name,
            description: response.data.description,
            max_supply: response.data.attributes[2].value,
          },
        ];
      }
    },
    async setUserReward(address, reward) {
      const userData = {
        address: address,
        reward: reward,
      };
      const response = await axios.post(API_URL + "/hal9k-user", userData);
      this.$store.commit("account/setReward", reward);
    },

    async moveToNextStage() {
      try {
        this.$store.commit("loading", true);
        await this.moveStage(false);
        await this.setUserReward(this.address, 11);
        this.$store.commit("loading", false);
      } catch(error) {
        this.$snotify.error(error.message);
        this.$store.commit("loading", false);
      }
    },
    async claim() {
      if (!this.hal9kNftPool) return;
      // Mint card for user
      try {
        this.$store.commit("loading", true);
        if (this.reward > 0) {
          const returnValue = await this.hal9kNftPool.methods
            .mintCardForUser(0, this.reward, 1)
            .send({ from: this.address });
          if (!returnValue || !returnValue.events.minted.returnValues.cardId) {
            this.$snotify.error("Failed to mint the card!");
            return;
          }
          await this.setUserReward(this.address, 11);
          this.$snotify.success("Successfully minted for you!");
        }
        // await this.moveStage(true); // Move one stage back
        this.$store.commit("loading", false);
      } catch (error) {
        this.$snotify.error(error.message);
        this.$store.commit("loading", false);
      }
    }
  },
  async mounted() {
    if (this.reward > 0) {
      this.getCardInfo(this.reward);
    } else {
      this.droppedNft = [];
    }
    if (!this.stage || !this.lastUpdateTime) {
      return;
    }
    const now = Date.now() / 1000;
    const passedDays = (now - this.lastUpdateTime) / 60 / 60 / 24;
    // const passedDays = (now - this.lastUpdateTime) / 60;

    if (this.stage == 0) {
      if (passedDays >= 1) {
        this.eligible = true;
      } else {
        this.eligible = false;
        this.remainEligibleTime = Math.floor((60 * 60 * 24) - (now - this.lastUpdateTime));
        this.remainEligibleTimeLabel = `You will be able to get chance to claim after ${msToTime(((60 * 60 * 24) - (now - this.lastUpdateTime)) * 1000)}`;
        this.startTimer();
      }
    }
    if (this.stage == 1) {
      if (passedDays >= 2) {
        this.eligible = true;
      } else {
        this.eligible = false;
        this.remainEligibleTime = Math.floor((60 * 60 * 24 * 2) - (now - this.lastUpdateTime));
        this.remainEligibleTimeLabel = `You will be able to get chance to claim after ${msToTime(((60 * 60 * 24 * 2) - (now - this.lastUpdateTime)) * 1000)}`;
        this.startTimer();
      }
    }
    if (this.stage >= 2) {
      if (passedDays >= 2) {
        this.eligible = true;
      } else {
        this.eligible = false;
        this.remainEligibleTime = Math.floor((60 * 60 * 24 * 2) - (now - this.lastUpdateTime));
        this.remainEligibleTimeLabel = `You will be able to get chance to claim after ${msToTime(((60 * 60 * 24 * 2) - (now - this.lastUpdateTime)) * 1000)}`;
        this.startTimer();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.stage-box {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  .stage-label {
    font-size: 2.5rem;
  }
}
.drop-container {
  margin: 2rem 2rem;
}
.nft-box {
  width: 70%;
  margin: auto;
}
.no-nft {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-size: 25px;
}
.upgrade-box {
  padding: 1rem;
  font-size: 1.2em;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
