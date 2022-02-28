import type { App } from "vue";

import {
  ConfigProvider,
  Layout,
  Breadcrumb,
  Avatar,
  Dropdown,
  Menu,
  Form,
  Modal,
  Table,
  Input,
  Button,
} from "ant-design-vue";

export function setupAntd(app: App<Element>) {
  app
    .use(ConfigProvider)
    .use(Layout)
    .use(Breadcrumb)
    .use(Avatar)
    .use(Dropdown)
    .use(Menu)
    .use(Form)
    .use(Modal)
    .use(Table)
    .use(Input)
    .use(Button);
}
