<template>
  <div class="full flex flex-column">
    <div class="use-step-body">
      <div class="step-body">
        <p class="step-text">步骤一：请选择一个合同模板（如果没数据请前往新增点击同步）</p>
        <el-select v-model="contractSelectData" placeholder="请选择一个合同模板" size="small">
          <el-option v-for="(item, i) in tableData" :key="i" :value="item.mbmc"
                     :label="item.mbmc + ' ' + item.createTime"></el-option>
        </el-select>
      </div>
      <div class="step-body">
        <p class="step-text">步骤二：你可以查看该模板</p>
        <el-button @click="viewContract" size="small" type="primary" :disabled="!contractSelectData">查看发布状态合同模板</el-button>
      </div>
      <div class="step-body">
        <p class="step-text">步骤三：填写以下数据作为示例会自动填充到模板</p>
        <el-form :model="form" ref="ruleForm" label-width="120px" :rules="rules" :disabled="!contractSelectData" :inline="true">
          <el-form-item label="甲方姓名" prop="jfName">
            <el-input v-model="form.jfName" size="small" style="width: 200px" placeholder="请输入甲方姓名"></el-input>
          </el-form-item>
          <el-form-item label="甲方是否是证人" prop="jfType">
            <el-select v-model="form.jfType" size="small" style="width: 200px" placeholder="请选择是否">
              <el-option label="是" :value="1"></el-option>
              <el-option label="否" :value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="已方姓名" prop="yfName">
            <el-input v-model="form.yfName" size="small" style="width: 200px" placeholder="请输入已方姓名"></el-input>
          </el-form-item>
          <el-form-item label="已方是否是证人" prop="yfType">
            <el-select v-model="form.yfType" size="small" style="width: 200px" placeholder="请选择是否">
              <el-option label="是" :value="1"></el-option>
              <el-option label="否" :value="0"></el-option>
            </el-select>
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
        <contractEditor-operation ref="contractEditorOperation" @saveEditData="saveEditData"></contractEditor-operation>
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
          jfName: [
            { required: true, trigger: 'change' }
          ],
          jfType: [
            { required: true, trigger: 'change' }
          ],
          yfName: [
            { required: true, trigger: 'change' }
          ],
          yfType: [
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
    computed: {
      currentSelectData() {
        return this.tableData.find(item => item.mbmc === this.contractSelectData) ? this.tableData.find(item => item.mbmc === this.contractSelectData) : '';
      }
    },
    methods: {
      viewContract() {
        this.$refs.contractEditorOperation.initContractDialog(true, { contractTermsBo: this.currentSelectData }, 'view');
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
        this.$refs.contractEditorOperation.initContractDialog(true, {
          contractTermsBo: this.currentSelectData,
          contractData: this.form
        }, 'edit');
      },
      saveEditData(data) {
        this.$refs.contractEditorOperation.initContractDialog(false, {}, 'close')
        this.$message.success('保存成功！')
        const params = {
          //填写的数据
          contract: data.contract,
          //模板数据
          terms: {
            tcnr: JSON.stringify(data) //条款控件填充数据JSON
          }
        };
        console.log(params);
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
