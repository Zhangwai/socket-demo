import axios from "axios";
import type { AxiosInstance } from "axios";

class uuRequest {
  instance: AxiosInstance;
  constructor(config) {
    this.instance = axios.create(config);
  }

  request<T = any>(config): Promise<T> {
    return new Promise((resolve, reject) => {
      // 1.单个请求对请求config的处理
      if (config.interceptors?.requestInterceptor) {
        config = config.interceptors.requestInterceptor(config);
      }

      // 2.判断是否需要显示loading
      // if (config.showLoading === false) {
      //   this.showLoading = config.showLoading;
      // }

      //相当于 axios.request
      this.instance
        .request<any, T>(config)
        .then((res) => {
          // 1.单个请求对数据的处理
          // if (config.interceptors?.responseInterceptor) {
          //   res = config.interceptors.responseInterceptor(res);
          // }
          // console.log(res)

          // 2.将showLoading设置为true，这样不会影响下一个请求
          // this.showLoading = DEFAULT_LOADING;

          // 3.将结果resolve返回出去
          resolve(res);
        })
        .catch((err) => {
          // 将showLoading设置为true，这样不会影响下一个请求
          // this.showLoading = DEFAULT_LOADING;
          reject(err);
          // return err;
        });
    });
  }
}

export default uuRequest;
