<template>
  <main-wrapper>
    <div>
      <img width="30%" src="@/static/images/tkn.png" />
    </div>
    <p>
      HAL9K Tokenomics
    </p>
    <div class="info-box">
      <div>9000 Total Supply</div>
    </div>
    <button @click="openMedium">Read full article</button>
  </main-wrapper>
</template>

<script>
export default({
  name: 'tokennomics',
  methods: {
    openMedium() {
      window.open("https://hal9k.medium.com/hal9k-an-introduction-6f5e8e8ca88c");
    }
  }
})
</script>

<style scoped></style>
