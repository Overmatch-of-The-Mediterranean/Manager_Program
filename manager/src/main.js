import { createApp } from "vue";
import App from "./App.vue";
const app = createApp(App);
import router from "./router/index.js";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import request from "./utils/request";
import storage from "./utils/storage";
import store from "./store";
import api from "./api";
import QueryForm from "../packages/QueryForm/index";

// 全局挂载
app.config.globalProperties.$request = request;
app.config.globalProperties.$storage = storage;
app.config.globalProperties.$api = api;
app.use(ElementPlus).use(QueryForm).use(store).use(router).mount("#app");

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
