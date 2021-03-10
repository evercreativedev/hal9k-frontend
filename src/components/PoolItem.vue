<template>
  <section>
    <div v-for="(nft, index) in pools" :key="index" class="pool-item">
      <div class="pool-image">
        <img :src="nft.image" :alt="nft.name" />
      </div>
      <!-- <div class="indicator">
          <div class="left" :class="{ 'left-radius': nft.owns || nft.minted }">
            {{ nft.max_supply }} MAX
          </div>
          <div class="right" v-if="nft.minted">{{ nft.minted }} MINTED</div>
          <div class="right" v-else-if="nft.owns">{{ nft.owns }} Own</div>
        </div> -->
      <div class="pool-info">
        <div class="pool-info-left">
          <div class="nft-count">
            <span class="remaining">{{ getRemainString(nft) }}</span
            ><span class="supply"> / {{ nft.max_supply }}</span> Left
          </div>
          <div class="nft-name">{{ nft.name }}</div>
          <div class="nft-description">{{ nft.description }}</div>
          <div class="nft-own" v-if="nft.owns">{{ nft.owns }} Owned</div>
          <button class="button-3" @click="onClick(nft)" v-if="hasButton">
            {{ buttonText }}
          </button>
        </div>
        <div class="pool-info-right" v-if="showMarketInfo">
          <div
            v-if="nft.sellStartTime && nft.sellEndTime"
            class="info-container"
          >
            <div class="info-label">Start Date:</div>
            <div class="info-data">{{ toString(nft.sellStartTime) }}</div>
            <div class="info-label">End Date:</div>
            <div class="info-data">{{ toString(nft.sellEndTime) }}</div>
            <div class="info-label">Stock:</div>
            <div class="count-label">
              {{ `${nft.cardAmount - nft.soldAmount}/${nft.cardAmount} Left` }}
            </div>
            <div class="info-label">Price:</div>
            <div class="price-label">{{ nft.price }} ETH</div>
          </div>
          <div v-else class="info-empty-container">
            Selling is not started yet so you can't buy right now, Dave
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { dateFormat } from "@/utils/helper.js";
export default {
  props: {
    pools: {
      type: Array,
      default: [],
    },
    showMarketInfo: {
      type: Boolean,
      default: false,
    },
    buttonText: {
      type: String,
    },
    hasButton: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    toString(timestamp) {
      return dateFormat(timestamp);
    },
    getRemainString(item) {
      return item.max_supply - (item.minted ? item.minted : 0);
    },
    onClick(nft) {
      this.$emit("click", nft);
    },
  },
};
</script>

<style lang="scss" scoped></style>
