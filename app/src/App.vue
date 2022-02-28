<template>
  <router-view />
</template>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  .set-size(100%);
}

/* 滚动条的宽度 */
::-webkit-scrollbar {
  .set-size(10px);
}

/* 滚动条的滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: rgba(185, 189, 203, 1);
}

@media screen and (max-width: 768px) {
  ::-webkit-scrollbar {
    .set-size(4px);
  }
}
</style>
