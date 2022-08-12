// import ossClient from '/@/libs/oss';
import { ElMessage } from "element-plus";

const beforeUpload = (
  file: File,
  size: number,
) => {
  return new Promise((resolve, reject) => {
    const format = ["image/jpeg", "image/png"];
    if (!format.includes(file.type)) {
      ElMessage.error("图片上传失败，请上传”JPG、JPEG或PNG格式");
      reject(file);
    }
    if (size && file.size / 1024 > size) {
      ElMessage.error(`图片内存大小不可超过 ${size} kb`);
      reject(file);
    }
    resolve(file);
  });
};

// const uploadToOSS = (file: File, filePath: string) => {
//   let uploadPath = '';
//   return new Promise((resolve) => {
//     ossClient
//       .ossPut(filePath, file)
//       .then((url: any) => {
//         uploadPath = url;
//       })
//       .catch(() => {
//         ElMessage.error('上传失败');
//       })
//       .finally(() => {
//         resolve(uploadPath);
//       });
//   });
// };

export default function useUpload() {
  return {
    beforeUpload,
    //  uploadToOSS
  };
}
