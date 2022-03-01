<template>
  <div class="about">
    <h1>欢迎{{ socket.id }}(自己)！！</h1>
    <el-input v-model="roomid" placeholder="请输入房间号" />
    <el-button type="primary" @click="clickJoin">点击加入房间</el-button>
    <a-button danger @click="clickLeave">点击离开房间</a-button>
    <el-input v-model="msg" placeholder="请输入聊天内容" />
    <el-button type="primary" @click="clickSend">发送</el-button>
    <el-button type="primary" @click="clickVedio">视频通话</el-button>
    <div v-for="(item, index) in arr" :key="index">{{ item }}</div>

    <div class="video">
      <div>{{ socket.id }}(自己)</div>
      <video ref="rtcA" src id="rtcA" controls autoplay></video>
    </div>
    <el-button type="danger" @click="hangup">hangup</el-button>
    <div class="video">
      <div>{{ otherId }}(对方)</div>
      <video ref="rtcB" src id="rtcB" controls autoplay></video>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import useCurrentInstance from "@/hooks/useCurrentInstance";
declare global {
  interface Window {
    mozRTCPeerConnection: any;
    webkitRTCPeerConnection: any;
  }
}

export default defineComponent({
  name: "About",

  setup() {
    const { globalProperties } = useCurrentInstance();
    const socket = globalProperties.$socket;
    const arr = ref<any>([]);
    const roomid = ref("");
    const msg = ref("");
    const localstream = ref<MediaStream>();
    const peer = ref<RTCPeerConnection>();
    const rtcA = ref();
    const rtcB = ref();
    const otherId = ref("");

    const hangup = () => {
      clearStreamAndPeer();
      socket.emit("1v1hangup", { roomid: roomid.value });
    };
    // 挂断通话
    const clearStreamAndPeer = () => {
      // 关闭摄像头
      localstream.value?.getTracks().forEach((track) => {
        track.stop();
      });
      ElMessage({
        type: "warning",
        message: "聊天结束~",
      });
      peer.value?.close();
      peer.value = undefined;
    };
    const createP2P = async (data: any) => {
      // this.loading = true;
      // this.loadingText = "正在建立通话连接";
      await createMedia(data);
    };

    // 发起方发起offer
    const createOffer = async (data: any) => {
      // 创建并发送offer
      try {
        // 创建offer
        let offer = await peer.value?.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        console.log(offer, data, "offer");

        // 呼叫端设置本地 offer 描述
        // 调用setLocalDescription时，您发布的代码实际上已经执行了ICE候选人收集。
        offer && (await peer.value?.setLocalDescription(offer));
        // 给对方发offer
        socket.emit("1v1offer", {
          ...data,
          sdp: offer,
        });
      } catch (error) {
        ElMessage({
          type: "error",
          message: error,
        });
      }
    };

    const createMedia = async (data: any) => {
      const constraints = {
        audio: true,
        video: true,
      };
      // 保存本地流到全局
      try {
        localstream.value = await navigator.mediaDevices.getUserMedia(
          constraints
        );
        console.log("本地流", localstream.value);

        rtcA.value.srcObject = localstream.value;
      } catch (error) {
        ElMessage({
          type: "error",
          message: error,
        });
      }
      // 获取到媒体流后，调用函数初始化 RTCPeerConnection
      initPeer(data);
    };

    const initPeer = async (data: any) => {
      let PeerConnection =
        window.RTCPeerConnection ||
        window.mozRTCPeerConnection ||
        window.webkitRTCPeerConnection;
      peer.value = new PeerConnection();
      console.log("创建输出端 PeerConnection", peer.value);

      // peer.value.addStream(localstream.value);
      // 添加本地流
      localstream.value?.getTracks().forEach((track) => {
        localstream.value && peer.value?.addTrack(track, localstream.value);
      });

      peer.value.onicecandidate = (e) => {
        // 监听打洞后返回的自己的信息
        if (e.candidate) {
          console.log(e.candidate, "ICE候选信息");
          // 收集到自己的ICE候选信息，并发送给对方
          socket.emit("1v1ICE", {
            ...data,
            sdp: e.candidate,
          });
        }
      };

      peer.value.ontrack = (e) => {
        console.log(e, rtcB.value, "ontrack");
        if ((rtcB.value.srcObject! = e.streams[0])) {
          rtcB.value.srcObject = e.streams[0];
        }
      };
    };
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

    // 发起视频聊天
    const clickVedio = () => {
      // loading
      // 发起方
      socket.emit("apply", { roomid: roomid.value, id: socket.id });
    };

    onMounted(() => {
      // 连接成功
      socket.on("connect", () => {
        console.log(socket.id, "监听客户端连接成功-connect");
      });

      // 挂点电话
      socket.on("1v1hangup", (data: any) => {
        clearStreamAndPeer();
      });

      // 房间好友上线通知
      socket.on("say", (message: string) => {
        ElMessage({
          type: "success",
          message,
        });
      });

      // 收到的消息
      socket.on("receiveMsg", (msg: string, id: string) => {
        arr.value.push(`${id}：${msg}`);
      });

      // 接收方收到发起方的视频请求
      socket.on("apply", (data: any) => {
        const { id } = data;
        console.log("收到协作请求", id);
        ElMessageBox.confirm(`你的好友${id}邀请您语音通话，是否接听?`, {
          confirmButtonText: "接受",
          cancelButtonText: "拒接",
          type: "warning",
          draggable: true,
        })
          .then(() => {
            // 创建p2p 等待offer
            createP2P({ roomid: roomid.value });
            otherId.value = id;
            socket.emit("reply", {
              roomid: roomid.value,
              id: socket.id,
              type: "accept",
            });

            ElMessage({
              type: "success",
              message: "已接听",
            });
          })
          .catch(() => {
            socket.emit("reply", {
              roomid: roomid.value,
              id: socket.id,
              type: "refuse",
            });
            ElMessage({
              type: "error",
              message: "已拒绝",
            });
          });
      });

      // 发起方收到接收方的视频同意与否回复
      socket.on("reply", async (data: any) => {
        const { roomid, id, type } = data;
        console.log(roomid, id, type);
        switch (type) {
          case "accept":
            // 创建p2p
            await createP2P({ roomid });
            // 发送offer
            await createOffer({ roomid });
            otherId.value = id;

            ElMessage({
              type: "success",
              message: "对方接受了您的视频请求",
            });
            break;
          case "refuse":
            ElMessage({
              type: "error",
              message: "对方拒接了您的视频请求",
            });
            break;
          default:
            break;
        }
      });

      // 接收方收到的offer
      socket.on("1v1offer", async (data: any) => {
        console.log(data, "1v1offer");
        // 接收offer并发送 answer
        try {
          // 接收端设置远程 offer 描述
          await peer.value?.setRemoteDescription(data.sdp);
          // 接收端创建 answer
          let answer = await peer.value?.createAnswer();
          // 接收端设置本地 answer 描述
          answer && (await peer.value?.setLocalDescription(answer));
          // 给对方发送 answer
          socket.emit("1v1answer", {
            ...data,
            sdp: answer,
          });
        } catch (error) {
          ElMessage({
            type: "error",
            message: error,
          });
        }
      });

      // 收到的消息
      socket.on("1v1ICE", async (data: any) => {
        console.log(data, "1v1ICE");
        // 接收 ICE 候选
        try {
          await peer.value?.addIceCandidate(data.sdp); // 设置远程 ICE
        } catch (error) {
          ElMessage({
            type: "error",
            message: error,
          });
        }
      });

      // 收到的消息
      socket.on("1v1answer", async (data: any) => {
        console.log(data, "1v1answer");
        // 接收 ICE 候选
        try {
          await peer.value?.setRemoteDescription(data.sdp); // 呼叫端设置远程 answer 描述
        } catch (error) {
          ElMessage({
            type: "error",
            message: error,
          });
        }
      });
    });
    return {
      socket,
      otherId,
      rtcA,
      rtcB,
      msg,
      roomid,
      arr,
      clickJoin,
      clickLeave,
      clickSend,
      clickVedio,
      hangup,
    };
  },
});
</script>

<style lang="less" scoped>
@import "@assets/styles/abstracts/index.less";

.about {
  background: @primary-color;
}
.video {
  padding-top: 100px;

  .set-size(100%);
}
</style>
