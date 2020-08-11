<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :show-close="false"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :fullscreen="true"
    class="contract-operation-dialog full-height"
    append-to-body
    :destroy-on-close="true"
  >
    <div class="backBtn">
      <el-button
        class="editReBack"
        size="medium"
        @click="initContractDialog(false, {}, 'close')"
        icon="el-icon-close"
      >关 闭</el-button>
    </div>
    <contractEditor-stepOperation
      v-if="show"
      :data="allBaseData"
    >
      <slot></slot>
    </contractEditor-stepOperation>
  </el-dialog>
</template>

<script>

  /**
   *  contractEditor-operation
   *  合同模板 操作弹框
   *  by wupeng
   *
   *  initContractDialog 编辑合同方法
   *
   *  doWhat === contractView 合同模板查看
   *  doWhat === view 合同查看
   *  doWhat === print 合同查看+打印
   *  doWhat === edit 合同填写
   *  doWhat === edit + tcnr 二次编辑 合同填写
   *
   *
   */

  export default {
    name: 'contractEditor-operation',
    data() {
      return {
        dialogVisible: false,
        title: '',
        allBaseData: {},
        show: false
      };
    },
    methods: {
      //-------------------------------------基本方法
      initContractDialog(visible, allData, doWhat) {
        this.dialogVisible = visible;
        this.allBaseData = {};
        this.title = '合同模板';
        this.show = false;
        console.log('打开合同模板操作弹框：');
        console.log(allData);
        console.log(doWhat);
        if (!visible) {
          this.$emit('getList');
          return false;
        }
        if (allData && doWhat) {
          this.allBaseData = allData;
          this.allBaseData.doWhat = doWhat;
          this.show = true;
        }
      }
    }
  };
</script>

<style scoped lang="scss">
  /deep/ .el-dialog {
    .el-dialog__body {
      height: calc(100% - 54px);
      padding: 15px 20px;

      .backBtn {
        position: absolute;
        top: 18px;
        right: 10px;
      }
    }

    .el-dialog__header {
      background: none;
      padding: 20px 20px 10px;
      text-align: left;
    }

    .el-dialog__title {
      color: #303133;
    }

    .el-dialog__headerbtn {
      top: 20px;

      .el-dialog__close {
        color: #909399;
      }
    }
  }
</style>
