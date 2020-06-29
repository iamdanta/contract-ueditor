<template>
  <el-dialog
    title="预览合同"
    :visible.sync="dialogVisible"
    :show-close="false"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :fullscreen="true"
    class="contractPreviewDialog full-height"
    append-to-body
    :destroy-on-close="true"
  >
    <div class="backBtn">
      <el-button
        size="mini"
        class="backOffBtn"
        @click="initContractPreviewDialog(false)"
      >返回<i class="el-icon-refresh-left el-icon--right"></i
      ></el-button>
    </div>
    <contractEditor-stepPreview
      v-if="showPreview"
      :allPreViewData="allPreViewData"
      @editorStockCancelSave="editorStockCancelSave"
    />
  </el-dialog>
</template>

<script>
  /**
   *  合同模板 查看 打印 赋值打印
   *  by wupeng
   *
   *  initContractPreviewDialog 查看弹框显示方法
   *  ---doWhat : close/contractView/view/print
   *
   *  contractPrint 打印触发方法
   */

  export default {
    name: 'contractEditor-preview',
    data() {
      return {
        dialogVisible: false,
        showPreview: false,
        allPreViewData: {}
      };
    },
    methods: {
      //-------------------------------------基本方法
      initContractPreviewDialog(visible, allData, doWhat) {
        this.dialogVisible = visible;
        this.showPreview = false;
        this.allPreViewData = {};
        if (!visible) {
          this.$emit('getList');
        }
        if (allData && doWhat) {
          this.showPreview = true;
          this.allPreViewData = allData;
          this.allPreViewData.doWhat = doWhat;
        }
      },
      editorStockCancelSave(data) {
        this.$emit('editorStockCancelSave',data)
      }
    }
  };
</script>

<style scoped lang="scss">
  /deep/ .el-dialog__header {
    background: none;
    padding: 20px 20px 10px;
    text-align: left;
  }
  /deep/ .el-dialog__title {
    color: #303133;
  }
  /deep/ .el-dialog__headerbtn {
    top: 20px;
    .el-dialog__close {
      color: #909399;
    }
  }
  .backBtn {
    .backOffBtn {
      color: #0e90fe;
    }
  }
</style>
