<template>
  <div class="full flex flex-column">
    <div class="search">
      <el-button @click="addContract" type="primary" size="small">新增合同模板</el-button>
    </div>
    <div class="table flex-1">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="合同id"></el-table-column>
        <el-table-column prop="name" label="合同名称"></el-table-column>
        <el-table-column prop="createTime" label="合同创建时间">
        </el-table-column>
        <el-table-column prop="createPeople" label="合同创建者">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="viewContract(tableData)"
              type="text"
              size="small"
            >
              查看
            </el-button>
            <el-button
              @click.native.prevent="editContract(tableData)"
              type="text"
              size="small"
            >
              编辑
            </el-button>
            <el-button
              @click.native.prevent="deleteContract(scope.$index, tableData)"
              type="text"
              size="small"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <contract-editor-main ref="contractEditorMain"></contract-editor-main>
    </div>
  </div>
</template>

<script>
  import ContractEditorMain from './model/contractEditor-main';

  export default {
    components: { ContractEditorMain },
    data() {
      return {
        tableData: [
          {
            id: 1,
            name: '测试模板1',
            createTime: '2019.11.15',
            createPeople: 'wupeng'
          },
          {
            id: 2,
            name: '测试模板2',
            createTime: '2019.11.15',
            createPeople: 'wupeng'
          }
        ]
      };
    },
    methods: {
      addContract() {
        this.$refs.contractEditorMain.mainDialogVisible(true);
      },
      viewContract() {

      },
      editContract() {

      },
      deleteContract() {

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
