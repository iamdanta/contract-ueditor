export const tk1 = `<p>自动填充测试<br/></p><p>甲方姓名：<input type="text" class="UEditorInput" id="I387039" v-model="form.contract.jfName" bind-model="contract.jfName" read-model="contractData.jfName" style="width: 200px; height: 20px;" placeholder="" validator="" valuelength="20" capitalize="0"/></p><p>是否是证人：<input type="text" class="UEditorInput" id="I582827" v-model="form.contract.jfType" bind-model="contract.jfType" read-model="contractData.jfType" style="width: 50px;height: 20px" placeholder="" validator="" valuelength="20" capitalize="0"/></p><p>乙方姓名：<input type="text" class="UEditorInput" id="I560231" v-model="form.contract.yfName" bind-model="contract.yfName" read-model="contractData.yfName" style="width: 200px; height: 20px;" placeholder="" validator="" valuelength="20" capitalize="0"/></p><p>是否是证人：<input type="text" class="UEditorInput" id="I886346" v-model="form.contract.yfType" bind-model="contract.yfType" read-model="contractData.yfType" style="width: 50px;height: 20px" placeholder="" validator="" valuelength="20" capitalize="0"/></p>`
export const zstk1 = `<template>
<div class="contract-model-view" :style="viewStyle">
  <el-form :model="form" ref="form" class="templateForm" id="contract-model-view-form">
    <p>自动填充测试
      <br/>
  </p>
    <p>甲方姓名：
      <el-form-item style="width: 200px; height: 20px;" prop="contract.jfName" :rules="[]">                    
        <el-input class="UEditorInput" id="I387039" v-model="form.contract.jfName" bind-model="contract.jfName" read-model="contractData.jfName"  valuelength="20">
  </el-input>                 
  </el-form-item>
  </p>
    <p>是否是证人：
      <el-form-item style="width: 50px;height: 20px" prop="contract.jfType" :rules="[]">                    
        <el-input class="UEditorInput" id="I582827" v-model="form.contract.jfType" bind-model="contract.jfType" read-model="contractData.jfType"  valuelength="20">
  </el-input>                 
  </el-form-item>
  </p>
    <p>乙方姓名：
      <el-form-item style="width: 200px; height: 20px;" prop="contract.yfName" :rules="[]">                    
        <el-input class="UEditorInput" id="I560231" v-model="form.contract.yfName" bind-model="contract.yfName" read-model="contractData.yfName"  valuelength="20">
  </el-input>                 
  </el-form-item>
  </p>
    <p>是否是证人：
      <el-form-item style="width: 50px;height: 20px" prop="contract.yfType" :rules="[]">                    
        <el-input class="UEditorInput" id="I886346" v-model="form.contract.yfType" bind-model="contract.yfType" read-model="contractData.yfType"  valuelength="20">
  </el-input>                 
  </el-form-item>
  </p>
  </el-form>
  </div>
</template>
<script>
  export default {
    props: ['allBaseData'],
    data() {
      return {
        // 控件输入绑定 禁止删除
        form: {
          contract: {}
        }
        ,
        // 框内样式插入
        viewStyle: {
          fontFamily: 'none', //去掉element样式
          fontSize: '16px', //默认字体大小
          color: 'black',
          padding: '15px', //模拟页间距。非实际页间距
          lineHeight: '30px' //默认行高
        }
      }
    }
    ,
    mounted() {
      console.log(this.allBaseData);
      if (this.allBaseData) {
        if (this.allBaseData.doWhat === 'edit' && !this.allBaseData.contractTermsBo.tcnr) {
          //赋值操作
          let main = document.getElementById('contract-model-view');
          if (main) {
            let allReadModelDom = main.querySelectorAll('[read-model]');
            for (let i = 0; i < allReadModelDom.length; i++) {
              //获取的是带点的值 需要转换成数组
              let bindValueList = allReadModelDom[i]
              .getAttribute('bind-model')
              .split('.');
              let objValueList = allReadModelDom[i]
              .getAttribute('read-model')
              .split('.');
              if (bindValueList[0]) {
                console.log(this.allBaseData[objValueList[0]]);
                if (this.allBaseData[objValueList[0]]) {
                  // 仅限有值的情况才允许插入避免报错
                  if (this.allBaseData[objValueList[0]][objValueList[1]]) {
                    //如果是深层级
                    if (bindValueList.length > 1) {
                      this.$set(
                        this.form[bindValueList[0]],
                        [bindValueList[1]],
                        this.allBaseData[objValueList[0]][objValueList[1]]
                      );
                    } else {
                      //单层级（随机值）
                       this.$set(
                        this.form,
                        [bindValueList[0]],
                        this.allBaseData[objValueList[0]][objValueList[1]]
                       );
                    }
                  }
                }
              }
            }
          }
        }
        else if (this.allBaseData.doWhat === 'edit' && this.allBaseData.contractTermsBo.tcnr) {
          //不做赋值操作直接拿tcnr绑定
          this.$nextTick(() => {
            this.form = JSON.parse(this.allBaseData.contractTermsBo.tcnr);
          }
                        );
        }
      }
    }
    ,
    methods: {
      //保存方法
      saveContractData() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            //触发保存方法
            console.log(this.form);
            this.$emit('handleClick', {
              operate: 'save',
              data: this.form
            }
                      );
          }
          else {
            //验证未通过
            this.$message.warning('请完善表单！');
            return false;
          }
        }
                                );
      }
    }
  }
</script>
`;
