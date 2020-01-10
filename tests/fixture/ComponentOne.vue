<template>
  <div id="app">
    <p v-for="item in items" :key="item.property">{{ item.value }}</p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "app",
  data() {
    return {
      items: [{ value: 1 }, { value: 2 }]
    };
  },
  methods() {
    console.log(this.items.value);
  }
});
</script>