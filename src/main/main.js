const { ipcMain, dialog, shell } = require('electron')
const fs = require('fs');
const AdmZip = require("adm-zip");
//const unzipper = require('unzipper');
//const unzipper = require('decompress-zip');
let filePath = '';
let decompressPath = '';
// 选择文件
ipcMain.on('select-file', function (event, arg) {
  dialog.showOpenDialog({
    properties: ['openFile'],
    message: '请选择要解压的文件',
    filters: [
      {
        name: 'All Files',
        extensions: ['srt', 'SRT']
      }
    ]
  }).then(function (result) {
    if (!result.canceled) {
      filePath = result.filePaths[0];
      // TODO: replace jszip with this reading archives
      //const zip = new AdmZip(filePath);
      //const zipEntries = zip.getEntries(); // an array of ZipEntry records

      //zipEntries.forEach(function (zipEntry) {
      //    console.log(zipEntry.toString()); // outputs zip entries information
      //    if (zipEntry.entryName == "my_file.txt") {
      //        console.log(zipEntry.getData().toString("utf8"));
      //    }
      //});
      // read a srt file
      fs.readFile(result.filePaths[0], (err, data) => {
        if (err) {
          throw err;
        }
        const JSZip = require('jszip');
        JSZip.loadAsync(data).then(function (zip) {
          files = Object.keys(zip.files);
          event.reply('select-file', getZipFileTree(files))
        });
      });
    }
  });
});

// 选择解压目录
ipcMain.on('select-directory', (event, arg) => {
  dialog.showOpenDialog({
    properties: ['openDirectory'],
    defaultPath: filePath,
    message: '请选择要解压到的目录'
  }).then((result) => {
    if (!result.canceled) {
      decompressPath = result.filePaths[0];
      const zip = new AdmZip(filePath);
      zip.extractAllTo(/*target path*/ decompressPath, /*overwrite*/ true);
      // 打开解压后的路径
      shell.openPath(decompressPath);
    }
  });
});

// 压缩的目录或文件
ipcMain.on('select-file-or-directory', (event, arg) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory', 'multiSelections'],
    defaultPath: filePath,
    message: '请选择要压缩的文件或目录'
  }).then((result) => {
    let seperator = '/';
    if (process.platform === 'win32') {
      seperator = '\\';
    }
    if (!result.canceled) {
      console.log(result);
      let folderName = 'Archive';
      const suffix = 'srt';
      const zip = new AdmZip();
      const filePaths = result.filePaths;
      const DECOMPRESS_PATH = filePaths[0];
      const newCompressPath = DECOMPRESS_PATH.slice(0, DECOMPRESS_PATH.lastIndexOf(seperator));
      switch (filePaths.length) {
        case 1:
          // 选择单个文件或文件夹
          const fileType = fs.statSync(DECOMPRESS_PATH);
          folderName = DECOMPRESS_PATH.slice(DECOMPRESS_PATH.lastIndexOf(seperator) + 1);
          if (fileType.isFile()) {
            zip.addLocalFile(DECOMPRESS_PATH);
          } else {
            zip.addLocalFolder(DECOMPRESS_PATH, folderName);
          }
          break; 
        default:
          // 选择多个文件或者文件夹
          filePaths.forEach((filePath) => {
            const fileName = filePath.slice(filePath.lastIndexOf(seperator) + 1);
            const fileType = fs.statSync(fileName);
            if (fileType.isFile()) {
              zip.addLocalFile(filePath);
            } else {
              zip.addLocalFolder(DECOMPRESS_PATH, fileName);
            }
          });
      }

      // 压缩文件
      zip.writeZip(`${newCompressPath}${seperator}${folderName}.${suffix}`);
      // 打开解压后的路径
      shell.openPath(newCompressPath);
    }
  });
});

const TYPE = {
  FILE: 1,
  FOLDER: 2
};

/**
 * 将压缩包的内容组装成树 
 */
function getZipFileTree(data) {
  const root = [];
  const tree = [];
  const obj = {};
  data.forEach((item) => {
    const itemArr = item.replace(/\\/g, '/').split('/');
    for (let i = 0; i < itemArr.length; ++i) {

      if (!tree[i]) {
        tree[i] = [];
      }

      const tempObj = {
        level: i,
        path: itemArr[i],
        type: itemArr[i].indexOf('.') !== -1 ? TYPE.FILE : TYPE.FOLDER,
      };

      if(i === 0 && !isObjectRepeat(tempObj, root)) {
        root.push(tempObj);
        continue;
      }

      if (!tree[i].includes(itemArr[i]) && itemArr[i]) {
        if (itemArr[i-1]) {
          tempObj.parent = itemArr[i-1];
        }
        if (!isObjectRepeat(tempObj, tree[i])) {
          tree[i].push(tempObj);
        }
      }
    }
  });
  return { root, tree };
}

/**
 * 数组里对象是否重复
 */
function isObjectRepeat(obj, arr) {
  for (let i = 0; i < arr.length; ++i) {
    if (JSON.stringify(arr[i]) === JSON.stringify(obj)) {
      return true;
    }
  }
  return false;
}
