<template>
  <el-cascader v-model="bindData" :options="dataList" :clearable="clearable" :show-all-levels="isShowAll"
               :filterable="filterable" :disabled="disabled" size="small" :placeholder="placeholder"
               :props="{ expandTrigger: 'hover', emitPath: false }"></el-cascader>
</template>

<script>
  /**
   * 字典级联下拉选项组件 默认只返回选中层 默认使用触摸
   *
   * config 基本配置
   * placeholder
   * clearable 是否可清除
   * filterable 是否可查询
   * isShowAll 是否显示全部路径
   * type 字典类型 传了type则不用传data
   * data 下拉数据
   * binddata 选中的值
   */
  import {Dic} from '@/utils/auth';

  export default {
    model: {
      prop: 'binddata',
      event: 'update'
    },
    props: {
      clearable: Boolean,
      filterable: Boolean,
      isShowAll: Boolean,
      disabled: Boolean,
      placeholder: String,
      type: String,
      binddata: {},

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
        if (val != oldVal) {
          this.$emit('update', this.bindData);
        }
      }
    },
    mounted() {
      // 初始化数据
      // 如果有字典类型 则获取到字典值
      if (this.type) {
        const allDic = Dic.getToken().dic;
        const dicArr = allDic.find((item) => {
          return item.label === this.type;
        });
        let convertDic = function (data) {
          if (!data) {
            return false;
          }
          for (let i = 0; i < data.length; i++) {
            data[i].children = data[i].childrens;
            convertDic(data[i].childrens);
          }
        };
        //转换字典为级联选择器识别
        convertDic(dicArr.childrens);
        if (dicArr) {
          this.dataList = dicArr.childrens;
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
