<template>
  <el-tooltip class="item" effect="dark" :content="content" placement="top-start">
    <p v-clipboard:copy="text" v-clipboard:success="copy">{{text}}</p>
  </el-tooltip>
</template>

<script>
  export default {
    name: "clipboard-text",
    props: ['text'],
    data() {
      return {
        content: '单击复制'
      }
    },
    methods: {
      copy(e) {
        this.content = '复制成功！'
        console.log(e.text)
        setTimeout(() => {
          this.content = '单击复制'
        }, 500);
      }
    }
  }
</script>

<style scoped lang="scss">
  p {
    cursor: pointer;
  }
</style>
