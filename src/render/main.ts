import { createApp } from 'vue';

import router from '@/router';
import i18n from '@/i18n';
import App from './App.vue';
import '@/static/iconfont.css';
//import '@/theme/index.scss';
import '@/static/iconfont.js';
import 'element-plus/dist/index.css';
import styleImport from '@/utils/style-import';

const app = createApp(App);
styleImport(app);
app.use(i18n);
app.use(router);
app.mount('#app');

