<template>
  <el-menu :default-active="defaultActive" @select="handleMenu">
    <template v-for="menu in routerList" :key="menu.path">
      <template v-if="!menu.children">
        <el-menu-item :index="menu.path">
          <el-icon>
            <component :is="menu.meta?.icon" />
          </el-icon>
          <span>{{ menu.name }}</span>
        </el-menu-item>
      </template>
      <template v-else>
        <el-sub-menu :index="menu.path">
          <template #title>
            <el-icon> <component :is="menu.meta?.icon" /> </el-icon
            >{{ menu.name }}
          </template>
          <Aside :routerList="menu.children" />
        </el-sub-menu>
      </template>
    </template>
  </el-menu>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Message, Menu as IconMenu, Setting } from "@element-plus/icons-vue";

export default defineComponent({
  name: "Aside",
  props: {
    // 数据列表,递归调用
    routerList: {
      type: Array,
      // default: [],
    },
    // 默认激活菜单的index
    defaultActive: {
      type: String,
      default: "",
    },
  },

  components: {
    Message,
    IconMenu,
  },
  setup(props, { emit }) {
    const router = useRouter();
    const handleMenu = (e: any) => {
      console.log(e);
      router.push(e);
    };

    return {
      handleMenu,
    };
  },
});
</script>

<style lang="less" scoped>
.layout-container {
  height: 100%;

  .logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    margin: 16px;
  }
}
</style>
