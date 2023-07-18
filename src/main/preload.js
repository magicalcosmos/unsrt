// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
});

contextBridge.exposeInMainWorld(
  'electron',
  {
    // 选择文件
    selectFile: () => {
      return ipcRenderer.send('select-file');
    },
    // 选择目录
    selectDirectory: () => {
      return ipcRenderer.send('select-directory');
    },
    // 选择压缩的文件或目录
    selectFileOrDirectory: () => {
      return ipcRenderer.send('select-file-or-directory');
    },
    // 获取文件包内容返回给前端
    getData: (callback) => {
      ipcRenderer.on('select-file', (event, arg) => {
        callback(event, arg);
      });
    }
  }
)
