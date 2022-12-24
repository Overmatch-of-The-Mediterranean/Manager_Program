/**
 * Storage二次封装
 */
import config from "../config/index.js";
export default {
    setItem(key, val) {
        let Storage = this.getStorage();
        Storage[key] = val;
        window.localStorage.setItem(config.namespace, JSON.stringify(Storage));
    },
    getItem(key) {
        return this.getStorage()[key];
    },
    getStorage() {
        return JSON.parse(
            window.localStorage.getItem(config.namespace) || "{}"
        );
    },
    clearItem(key) {
        let Storage = this.getStorage();
        delete Storage[key];
        window.localStorage.setItem(config.namespace, JSON.stringify(Storage));
    },
    clearAll() {
        window.localStorage.clear();
    },
};
