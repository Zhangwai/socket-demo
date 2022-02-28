<template>
  <router-view v-slot="{ Component }">
    <transition :name="transitionName">
      <keep-alive :include="['cached']">
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const transitionName = ref(null || "fade");
    console.log(transitionName);

    return {
      transitionName,
    };
  },
});
</script>
<style lang="less" scoped></style>
