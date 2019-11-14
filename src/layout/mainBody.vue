<template>
  <div class="full-height">
    <div class="query">
      <h2>123213</h2>
    </div>
    <div class="table">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="合同id"></el-table-column>
        <el-table-column prop="name" label="合同名称"></el-table-column>
        <el-table-column prop="createTime" label="合同创建时间"></el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="100">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
            <el-button type="text" size="small">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
    export default {
        data() {
            return {
                tableData: [{
                    id: 1,
                    name: '测试合同',
                    createTime: '2019.11.14'
                }]
            }
        }
    }
</script>

<style scoped>

</style>
