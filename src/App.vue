<template>
  <div id="app full">
    <div>
      <h2></h2>
    </div>
    <div>
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="合同id"></el-table-column>
        <el-table-column prop="name" label="合同名称"></el-table-column>
        <el-table-column prop="createTime" label="合同创建时间"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>

    export default {
        name: 'app',
        data() {
            return {
                tableData: [{
                    id: 1,
                    name: '测试合同',
                    time: '2019.11.14'
                }]
            }
        },
        components: {}
    }
</script>

<style>
</style>
