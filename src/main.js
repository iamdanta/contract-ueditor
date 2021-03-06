import Vue from 'vue';

import App from './App.vue';
import store from './store';
import router from './router';
import validate from './utils/validate';

// 插件
import './plugins/element.js';

// 样式
import './styles/index.scss';
//编辑器样式
import './styles/UEditorStyle.scss';
import './styles/UEStyle.scss';

import '@/components'

// 开发环境配置（如果需要就去掉注释）
// if (process.env.NODE_ENV === 'development') {
//   // mock 服务
//   require('./mock');
// }

//vue打印
import print from './plugins/contractPrint/main.js';
Vue.use(print);

//复制
import VueClipboard from 'vue-clipboard2';
Vue.use(VueClipboard);

Vue.config.productionTip = false;

//表单全局服务，不可修改
Vue.prototype.$validate = validate;

new Vue({
  el: '#app',
  store,
  router,
  render: (h) => h(App)
});
