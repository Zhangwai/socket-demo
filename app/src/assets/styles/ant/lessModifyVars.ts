/**
 * less global variable
 */
const primaryColor = "rgba(245, 144, 255, 1)";

const modifyVars = {
  "primary-color": primaryColor, // 全局主色
  "link-color": "rgba(24, 144, 255, 1)", // 链接色
  "success-color": "rgba(82, 196, 26, 1)", // 成功色
  "warning-color": "rgba(250, 173, 20, 1)", // 警告色
  "error-color": "rgba(245, 34, 45, 1)", // 错误色
  "font-size-base": "14px", // 主字号
  "heading-color": "rgba(0, 0, 0, 0.85)", // 标题色
  "text-color": "rgba(0, 0, 0, 0.65)", // 主文本色
  "text-color-secondary": "rgba(0, 0, 0, 0.45)", // 次文本色
  "disabled-color": "rgba(0, 0, 0, 0.25)", // 失效色
  "border-radius-base": "4px", // 组件/浮层圆角
  "border-color-base": "rgba(217, 217, 217, 1)", // 边框色
  "box-shadow-base": "0 2px 8px rgba(0, 0, 0, 0.15)", // 浮层阴影
};

module.exports = { modifyVars, primaryColor };
