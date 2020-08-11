<template>
  <el-dialog
    title="操作流程脑图示意"
    :visible.sync="helpStepVisible"
    width="50%"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="contract-editor-help-step">
      <img src="@/assets/images/contract-management/help-step.png" alt="脑图">
    </div>
  </el-dialog>

</template>

<script>
  export default {
    name: "contractEditor-help",
    data() {
      return {
        helpStepVisible: false,
        active: 0
      }
    },
    methods: {
      mainDialogVisible(visible) {
        this.helpStepVisible = visible;
      }
    }
  }
</script>

<style scoped lang="scss">
  .contract-editor-help-step {
    width: 100%;
    img {
      width: 100%;
    }
  }
</style>
