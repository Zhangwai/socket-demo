import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

const initCropper = (el: any, aspectRatio: number = 1 / 1) => {
  // 配置项，参考：https://github.com/fengyuanchen/cropperjs/blob/master/README.md#options
  return new Cropper(el, {
    aspectRatio: aspectRatio, // 裁剪框的 width / height
    autoCropArea: 1, // 初始是裁剪框的比例
    movable: false, // 禁止移动图片
    minCropBoxWidth: 100, // 裁剪框最短 100px
    zoomOnWheel: false, // 禁止鼠标滚轮缩放图片
  });
};

// cropper: Cropper实例
const setCropper = (cropper: any) => {
  return new Promise((resolve, reject) => {
    cropper.getCroppedCanvas().toBlob((blob: any) => {
      const file = new File([blob], `${Date.now()}.${blob.type.split('/')[1]}`, {
        type: blob.type,
      });
      resolve(file);
    });
  });
};

const resetCropper = (cropper: any) => {
  cropper.reset();
};

const destroyCropper = (cropper: any) => {
  cropper.destroy();
};

export default function useCropper() {
  return { initCropper, resetCropper, destroyCropper, setCropper };
}
