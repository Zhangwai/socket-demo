<template>
  <div>
    <el-upload v-model:file-list="myFileList"
               action=""
               list-type="picture-card"
               :before-upload="(file: any) => beforeUpload(file, size)"
               :http-request="handleUpload"
               :limit="limit"
               :disabled="disabled || limit <= myFileList.length"
               @click="handleClick"
               @remove="handleRemove"
               @preview="handlePreview">
      <template #default>
        <div>
          <el-icon>
            <Plus />
          </el-icon>
          <div class="upload-text">上传图片</div>
        </div>
      </template>
    </el-upload>

    <el-dialog v-model="previewVisible"
               centered
               title="图片预览">
      <img :src="previewImage"
           style="width: 90%;margin: 20px;"
           alt="Preview Image" />
    </el-dialog>

    <el-dialog centered
               title="裁剪图片"
               width="1000px"
               v-model="cropVisible"
               @cancel="handleCropperCancel">
      <div ref="cropWrap"
           class="crop-wrap">
        <img ref="cropImg">
      </div>
      <template v-slot:footer>
        <div class="modal-btn-box">
          <el-button @click="handleCropperCancel">
            取消
          </el-button>
          <el-button type="danger"
                     @click="handleCropperReset">
            重置
          </el-button>
          <el-button type="primary"
                     @click="handleCropperSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRefs, watch } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import useUpload from './hooks/useUpload';
import useCropper from './hooks/useCropper';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: '',

  components: {
    Plus,
  },

  props: {
    /**
     * element-plus的上传组件文件列表
     * https://element-plus.gitee.io/zh-CN/component/upload.html
     */
    fileList: {
      type: Array,
      default: () => [],
    },
    // 上传文件数量限制
    limit: {
      type: Number,
      default: 20,
    },
    // 禁用标识
    disabled: {
      type: Boolean,
      default: false,
    },
    // 是否可裁剪
    isCropped: {
      type: Boolean,
      default: false,
    },
    // 可接受的文件大小,单位为kb
    size: {
      type: Number,
      default: 1024 * 3,
    },
    // 裁剪框宽高比
    aspectRatio: {
      type: Number,
      default: 1 / 1,
    },
    // 上传前清除文件列表
    cleanBeforeUpload: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:fileList', 'change'],

  setup(props, { emit }) {
    const { beforeUpload } = useUpload();
    const { initCropper, resetCropper, destroyCropper, setCropper } =
      useCropper();
    const myFileList = ref(props.fileList);
    const previewVisible = ref(false);
    const previewImage = ref('');
    const crop = reactive({
      cropVisible: false,
      cropWrap: { style: undefined },
      cropImg: { src: '' }, // 图片节点
      cropInstance: undefined, // 实例
    });

    const handleClick = () => {
      if (props.limit <= myFileList.value.length) {
        ElMessage.error(`图片个数不可超过 ${props.limit}个`);
      }
    };

    const initCropDialog = (url: string) => {
      crop.cropVisible = true;
      const loadImage = new Promise((resolve) => {
        const image = new Image();
        image.src = url;
        image.onload = () => {
          resolve({ width: image.width, height: image.height });
        };
      });
      loadImage.then((data: any) => {
        let { width, height } = data;
        // 长边设为 600，短边按原比例缩放
        if (width > height) {
          height *= 600 / width;
          width = 600;
        } else {
          width *= 600 / height;
          height = 600;
        }
        // 限定裁剪容器大小
        Object.assign(crop.cropWrap.style as any, {
          width: `${width}px`,
          height: `${height}px`,
        });
        // 提供图片路径
        crop.cropImg.src = url;
        // 初始化裁剪图形实例
        Object.assign(crop, {
          cropInstance: initCropper(crop.cropImg, props.aspectRatio),
        });
      });
    };

    const handleUpload = (e: any) => {
      if (props.cleanBeforeUpload) {
        myFileList.value = [];
      } else {
        myFileList.value.pop();
      }
      const tmpFileList = JSON.parse(JSON.stringify(myFileList.value));
      const { file } = e;
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result;
        if (typeof url === 'string') {
          // 请求OSS
          const originImgData = { url, name: new Date().valueOf() };
          tmpFileList.push(originImgData);
          myFileList.value = tmpFileList;
          emit('change', originImgData);
          emit('update:fileList', JSON.parse(JSON.stringify(myFileList.value)));
          if (props.isCropped) {
            initCropDialog(originImgData.url);
          }
        }
      };
      reader.readAsDataURL(file);
    };

    const handlePreview = (file: any) => {
      previewImage.value = file.url;
      previewVisible.value = true;
    };

    const handleRemove = (uploadFile: any, uploadFiles: any) => {
      myFileList.value = uploadFiles;
    };

    const handleCancel = () => {
      previewVisible.value = false;
      crop.cropVisible = false;
    };

    const handleCropperCancel = () => {
      crop.cropVisible = false;
      destroyCropper(crop.cropInstance);
    };

    const handleCropperReset = () => {
      resetCropper(crop.cropInstance);
    };

    const handleCropperSubmit = () => {
      setCropper(crop.cropInstance).then((file: any) => {
        const tmpFileList = JSON.parse(JSON.stringify(myFileList.value));
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result;
          crop.cropVisible = false;
          destroyCropper(crop.cropInstance);
          if (file.name) {
            tmpFileList.pop();
            tmpFileList.push({ url, uid: new Date().valueOf() });
            myFileList.value = tmpFileList;
            emit('change', { url, uid: new Date().valueOf() });
            emit(
              'update:fileList',
              JSON.parse(JSON.stringify(myFileList.value))
            );
          }
        };
        reader.readAsDataURL(file);
      });
    };

    watch(props, () => {
      myFileList.value = props.fileList;
    });
    return {
      myFileList,
      ...toRefs(crop),
      previewVisible,
      previewImage,
      beforeUpload,
      handleUpload,
      handleClick,
      handleRemove,
      handlePreview,
      handleCancel,
      handleCropperCancel,
      handleCropperReset,
      handleCropperSubmit,
    };
  },
});
</script>
<style scoped lang="less">
.crop-wrap {
  margin: auto;
}
// /deep/.el-upload--picture-card {
//   display: none;
// }
.modal-btn-box {
  width: 100%;
  .flex-type(center);

  .ant-btn {
    border-radius: 21px;
    .set-size(110px,36px);
  }
}
</style>
