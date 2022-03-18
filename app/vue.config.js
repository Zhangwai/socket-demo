const path = require("path");
const { modifyVars } = require("./src/assets/styles/ant/lessModifyVars.ts");
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");
const resolve = (dir) => path.join(__dirname, dir);
module.exports = {
  publicPath: "/",
  devServer: {
    open: true,
    hot: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          "^/api": "", // rewrite path
        },
      },
    },
  },
  chainWebpack: (config) => {
    // 添加别名
    config.resolve.alias
      .set("@", resolve("src"))
      .set("@hooks", resolve("src/hooks"))
      .set("@assets", resolve("src/assets"))
      .set("@style", resolve("src/assets/style"))
      .set("@components", resolve("src/components"))
      .set("@views", resolve("src/views"))
      .set("@router", resolve("src/router"))
      .set("@store", resolve("src/store"))
      .set("@api", resolve("src/serve/api"))
      .set("@types", resolve("src/types"));
  },
  configureWebpack: {
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars,
          javascriptEnabled: true,
        },
        // 只在app.vue里面生效
        prependData: '@import "./src/assets/styles/abstracts/index.less";',
      },
    },
  },
};
