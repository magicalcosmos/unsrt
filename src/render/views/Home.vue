<template>
  <section class="home">
    <div class="content">
      <div class="buttons">
        <button
          class="select-file"
          @click.stop="handleSelectFile">
          <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-yasuobao"></use>
          </svg><br />
          {{$t('button.select_file')}}
        </button>
        <button
          class="select-decompress-path"
          @click.stop="handleSelectDirectory">
          <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-jieya"></use>
          </svg><br />
          <span>{{$t('button.select_decompress_path')}}</span>
        </button>
        <button
          class="select-compress-path"
          @click.stop="handleCompress">
          <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-yasuo"></use>
          </svg><br />
          <span>{{$t('button.compress')}}</span>
        </button>
        <button
          v-show="state.openedData.length > 1"
          class="back"
          @click.stop="handleBack"
        >
          <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-NMStubiao-"></use>
          </svg><br />
          <span>{{$t('button.back')}}</span>
        </button>
      </div>
      <ul class="structure-list" >
        <li
          v-for="(item, index) in state.data"
          :key="index"
          class="structure-item"
          @click="() => { handleClick(item); }"
        >
          <svg class="icon" aria-hidden="true">
              <use :xlink:href="`#icon-${item.type === TYPE.FILE ? 'wenjian' : 'a-wenjianjiawenjian'}`"></use>
          </svg>
          {{item.path}} 
        </li>
      </ul>
    </div>
  </section>
</template>
<script setup lang="ts">
 import { reactive } from 'vue';
 import { ElMessageBox } from 'element-plus';
 import { useI18n } from 'vue-i18n';

 const { t } = useI18n();
 const etron = (window as any).electron;
 const TYPE = {
  FILE: 1,
  FOLDER: 2
 }
 const state = reactive({
   root: new Array(),
   tree: new Array(),
   data: new Array(),
   openedData: new Array()
 });

 /**
  * 返回一层
  */ 
 const handleBack = () => {
   state.openedData.pop();
   if (state.openedData.length) {
     state.data = deepClone(state.openedData[state.openedData.length - 1]);
   }
 }

 /**
  * 打开下一层
  */ 
 const handleClick = (item: any) => {
   let children = deepClone(state.tree[++item.level]);
   if (item.level && item.type === TYPE.FOLDER) {
     const data = new Array();
     children.forEach((child: any) => {
       if (child.parent == item.path) {
         data.push(child);
       }
     });
     state.data = data;
     state.openedData.push(deepClone(data));
   } else {
     children = null;
   }
 }

 /**
  * 选择解压的文件
  */ 
 const handleSelectFile = () => {
   etron.selectFile();
 };


 /**
  * 选择解压的目录
  */ 
 const handleSelectDirectory = () => {
   if (state.data.length) {
    etron.selectDirectory();
   } else {
    ElMessageBox.alert(t('tips.please_select_file'), t('tips.name'), {
      confirmButtonText: t('button.confirm'),
    });
   }
 };

 /**
  * 压缩
  */ 
 const handleCompress = () => {
   etron.selectFileOrDirectory();
 }

 /**
  * 测试克隆
  */ 
 const deepClone = (data: any) => {
   return JSON.parse(JSON.stringify(data));
 }

 /**
  * 获取压缩包内容
  */ 
 etron.getData((event: any, ret: any) => {
   state.openedData = new Array();
   console.log(ret);
   state.data = deepClone(ret.root);
   state.root = deepClone(ret.root);
   state.tree = deepClone(ret.tree);
   state.openedData.push(deepClone(ret.root));
 });
</script>
<style type="text/css">
  .icon {
    width: 1em; height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
</style>
<style lang="scss" scoped>
  body{
    height: 100%;
    width: 100%;
  }
 .home {
   text-align: left;
   height: 100%;
   overflow: hidden;
   position: fixed;
   top: 0;
   width: 100%;

    .content {
     height: 100%; 
     padding-top: 70px;
     width: 100%;
    }

   .buttons {
     background: #f0f0f0;
     left: 0;
     padding: 10px;
     position: absolute;
     top: 0;
     width: 100%;
   }

   .select-file,
   .select-decompress-path,
   .select-compress-path,
   .back {
     border: none;
     cursor: pointer;
     display: inline-block;
     height: 50px;
     margin-left: 20px;
     vertical-align: top;
     width: 50px;

     &:first-child {
       margin: 0;
     }
   }

   .select-file {
     svg {
       height: 34px;
       position: relative;
       top: -2px;
       width: 34px;
     }
   }

   .select-decompress-path {
     position: relative;

     svg {
       height: 30px;
       margin-bottom: 1px;
       width: 30px;
     }

     span {
       top: 3px;
       position: relative;
     }
   }

   .select-compress-path {
     position: relative;

     svg {
       height: 34px;
       margin-bottom: 1px;
       width: 35px;
     }

     span {
       left: -2px;
       top: -2px;
       position: relative;
     }
   }

   .back {
     svg {
       height: 32px;
       position: relative;
       top: -2px;
       width: 34px;
     }
   }

   .structure-list {
     height: 100%;
     margin-top: 10px;
     overflow: auto;
     padding-bottom: 15px;
     width: 100%;
   }

   .structure-item {
     cursor: pointer;
     height: 25px;
     line-height: 25px;
     padding-left: 10px;

     .icon-fold {
       color: green;
     }

     &:hover,
     &.selected {
       background: #60a7eb;
       color: #fff;
     }
   }

   label {
     display: inline-block;
     width: 80px;
   }

   input {
     border: 1px solid #999;
     border-radius: 5px;
     height: 28px;
     width: 300px;
   }
 }
</style>
