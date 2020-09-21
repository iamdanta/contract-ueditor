<template>
  <div class="full flex flex-column">
    <div class="search">
      <el-button @click="openAddContract" type="primary" size="small">新增合同模板</el-button>
      <el-button @click="reUseData" type="primary" size="small">共享数据给使用</el-button>
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
        <el-table-column prop="zt" label="状态">
          <template slot-scope="scope">
            <p v-if="scope.row.zt === 'kf'" style="color: red">开发</p>
            <p v-if="scope.row.zt === 'fb'" style="color: red">发布</p>
          </template>
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
              <el-button type="text" size="small" slot="reference"> 删除</el-button>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
      <contract-editor-main ref="contractEditorMain" @addContract="addContract"
                            @updateContract="updateContract"></contract-editor-main>
      <!--查看-->
      <contractEditor-operation ref="contractEditorOperation"></contractEditor-operation>
      <contract-editor-last-rebuild ref="contractEditorLastRebuild" @updateContract="updateContract"/>
    </div>
  </div>
</template>

<script>
  import ContractEditorLastRebuild from './dialog/components/contractEditor-lastRebuild';
  import ContractEditorMain from './dialog/contractEditor-main';
  import {tk, zstk} from './model/model';

  export default {
    components: { ContractEditorMain, ContractEditorLastRebuild },
    data() {
      return {
        popoverVisible: false,
        txt: zstk,
        tableData: [
          {
            id: 1,
            mbmc: '演示模板',
            mblx: '演示模板类型',
            createTime: '2020/09/16',
            createPeople: 'wupeng',
            tk: JSON.parse(JSON.stringify(tk)),
            zstk: JSON.parse(JSON.stringify(zstk)),
            zt: 'fb'
          }
        ]
      };
    },
    methods: {
      openAddContract() {
        this.$refs.contractEditorMain.mainDialogVisible(true);
      },
      viewContract(row) {
        this.$refs.contractEditorOperation.initContractDialog(true, { contractTermsBo: row }, 'contractView');
      },
      editContract(row) {
        switch (row.zt) {
          case 'kf':
            this.$refs.contractEditorMain.mainDialogVisible(true, row);
            break;
          case 'fb':
            this.$refs.contractEditorLastRebuild.mainDialogVisible(true, row);
            break;
        }
      },
      deleteContract(index, row) {
        if (index === 0) {
          this.$message.warning('您不能删除第一条数据！');
        } else {
          this.tableData.splice(index, 1);
          this.$message.warning(`删除合同模板 ${row.mbmc} 成功`);
        }
      },
      //新增合同
      addContract(data) {
        if (data) {
          this.tableData.push(data);
        }
      },
      //保存更新合同
      updateContract(data) {
        console.log('保存更新合同');
        console.log(data);
        if (data) {
          this.tableData.forEach((item, index) => {
            if (item.id === data.id) {
              this.tableData.splice(index, 1);
              this.tableData.splice(index, 0, data);
            }
          });
        }
      },
      //共享数据
      reUseData() {
        this.$store.dispatch('contract/setContractData', this.tableData);
        this.$message.success('同步到vuex数据成功！');
      }
    }
  };
</script>

<style scoped lang="scss">
  .search {
    height: 60px;
    line-height: 60px;
    border-bottom: 1px solid #ccc;

    .el-button {
      margin-left: 30px;
    }
  }

  .table {
    /deep/ td {
      .el-popover__reference {
        margin-left: 10px;
      }
    }
  }
</style>
