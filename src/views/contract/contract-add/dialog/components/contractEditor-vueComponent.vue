<template>
  <component :is="currentComponent" v-if="currentComponent" id="contract-model-view" class="scrollbar-default"></component>
</template>

<script>
  import Vue from 'vue';

  export default {
    name: "contractEditor-vueComponent",
    props: ['code'],
    data() {
      return {
        codeData: this.code
      }
    },
    watch: {
      code(val) {
        this.codeData = val;
      }
    },
    computed: {
      // 计算属性，动态注册组件
      currentComponent() {
        try {
          if (this.result) {
            return Vue.extend(this.result);
          } else {
            return {
              template: '<p>渲染</p>'
            };
          }
        } catch (e) {
          console.log(e);
          return e;
        }
      },
      result() {
        if (this.codeData.includes('template')) {
          const template = this.getTagContent(this.codeData, 'template') || '<div></div>';
          const js = this.getTagContent(this.codeData, 'script').replace(/[^{]*/, '') || '{}';
          // console.log('页面代码.........');
          // console.log(template);
          let options = {};
          try {
            options = new Function(`return ${js}`)();
          } catch (e) {
            console.log('error-------------------');
          }
          // console.log('方法代码.........');
          // console.log(options);
          return {
            ...options,
            template
          };
        } else {
          return '';
        }
      }
    },
    methods: {
      //获取相应标签内容
      getTagContent(code, tag) {
        const startTag = `<${tag}>`;
        const endTag = `</${tag}>`;
        const startIndex = code.indexOf(startTag) + startTag.length;
        const endIndex = code.lastIndexOf(endTag);
        if (startIndex !== -1 && endIndex !== -1) {
          return code.slice(startIndex, endIndex);
        } else {
          return '';
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .contract-model-view {
    height: 100%;
    overflow: auto;
  }
</style>
