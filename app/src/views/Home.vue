<template>
  <div class="home">
    <img alt="Vue logo"
         src="../assets/logo.png" />
    {{ obj }}

    <el-upload class="upload-demo"
               drag
               action="/api/single1"
               multiple>
      <el-icon class="el-icon--upload">
        <upload-filled />
      </el-icon>
      <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">formData上传</div>
      </template>
    </el-upload>

    <UploadImage v-model:fileList="fileList"
                 :aspectRatio="1 / 1"
                 :limit="3"
                 :size="500"
                 isCropped
                 class="upload"
                 @change="handleChange" />

    ----------------------------------------------------------------

    <el-upload class="upload-demo"
               drag
               action
               :auto-upload="false"
               :on-change="changeFileByBase64"
               multiple>
      <el-icon class="el-icon--upload">
        <upload-filled />
      </el-icon>
      <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">base64上传</div>
      </template>
    </el-upload>

    ----------------------------------------------------------------

    <el-upload class="upload-demo"
               drag
               action
               :auto-upload="false"
               :on-change="changeFile"
               multiple>
      <el-icon class="el-icon--upload">
        <upload-filled />
      </el-icon>
      <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">大文件切片上传</div>
      </template>
    </el-upload>
    <el-button @click="handleClick">{{ abort ? "开始" : "暂停" }}</el-button>
    {{ total }}% 结果地址：{{ fileUrl }}
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import { useData } from './hooks/index';
import { fileParse } from '../utils/index';
import UploadImage from '@/components/UploadImage/index.vue';
import SparkMd5 from 'spark-md5';
import axios from 'axios';
import qs from 'qs';

export default defineComponent({
  name: 'Home',
  components: {
    UploadFilled,
    UploadImage,
  },
  setup() {
    const { obj } = useData();
    const fileUrl = ref<string>('');

    const fileList = ref([]);
    let total = ref<number>(0);
    let abort = ref<boolean>(false);
    const requestArr: Array<any> = []; // 请求集合
    let hash: string;

    const changeFileByBase64 = async (file: any) => {
      console.log(file);
      if (!file) return;
      file = file.raw;

      const data = await fileParse(file, 'base64');

      const res = await axios.post(
        '/api/single2',
        qs.stringify({
          chunk: encodeURIComponent(data),
          filename: file.name,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      if (res.data.code === 0) {
        console.log(res.data.path);
      }
    };
    const sendRequest = () => {
      // 传递 并行 | 串行
      let i = 0;
      const complate = () => {
        return axios.get('/api/merge', {
          params: {
            hash,
          },
        });
      };
      const send = async () => {
        if (abort.value) return;
        if (i >= requestArr.length) {
          const res = await complate();
          if (res.data.code === 0) {
            fileUrl.value = res.data.path;
          }
          return;
        }
        await requestArr[i]();
        i++;
        await send();
      };
      send();
    };

    const changeFile = async (file: any) => {
      if (!file) return;
      file = file.raw;

      // 大文件处理为buffer数据
      // 我们会把文件切片处理（固定数量|固定大小）
      const buffer = await fileParse(file, 'buffer');
      const spark = new SparkMd5.ArrayBuffer();
      spark.append(buffer);
      hash = spark.end();
      let suffixArr = /\.([0-9a-zA-Z]+)$/i.exec(file.name);
      if (suffixArr) {
        const partList: Array<any> = []; // 切片集合
        const partsize = file.size / 100;
        let cur = 0;
        for (let i = 0; i < 100; i++) {
          let item = {
            chunk: file.slice(cur, cur + partsize),
            filename: `${hash}_${i}.${suffixArr[1]}`,
          };
          cur += partsize;
          partList.push(item);
        }

        partList.forEach((item: any, index: number) => {
          const fn = () => {
            let formData = new FormData();
            formData.append('chunk', item.chunk);
            formData.append('filename', item.filename);
            return axios
              .post('/api/single3', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              })
              .then((res) => {
                if (res.data.code === 0) {
                  total.value++;
                  partList.splice(index, 1);
                }
              });
          };
          requestArr.push(fn);
        });

        sendRequest();
      }
    };

    const handleClick = () => {
      if (abort.value) {
        abort.value = !abort.value;
        sendRequest();
      } else {
        abort.value = !abort.value;
      }
    };

    const handleChange = (e: any) => {
      console.log(e);
      console.log(fileList.value, 'fileList');
    };
    return {
      obj,
      fileUrl,
      total,
      abort,
      fileList,
      changeFile,
      handleClick,
      changeFileByBase64,
      handleChange,
    };
  },
});
</script>
