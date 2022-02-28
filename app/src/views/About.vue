<template>
  <div class="about">
    <h1>This is an about page</h1>
    <el-input v-model="roomid" placeholder="请输入房间号" />
    <el-button type="primary" @click="clickJoin">点击加入房间</el-button>
    <a-button danger @click="clickLeave">点击离开房间</a-button>
    <el-input v-model="msg" placeholder="请输入聊天内容" />
    <el-button type="primary" @click="clickSend">发送</el-button>
    <div v-for="(item, index) in arr" :key="index">{{ item }}</div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import io from "socket.io-client";

export default defineComponent({
  name: "About",

  setup() {
    const socket = io("ws://localhost:3000", {
      timeout: 5000,
    });
    onMounted(() => {
      // 连接成功
      socket.on("connect", () => {
        console.log(socket.id, "监听客户端连接成功-connect");
      });

      // 房间好友上线通知
      socket.on("say", (message) => {
        alert(message);
      });

      // 收到的消息
      socket.on("receiveMsg", (msg, id) => {
        arr.value.push(`${id}：${msg}`);
      });
    });
    const arr = ref<any>([]);
    const roomid = ref("");
    const msg = ref("");

    // 点击加入房间
    const clickJoin = () => {
      arr.value.length = 0;
      socket.emit("join", { roomid: roomid.value });
    };

    // 点击离开房间
    const clickLeave = () => {
      socket.emit("leave", { roomid: roomid.value });
      roomid.value = "";
    };

    // 发送消息
    const clickSend = () => {
      socket.emit("sendMsgByRoom", { roomid: roomid.value, msg: msg.value });
      msg.value = "";
    };
    return { msg, roomid, arr, clickJoin, clickLeave, clickSend };
  },
});
</script>

<style lang="less" scoped>
@import "@assets/styles/abstracts/index.less";

.about {
  background: @primary-color;
}
</style>
