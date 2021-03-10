<template>
  <div class="shop-page">
    <div class="background-1"></div>
    <div class="signal">
      <img src="@/static/images/glow-mobile.gif" />
    </div>
    <div class="caption">My Deck</div>
    <div class="stage-container" v-if="stage">Stage {{ Number(stage) === 0 ? 1 : stage }}</div>
    <div class="pool-container" v-if="myDeck.length">
      <div class="upgrade-row">
        You can update your common, rare, epic and legendary NFTs with
        <span class="yellow">Upgrade Eva.</span>
        <button
          class="upgrade-but white"
          :disabled="!isUpgradeSelected"
          @click="upgrade"
        >
          Upgrade
        </button>
      </div>
      <section>
        <div
          v-for="(nft, index) in myDeck"
          :key="index"
          class="pool-item"
          @click="itemClicked(index)"
        >
          <div class="select-indicator" v-show="selected[index]"></div>
          <div class="pool-image">
            <img :src="nft.image" :alt="nft.name" />
          </div>
          <div class="pool-info">
            <div class="pool-info-left">
              <div class="nft-count">
                <span class="remaining">{{ getRemainString(nft) }}</span
                ><span class="supply"> / {{ nft.max_supply }}</span> Left
              </div>
              <div class="nft-name">{{ nft.name }}</div>
              <div class="nft-description">{{ nft.description }}</div>
              <div class="nft-own">{{ nft.owns }} Owned</div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <div class="no-nft" v-else>
      You don't own any NFTs.
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import PoolItem from "@/components/PoolItem";
import { Artifact, API_URL, UPGRADE_ID, NFTConfig } from "../utils/config";
export default {
  data: () => ({
    myDeck: [],
    selected: [],
  }),
  components: {
    PoolItem,
  },
  computed: {
    ...mapState({
      stage: (state) => state.account.stage,
      address: (state) => state.account.address,
      balance: (state) => state.account.balance,
      reward: (state) => state.account.reward,
      provider: (state) => state.metamask.provider,
      hal9kLtd: (state) => state.contract.hal9kLtd,
      hal9kNftPool: (state) => state.contract.hal9kNftPool,
    }),
    isUpgradeSelected() {
      const selectedCount = this.selected.filter((elem) => elem).length;
      const upgradeSelectedIndex = this.selected.findIndex(
        (elem, index) => elem && this.myDeck[index].id === UPGRADE_ID
      );
      if (selectedCount >= 2 && upgradeSelectedIndex >= 0) return true;
      return false;
    },
  },
  watch: {
    async address(value) {
      if (value) await this.readBalance();
    },
  },
  methods: {
    getRemainString(item) {
      return item.max_supply - (item.minted ? item.minted : 0);
    },
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
    itemClicked(index) {
      if (index >= this.selected.length) return;
      this.$set(this.selected, index, !this.selected[index]);
    },
    upgrade() {
      let itemIndexArray = []; //selected index array of mydeck
      let upgradeCardIndex = this.myDeck.findIndex(
        (elem) => elem.id === UPGRADE_ID
      );
      this.selected.map((elem, index) => {
        if (elem && index !== upgradeCardIndex)
          return itemIndexArray.push(index);
      });

      // console.log(itemIndexArray, upgradeCardIndex);
      let upgradeCardCount = parseInt(this.myDeck[upgradeCardIndex].owns);

      itemIndexArray.map((elem, index) => {
        const fromId = this.myDeck[elem].id;
        const fromCount = parseInt(this.myDeck[elem].owns);

        if (fromId > 0 && fromId < 5) {
          // Common to Rare
          if (fromCount >= 25) {
            this.upgradeCard(fromId, 25, this.getCardType(2));
            upgradeCardCount--;
          } else {
            this.$snotify.info(
              "You should have more than 25 Common cards to upgrade to Rare."
            );
          }
        } else if (fromId > 4 && fromId < 8) {
          // Rare to Epic
          if (fromCount >= 3) {
            this.upgradeCard(fromId, 3, this.getCardType(3));
            upgradeCardCount--;
          } else {
            this.$snotify.info(
              "You should have more than 3 Rare cards to upgrade to Epic."
            );
          }
        } else if (fromId > 7 && fromId < 10) {
          // Epic to Legendary
          if (fromCount >= 1) {
            this.upgradeCard(fromId, 1, this.getCardType(4));
            upgradeCardCount--;
          } else {
            this.$snotify.info(
              "You should have more than 1 Epic cards to upgrade to Legendary."
            );
          }
        }
      });
    },
    async upgradeCard(fromType, fromAmount, toType) {
      if (!this.hal9kNftPool) return;
      try {
        console.log(fromType, fromAmount, toType);

        const returnValue = await this.hal9kNftPool.methods
          .upgradeCard(0, fromType, fromAmount, toType, UPGRADE_ID)
          .send({ from: this.address });
        console.log(returnValue);
        if (
          returnValue &&
          parseInt(returnValue.events.upgraded.returnValues.newCardId) ===
            toType
        ) {
          this.$snotify.success("Upgrading Successed");
          await this.readBalance();
        } else {
          this.$snotify.error("Failed to upgrade");
        }
      } catch (err) {
        this.$snotify.error(err.message);
      }
    },
    async readBalance() {
      if (!this.hal9kLtd) return;
      this.$store.commit("loading", true);
      let addresses = [];
      let ids = [];
      this.myDeck = [];

      for (let i = 1; i < 12; i++) {
        ids.push(i);
        addresses.push(this.address);
      }

      const res = await this.hal9kLtd.methods
        .balanceOfBatch(addresses, ids)
        .call();

      for (let i = 0; i < 12; i++) {
        if (res[i] > 0) {
          this.getCardInfo(i + 1, res[i]);
        }
      }
      this.$store.commit("account/setBalance", res);
      this.$store.commit("loading", false);
    },
    async getCardInfo(reward, count) {
      const response = await axios.get("https://api.hal9k.ai/hals/" + reward);
      const minted = await this.hal9kLtd.methods.totalSupply(reward).call();
      this.myDeck.push({
        id: reward,
        image: response.data.image,
        name: response.data.name,
        description: response.data.description,
        max_supply: response.data.attributes[2].value,
        minted,
        owns: count,
      });
      this.selected.push(false);
    },
  },
  async mounted() {
    await this.readBalance();
  },
};
</script>
<style lang="scss" scoped>
.stage-container {
  font-size: 1rem;
  text-align: center;
}
.upgrade-row {
  margin-top: 1rem;
  font-size: 1.1rem;
  text-align: center;
}
.upgrade-but {
  margin-left: 1rem;
  &:disabled {
    border: 1px solid #fff3;
    color: #fff3;
    cursor: not-allowed;
  }
}
.no-nft {
  margin-top: 5rem;
  font-size: 1rem;
  color: white;
  text-align: center;
  display: flex;
  justify-content: center;
}
</style>
