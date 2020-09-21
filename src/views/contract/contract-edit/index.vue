<template>
  <div class="full flex flex-column">
    <div class="use-step-body">
      <div class="step-body">
        <p class="step-text">步骤一：请选择一个合同模板（如果没数据请前往新增点击同步）</p>
        <el-select v-model="contractSelectData" placeholder="请选择一个合同模板" size="small">
          <el-option v-for="(item, i) in tableData" :key="i" :value="item"
                     :label="item.mbmc + ' ' + item.createTime"></el-option>
        </el-select>
      </div>
      <div class="step-body">
        <p class="step-text">步骤二：你可以查看该模板</p>
        <el-button @click="viewContract" size="small" type="primary" :disabled="!contractSelectData">查看发布状态合同模板</el-button>
        <!--查看-->
        <contractEditor-operation ref="contractEditorOperation"></contractEditor-operation>
      </div>
      <div class="step-body">
        <p class="step-text">步骤三：填写以下数据作为示例会自动填充到模板</p>
        <el-form :model="form" ref="ruleForm" label-width="100px" :rules="rules" :disabled="!contractSelectData">
          <el-form-item label="甲方姓名" prop="name">
            <el-input v-model="form.name" :disabled="!contractSelectData" size="small" style="width: 200px" placeholder="请输入甲方姓名"></el-input>
          </el-form-item>
          <el-form-item label="甲方姓名" prop="zjlx">
            <el-input v-model="form.zjlx" size="small" style="width: 200px" placeholder="请输入证件类型"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveData" size="small">保存数据</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="step-body">
        <p class="step-text">步骤五：带着上面数据进入填写合同</p>
        <el-button @click="goEdit" size="small" type="primary" :disabled="!showEdit">
          使用该模板和数据进行填写合同
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        contractSelectData: '',
        showEdit: false,
        form: {},
        tableData: this.$store.state['contract'].contractData,
        rules: {
          name: [
            { required: true, trigger: 'change' }
          ],
          zjlx: [
            { required: true, trigger: 'change' }
          ]
        }
      };
    },
    mounted() {
      this.contractSelectData = '';
      this.form = {};
      this.showEdit = false;
    },
    methods: {
      viewContract(row) {
        this.$refs.contractEditorOperation.initContractDialog(true, { contractTermsBo: row }, 'view');
      },
      saveData() {
        this.$refs.ruleForm.validate((valid) => {
          if (valid) {
            this.showEdit = true;
            this.$message.success('保存成功！');
          }
        });
      },
      goEdit() {

      }
    }
  };
</script>

<style scoped lang="scss">
  .use-step-body {
    padding: 20px;

    .step-text {
      margin: 20px 0;
      font-weight: bold;
    }

    .input-text {
      line-height: 50px;
    }
  }
</style>
