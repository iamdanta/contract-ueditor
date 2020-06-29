<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" :show-close="false"
             :close-on-press-escape="false"
             :close-on-click-modal="false" :fullscreen="true" class="contractEditDialog full-height"
             append-to-body
             :destroy-on-close="true">
    <div class="backBtn">
      <el-button class="editReBack" size="medium" @click="initContractEditDialog(false, {}, 'close')">返回<i
        class="el-icon-back el-icon--right"></i></el-button>
    </div>
    <contractEditor-stepEdit v-if="showEdit" :allPreViewData="allEditData" />
  </el-dialog>

</template>

<script>
  import {companyInfo} from '@/utils/auth';
  import validator from '@/utils/validate.js';

  /**
   *  合同模板 编辑弹框
   *  by wupeng
   *
   *  initContractEditDialog 编辑合同方法
   *  ---doWhat : close/newEdit/edit/stockCancelEdit/stockCancelView
   */

  export default {
    name: "contractEditor-edit",
    props: {
      title: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        dialogVisible: false,
        showEdit: false,
        allEditData: {}
      }
    },
    methods: {
      //-------------------------------------基本方法
      initContractEditDialog(visible, allData, doWhat) {
        this.dialogVisible = visible;
        this.showEdit = false;
        this.allEditData = {};
        if (!visible) {
          this.$emit('getList');
        }
        if (allData && doWhat) {
          this.showEdit = true;
          this.allEditData = allData;
          this.allEditData.doWhat = doWhat;
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  /deep/ .el-dialog_body {
    height: 100%;
  }
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
</style>
