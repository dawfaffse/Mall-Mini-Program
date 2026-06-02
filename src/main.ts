import { createSSRApp } from 'vue'
// 主包 app.js 或 main.js
import { addressStore } from './stores/modules/address.js'
// 只需要引入并注册，不需要实际调用，就能让检测通过
import pinia from './stores'

import App from './App.vue'
export function createApp() {
  const app = createSSRApp(App)

  app.use(pinia)
  return {
    app,
  }
}
