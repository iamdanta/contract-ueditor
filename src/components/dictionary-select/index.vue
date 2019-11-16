<template>
  <el-select
    v-model="bindData"
    :clearable="clearable"
    :filterable="filterable"
    :placeholder="placeholder"
    size="small"
    :disabled="disabled"
    :dicType="type"
  >
    <el-option
      v-for="item in dataList"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    ></el-option>
  </el-select>
</template>

<script>
  /**
   * 字典下拉选项组件
   *
   * config 基本配置
   * placeholder
   * clearable 是否可清除
   * filterable 是否可查询
   * type 字典类型 传了type则不用传data
   * data 下拉数据
   * binddata 选中的值
   */
  import {Dic} from '@/utils/auth';

  export default {
    model: {
      // 使用model， 这儿2个属性，prop属性说，我要将msg作为该组件被使用时（此处为aa组件被父组件调用）v-model能取到的值，event说，我emit ‘cc’ 的时候，参数的值就是父组件v-model收到的值。
      prop: 'binddata',
      event: 'update'
    },
    props: {
      // 接收父级参数
      placeholder: String,
      clearable: Boolean,
      filterable: Boolean,
      type: String,
      binddata: {},
      disabled: Boolean
    },
    data() {
      return {
        bindData: this.binddata,
        dataList: []
      };
    },
    watch: {
      binddata(value) {
        this.bindData = value;
      },
      bindData(val, oldVal) {
        if (val !== oldVal) {
          this.$emit('update', this.bindData);
        }
      }
    },
    mounted() {
      // 初始化数据
      // 如果有字典类型 则获取到字典值
      if (this.type) {
        console.log(Dic.getToken());
        const allDic = Dic.getToken().dic;
        const dicArr = allDic.find((item) => {
          return item.label === this.type;
        });
        if (dicArr) {
          this.dataList = dicArr.childrens;
          for (let i = 0; i < this.dataList.length; i++) {
            if (typeof this.dataList[i].value === 'string') {
              if (!Number.isNaN(parseInt(this.dataList[i].value, 10))) {
                this.dataList[i].value = parseInt(this.dataList[i].value, 10);
              }
            }
          }
        } else {
          this.$message({
            message: '没有获取到：' + this.type + ' 这个字典的值！请联系管理员添加！',
            type: 'warning'
          });
        }
      }
    }
  };
</script>

<style scoped>
  .el-select {
    width: 100%;
  }
</style>
