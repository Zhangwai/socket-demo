import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { setupAntd } from "@/plugins/antd";
import "element-plus/dist/index.css";
import { ElLoading } from "element-plus";
import io from "socket.io-client";

const app = createApp(App);

// // 挂载loading
// app.config.globalProperties.$loading = ElLoading.service({
//   lock: true,
//   text: "等待接听",
// });

// 挂载socket连接
app.config.globalProperties.$socket = io("ws://localhost:3000", {
  timeout: 5000,
});

// 注册全局常用的ant-design-vue组件
setupAntd(app);
app.use(store).use(router).mount("#app");
