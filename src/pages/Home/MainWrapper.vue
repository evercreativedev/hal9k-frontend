<template>
  <main>
    <div class="background-1"></div>
    <div class="row">
      <section class="c1 screen">
        <p class="label">C 1</p>
        <DestinationBox />
      </section>
      <section class="empty" v-responsive="['hidden-all', 'lg']"></section>
      <section class="c2 screen">
        <p class="label">C 2</p>
        <div class="c2-container">
          <slot></slot>
        </div>
      </section>
      <section class="empty" v-responsive.xl></section>
      <section class="c3 screen" v-responsive.xl.xs>
        <p class="label">C 3</p>
        <img width="100%" src="@/static/images/c3.gif" />
      </section>
      <section class="c4 screen" v-responsive.xl.xs>
        <p class="label">C 4</p>
        <img width="100%" src="@/static/images/c4.gif" />
      </section>
    </div>
    <div class="row">
      <section class="c5 screen">
        <p class="label">C 5</p>
        <img width="100%" src="@/static/images/c5.gif" />
      </section>
      <section class="c6 screen" v-responsive.xl.xs>
        <p class="label">C 6</p>
        <img width="100%" src="@/static/images/c6.gif" />
      </section>
      <section class="loading" v-responsive.lg.xl>
        <img width="45%" src="@/static/images/hal9kloading.gif" />
      </section>
      <section class="c7 screen">
        <p class="label">C 7</p>
        <img width="100%" src="@/static/images/c7.gif" />
      </section>
      <section class="c8 screen" v-responsive.xl.xs>
        <p class="label">C 8</p>
        <img width="100%" src="@/static/images/c8.gif" />
      </section>
    </div>
  </main>
</template>

<script>
import DestinationBox from "@/components/DestinationBox";
export default {
  components: {
    DestinationBox,
  },
};
</script>

<style scoped></style>
