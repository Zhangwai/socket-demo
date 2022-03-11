import { onMounted, ref } from "vue";
export const useData = () => {
  const obj = ref();
  onMounted(() => {
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({ a: 10, b: 0 });
      }, 1000);
    }).then((res) => {
      obj.value = res;
    });
  });
  return { obj };
};
