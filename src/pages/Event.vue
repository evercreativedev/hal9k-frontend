<template>
  <div>
    <div class="signal">
      <img src="@/static/images/glow-mobile.gif" />
    </div>
    <div class="row event-container">
      <section class="e1 screen">
        <p class="label">LGE 1</p>
        <div class="lge-box">
          <img class="blink" src="@/static/images/lge1.png" width="30%" />
          <div class="info-box">
            <div>
              <span class="yellow">{{ totalEthContributed }}</span> ETH Total
              Contributed
            </div>
            <div>
              <span class="yellow">$ {{ halPrice }}</span> HAL9K Price Estimate
              after LGE
            </div>
            <div>
              <span class="yellow">$ {{ marketCap }}</span> Market Cap
            </div>
          </div>
          <div v-if="address && event.started">
            <div v-if="event.ongoing">
              <div class="deposit-box">
                <div>Deposit ETH:</div>
                <input
                  class="deposit-input"
                  v-model="ethToDeposit"
                  @keyup.enter="addLiquidity"
                />
              </div>
              <div class="agree-container">
                <input type="checkbox" v-model="agree" id="agree-box" />
                <label for="agree-box">
                  I understand that this contract is provided with no warranty
                  of any kind. I agree to not hold the contract creators, HAL9K
                  team members or anyone associated with this event liable for
                  any damage monetary and otherwise I might occur. I understand
                  that any smart contract interaction carries an inherent risk.
                </label>
              </div>
              <button
                class="event-but"
                :disabled="!agree"
                @click="addLiquidity"
              >
                ADD LIQUIDITY
              </button>
            </div>
            <div v-else>
              <button class="event-but" @click="claimLpToken">
                CLAIM LP TOKENS
              </button>
            </div>
          </div>
        </div>
      </section>
      <section class="e2 screen">
        <p class="label">EVENT</p>
        <div class="event-box">
          <div class="progress-box">
            <img
              class="blink"
              src="@/static/images/eventlabel.png"
              width="30%"
            />
            <progress
              max="100"
              :value="value"
              v-if="event.started && event.ongoing"
            ></progress>
          </div>
          <div v-if="event.started" class="count-container">
            <div v-if="event.ongoing">
              <p>Liquidity Event Ends:</p>
              <p>{{ toString(event.endTimeStamp) }}</p>
              <p>
                <span v-if="day">{{ day }} days </span>
                <span v-if="hour">{{ hour }} hours </span>
                <span v-if="min">{{ min }} mins </span
                ><span>{{ sec }} secs </span>
                Left
              </p>
            </div>
            <div v-else>Liquidity Event is ended</div>
          </div>
          <div v-else-if="event.scheduled" class="count-container">
            <p>Liquidity Event Will Begin:</p>
            <p>{{ toString(event.startTimeStamp) }}</p>
            <p>
              <span v-if="day">{{ day }} days</span>
              <span v-if="hour">{{ hour }} hours</span>
              <span v-if="min">{{ min }} mins</span><span>{{ sec }} secs</span>
              Left
            </p>
          </div>
          <div v-else class="count-container">
            <p>Liquidity Event is not scheduled yet.</p>
          </div>
          <img class="blink" src="@/static/images/event.png" width="70%" />
        </div>
      </section>
      <section class="screen">
        <p class="label">C 3</p>
        <img width="100%" src="@/static/images/c7.gif" />
      </section>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import { dateFormat } from "@/utils/helper.js";
import BigNumber from "bignumber.js";
export default {
  data: () => ({
    agree: false,
    value: 0,
    day: 0,
    hour: 0,
    min: 0,
    sec: 0,
    totalEthContributed: 0,
    halPrice: 0,
    marketCap: 0,
    ethToDeposit: 0,
    usdPrice: 0,
    currentTimestamp: 0,
  }),

  computed: {
    ...mapState({
      address: (state) => state.account.address,
      event: (state) => state.event,
      hal9k: (state) => state.contract.hal9k,
      web3: (state) => state.metamask.web3,
      provider: (state) => state.metamask.provider,
    }),
  },
  watch: {
    async address(value) {
      if (value) await this.loadContract();
    },
    ethToDeposit() {
      this.ethToDeposit = String(this.ethToDeposit).replace(/[^0-9.]/, "");
    },
  },
  methods: {
    toString(timestamp) {
      return dateFormat(timestamp);
    },
    async fetchTokenPrice() {
      const {
        data: {
          ethereum: { usd: ethUSD },
        },
      } = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      this.usdPrice = ethUSD;
      setTimeout(this.fetchTokenPrice, 60000);
    },
    countDownBeforeEnd() {
      if (!this.address || !this.provider) return;
      this.currentTimestamp = Math.round(new Date().getTime() / 1000);
      const leftSecs = this.event.endTimeStamp - this.currentTimestamp;
      this.value = Math.floor(
        ((this.currentTimestamp - this.event.startTimeStamp) /
          this.event.duration) *
          100
      );
      this.sec = leftSecs % 60;
      this.min = Math.floor(leftSecs / 60) % 60;
      this.hour = Math.floor(leftSecs / 60 / 60) % 24;
      this.day = Math.floor(leftSecs / 60 / 60 / 24);
      if (leftSecs <= 0) {
        this.$store.commit("event/setOngoing", false);
        return;
      }
      setTimeout(() => this.countDownBeforeEnd(), 1000);
    },
    countDownBeforeStart() {
      if (!this.address || !this.provider) return;
      this.currentTimestamp = Math.round(new Date().getTime() / 1000);
      const leftSecs = this.event.startTimeStamp - this.currentTimestamp;
      this.sec = leftSecs % 60;
      this.min = Math.floor(leftSecs / 60) % 60;
      this.hour = Math.floor(leftSecs / 60 / 60) % 24;
      this.day = Math.floor(leftSecs / 60 / 60 / 24);
      if (leftSecs <= 0) {
        this.$store.commit("event/setStarted", true);
        this.$store.commit("event/setOngoing", true);
        this.countDownBeforeEnd();
        return;
      }
      setTimeout(() => this.countDownBeforeStart(), 1000);
    },
    async getTokenInfo() {
      if (!this.hal9k) return;
      const res = await this.hal9k.methods.totalETHContributed().call();
      this.totalEthContributed = Math.max(0, this.web3.utils.fromWei(res));
      const totalSupply = await this.hal9k.methods.totalSupply().call();
      this.halPrice = new BigNumber(
        (this.totalEthContributed / this.web3.utils.fromWei(totalSupply)) *
          this.usdPrice
      ).toFixed(5);
      this.marketCap = new BigNumber(
        this.totalEthContributed * this.usdPrice
      ).toFixed(5);
    },
    async claimLpToken() {
      try {
        const res = await this.hal9k.methods.claimLPTokens().send({
          from: this.address,
        });
        if (res.events.LPTokenClaimed.returnValues.value) {
          this.$snotify.success("Successfully claimed LP");
        }
      } catch (error) {
        this.$snotify.error(error.message);
      }
    },
    async addLiquidity($event) {
      if (!this.agree || !this.hal9k || !parseFloat(this.ethToDeposit)) return;
      try {
        const ethToDeposit = this.web3.utils.toWei(this.ethToDeposit);
        const returnValue = await this.hal9k.methods
          .addLiquidity(this.agree)
          .send({
            from: this.address,
            value: ethToDeposit,
          });
        if (
          returnValue &&
          returnValue.events.LiquidityAddition.returnValues.value ===
            ethToDeposit
        ) {
          this.$snotify.success("Successfully deposited");
          await this.getTokenInfo();
        }
      } catch (e) {
        console.log(e);
        this.$snotify.error(e.message);
      }
    },
    async loadContract() {
      if (!this.hal9k) return;
      try {
        this.$store.commit("loading", true);
        await this.fetchTokenPrice();

        ///////

        const startTimestamp = await this.hal9k.methods
          .contractStartTimestamp()
          .call();
        this.$store.commit("event/setScheduled", startTimestamp > 0);
        if (startTimestamp <= 0) return;

        const endTimeStamp = await this.hal9k.methods
          .contractEndTimestamp()
          .call();
        const lgeDuration = await this.hal9k.methods.lgeDuration().call();

        this.$store.commit("event/setStartTimeStamp", parseInt(startTimestamp));

        this.$store.commit("event/setEndTimeStamp", parseInt(endTimeStamp));

        this.$store.commit("event/setDuration", parseInt(lgeDuration));

        const isStarted = await this.hal9k.methods
          .isLiquidityEventStarted()
          .call();
        this.$store.commit("event/setStarted", isStarted);
        if (parseInt(startTimestamp) > 0 && !isStarted) {
          this.countDownBeforeStart();
          this.$store.commit("loading", false);
          return;
        }
        const liquidityOngoing = await this.hal9k.methods
          .liquidityGenerationOngoing()
          .call();
        this.$store.commit("event/setOngoing", liquidityOngoing);
        ///////
        if (isStarted && liquidityOngoing) {
          const balance = await this.web3.eth.getBalance(this.address);
          this.ethToDeposit = new BigNumber(
            this.web3.utils.fromWei(balance)
          ).toFixed(2, 1);
          this.countDownBeforeEnd();
        }
        await this.getTokenInfo();
        this.$store.commit("loading", false);
      } catch (e) {
        console.log(e);
        this.$store.commit("loading", false);
        this.$snotify.error(e.message);
      }
    },
  },

  async mounted() {
    await this.loadContract();
  },
};
</script>

<style lang="scss" scoped>
.event-container {
  margin: 0 2rem;
}
.lge-box,
.event-box {
  padding: 1rem;
  font-size: 1.2em;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.count-container {
  font-size: 20px;
  text-align: left;
  p {
    font-weight: 500;
  }
}
.deposit-box {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.deposit-input {
  font-family: inherit;
  font-size: 17px;
  outline: none;
  width: 60%;
  color: white;
  padding: 0 5px;
  background: transparent;
  border: 1px solid rgb(255, 255, 255);
}
.info-box {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.agree-container {
  margin-bottom: 20px;
}
.progress-box {
  display: flex;
  flex-direction: row;
  gap: 20px;
  progress {
    flex: 1;
  }
}

.event-but {
  background: transparent;
  border: 1px solid white;
  color: white;
  margin: auto;
  &:disabled {
    border: 1px solid #fff3;
    color: #fff3;
  }
}
</style>
