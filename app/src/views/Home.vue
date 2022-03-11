<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    {{ obj }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useData } from "./hooks/index";

export default defineComponent({
  name: "Home",
  setup() {
    const { obj } = useData();

    return { obj };
  },
});
</script>
