import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import importElementPlus from 'vite-plugin-element-plus';

// 如果编辑器提示 path 模块找不到，则可以安装一下 @types/node -> npm i @types/node -D
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, node}) => {
  const commonConfig = {
      plugins: [vue(), importElementPlus({})],
      resolve: {
        alias: {
          '@': resolve(__dirname, '.') // 设置 `@` 指向 `src` 目录
        }
      }
  };
  if (command === 'serve') {
    return Object.assign({
      server: {
        port: 4500
      } 
    }, commonConfig);
  } else {
    return Object.assign({
      base: '',
      build: {
        //outDir: resolve(__dirname,'../../dist')
      }
    }, commonConfig);
  }
});
