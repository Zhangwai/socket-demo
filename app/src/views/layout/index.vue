<template>
  <el-container class="layout-container">
    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
      <el-scrollbar>
        <Aside :defaultActive="routerList[0].path" :routerList="routerList" />
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <div class="toolbar">
          <el-dropdown>
            <el-icon style="margin-right: 8px; margin-top: 1px"
              ><setting
            /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>View</el-dropdown-item>
                <el-dropdown-item>Add</el-dropdown-item>
                <el-dropdown-item>Delete</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span>Tom</span>
        </div>
      </el-header>

      <el-main>
        <el-scrollbar>
          <!-- <el-table :data="tableData">
            <el-table-column prop="date" label="Date" width="140">
            </el-table-column>
            <el-table-column prop="name" label="Name" width="120">
            </el-table-column>
            <el-table-column prop="address" label="Address"> </el-table-column>
          </el-table> -->
          <router-view />
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

import moment from "moment";
import { Message, Menu as IconMenu, Setting } from "@element-plus/icons-vue";

import Aside from "@components/aside/index.vue";
import BreadCrumb from "@components/breadCrumb/index.vue";

export default defineComponent({
  name: "App",

  components: {
    Aside,
    // BreadCrumb,
    // Message,
    // IconMenu,
    Setting,
  },

  setup() {
    const item = {
      date: "2016-05-02",
      name: "Tom",
      address: "No. 189, Grove St, Los Angeles",
    };

    const router = useRouter();
    const routerList = router.options.routes[0].children;
    const tableData = ref(Array(20).fill(item));

    return {
      tableData,
      routerList,
    };
  },
});
</script>

<style lang="less" scoped>
@import "@assets/styles/abstracts/index.less";
.layout-container {
  height: 100%;
  overflow: hidden;

  .el-header {
    position: relative;
    background-color: #b3c0d1;
    color: var(--el-text-color-primary);
  }
}
.layout-container .el-aside {
  width: 240px;
  color: var(--el-text-color-primary);
  background: #fff !important;
  border-right: solid 1px #e6e6e6;
  box-sizing: border-box;
}
.layout-container .el-menu {
  border-right: none;
}
.layout-container .el-main {
  padding: 0;
}
.layout-container .toolbar {
  position: absolute;
  display: inline-flex;
  align-items: center;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
}
</style>
