<template>
  <div class="full flex flex-column">
    <div class="search">
      <el-button @click="addContract" type="primary" size="small">新增合同模板</el-button>
    </div>
    <div class="table flex-1">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="合同id"></el-table-column>
        <el-table-column prop="mbmc" label="合同名称"></el-table-column>
        <el-table-column prop="mblx" label="合同类型"></el-table-column>
        <el-table-column prop="createTime" label="合同创建时间">
        </el-table-column>
        <el-table-column prop="createPeople" label="合同创建者">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{ row }">
            <el-button
              @click.native.prevent="viewContract(row)"
              type="text"
              size="small"
            >
              查看
            </el-button>
            <el-button
              @click.native.prevent="editContract(row)"
              type="text"
              size="small"
            >
              编辑
            </el-button>
            <el-popover
              placement="top"
              width="200"
              v-model="popoverVisible">
              <p>是否确认删除此合同？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="popoverVisible = false">不删除</el-button>
                <el-button type="primary" size="mini" @click="deleteContract(row.id - 1, row)">删除</el-button>
              </div>
              <el-button type="text" size="small" slot="reference">删除</el-button>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
      <contractEditor-preview ref="contractEditorPreview"></contractEditor-preview>
      <contract-editor-main ref="contractEditorMain" @saveContract="saveContract"></contract-editor-main>
    </div>
  </div>
</template>

<script>
  import ContractEditorMain from './model/contractEditor-main';

  export default {
    components: { ContractEditorMain },
    data() {
      return {
        popoverVisible: false,
        tableData: [
          {
            id: 1,
            mbmc: '测试模板1',
            mblx: '测试模板类型',
            createTime: '2019.11.15',
            createPeople: 'wupeng',
            tk: `<h2>123</h2>`,
            zstk: `<h2>123</h2>`
          }
        ]
      };
    },
    methods: {
      addContract() {
        this.$refs.contractEditorMain.mainDialogVisible(true);
      },
      viewContract(row) {
        this.$refs.contractEditorPreview.initContractPreviewDialog(true, {tk: row.tk}, 'contractView');
      },
      editContract(row) {
        this.$refs.contractEditorMain.mainDialogVisible(true, row);
      },
      deleteContract(index, row) {
        if (index === 0) {
          this.$message.warning('您不能删除第一条数据！');
        } else {
          this.tableData.splice(index, 1);
          this.$message.warning(`删除合同模板 ${row.mbmc} 成功`);
        }
      },
      //保存编辑器给的数据
      saveContract(data) {
        if (data) {
          data.id = this.tableData.length + 1;
          this.tableData.push(data);
        }
      }
    }
  };
</script>

<style scoped lang="scss">
  .search {
    height: 60px;
    line-height: 60px;
    border-bottom: 1px solid #ccc;
  }
</style>
