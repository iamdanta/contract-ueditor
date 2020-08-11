<template>
  <el-form :model="drawerFormData" ref="drawerFormData" size="small" :label-width="drawerFormLabelWidth">
    <transition name="spread-in" mode="out-in">
      <!--input控件-->
      <div key="inputDrawer" v-if="updateDrawerType === 'inputDrawer'">
        <h2>当前Input控件参数修改</h2>
        <el-form-item label="类别" prop="type" :rules="[validator.required]">
          <el-select v-model="drawerFormData.type" clearable placeholder="请选择input类别">
            <el-option label="TEXT-文本（默认）" value="text"></el-option>
            <el-option label="DATE-时间选择" value="date"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类名" prop="className" :rules="[validator.english]">
          <el-input v-model="drawerFormData.className"
                    placeholder="不填默认为：UEditorInput"></el-input>
        </el-form-item>
        <el-form-item label="宽度(px)">
          <el-input-number v-model="drawerFormData.width" placeholder="不填默认为：50px" :step="10" :min="10"
                           :max="500"></el-input-number>
        </el-form-item>
        <el-form-item label="高度(px)">
          <el-input-number v-model="drawerFormData.height" placeholder="不填默认为：20px" :step="10" :min="20"
                           :max="500"></el-input-number>
        </el-form-item>
        <el-form-item label="占位提示符">
          <el-input v-model="drawerFormData.placeholder" placeholder="不填默认为：空"></el-input>
        </el-form-item>
        <p style="text-align: center;margin: 10px 0">---- 以下涉及数据保存问题，请认真操作 ----</p>
        <el-form-item class="randomValueInput" label="字段存值绑定">
          <dictionary-cascader type="合同模板存值" v-model="drawerFormData.model" placeholder="不填为不存库" filterable clearable
                               :isShowAll="true"></dictionary-cascader>
        </el-form-item>
        <el-form-item class="randomValueInput" label="字段取值绑定">
          <dictionary-cascader type="合同模板取值" v-model="drawerFormData.readModel" placeholder="不填为不读取赋值" filterable
                               clearable :isShowAll="true"></dictionary-cascader>
        </el-form-item>
        <el-form-item label="多重数值验证">
          <el-select v-model="drawerFormData.validator" multiple placeholder="请选择值验证方式">
            <el-option
              v-for="item in validatorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="限制输入长度">
          <el-input v-model="drawerFormData.valueLength" placeholder="不填默认为：20"></el-input>
        </el-form-item>
        <el-form-item label="数值自动大写">
          <p>如需前一个框输入数值这个框自动转大写，请勾选</p>
          <el-switch
            v-model="drawerFormData.capitalize"
            active-text="转"
            inactive-text="不转"
            active-value="1"
            inactive-value="0">
          </el-switch>
        </el-form-item>
        <div class="drawer-footer">
           <el-button size="small" @click="drawerVisible(false)">取 消</el-button>
           <el-button size="small" type="primary" @click="drawerVisible(false, 'drawerFormData')">保存修改</el-button>
        </div>
      </div>
      <!--select控件-->
      <div key="selectDrawer" v-if="updateDrawerType === 'selectDrawer'">
        <h2>当前Select控件参数修改</h2>
        <el-form-item label="类名" prop="className" :rules="[validator.english]">
          <el-input v-model="drawerFormData.className" placeholder="不填默认为：UEditorSelect"></el-input>
        </el-form-item>
        <el-form-item label="宽度(px)">
          <el-input-number v-model="drawerFormData.width" placeholder="不填默认为：50px" :step="10" :min="10"
                           :max="500"></el-input-number>
        </el-form-item>
        <el-form-item label="高度(px)">
          <el-input-number v-model="drawerFormData.height" placeholder="不填默认为：20px" :step="10" :min="20"
                           :max="500"></el-input-number>
        </el-form-item>
        <p style="text-align: center;margin: 10px 0">---- 以下涉及数据保存问题，请认真操作 ----</p>
        <el-form-item class="randomValueInput" label="字段存值绑定">
          <dictionary-cascader type="合同模板存值" v-model="drawerFormData.model" placeholder="不填为不存库" filterable clearable
                               :isShowAll="true"></dictionary-cascader>
        </el-form-item>
        <el-form-item class="randomValueInput" label="字段取值绑定">
          <dictionary-cascader type="合同模板取值" v-model="drawerFormData.readModel" placeholder="不填为不读取赋值" filterable
                               clearable :isShowAll="true"></dictionary-cascader>
        </el-form-item>
        <el-form-item label="下拉取值方式">
          <el-switch
            v-model="drawerFormData.isDicSelect"
            active-text="字典绑定"
            inactive-text="自定可选">
          </el-switch>
        </el-form-item>
        <el-form-item v-if="drawerFormData.isDicSelect" label="下拉绑定字典">
          <el-select v-model="drawerFormData.map" filterable clearable placeholder="输入查询或下拉选择">
            <el-option
              v-for="item in selectDicOptionList"
              :key="item.label"
              :label="item.label"
              :value="item.label">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="!drawerFormData.isDicSelect" label="新增可选项" class="selectOptionAdd">
          <el-input v-model="drawerFormData.selectOption" placeholder="可选项"></el-input>
           <el-button size="small" type="primary" @click="addNewSelectOption(drawerFormData.selectOption)"><i
            class="el-icon-plus"></i></el-button>
        </el-form-item>
        <div class="selectOptionList" v-if="!drawerFormData.isDicSelect">
          <p v-for="(item, index) in selectOptionList" :key="item.key">{{item}} <i class="el-icon-circle-close"
                                                                                   @click="deleteSelectOption(index, item)"></i>
          </p>
        </div>
        <div class="drawer-footer">
           <el-button size="small" @click="drawerVisible(false)">取 消</el-button>
           <el-button size="small" type="primary" @click="drawerVisible(false, 'drawerFormData')">保存修改</el-button>
        </div>
      </div>
      <!--textarea控件-->
      <div key="textareaDrawer" v-if="updateDrawerType === 'textareaDrawer'">
        <h2>当前Textarea控件参数修改</h2>
        <el-form-item label="类名" prop="className" :rules="[validator.english]">
          <el-input v-model="drawerFormData.className"
                    placeholder="不填默认为：UEditorTextarea"></el-input>
        </el-form-item>
        <el-form-item label="宽度(px)">
          <el-input-number v-model="drawerFormData.width" placeholder="不填默认为：200px" :step="10" :min="10"
                           :max="500"></el-input-number>
        </el-form-item>
        <el-form-item label="高度(px)">
          <el-input-number v-model="drawerFormData.height" placeholder="不填默认为：50px" :step="10" :min="20"
                           :max="500"></el-input-number>
        </el-form-item>
        <p style="text-align: center;margin: 10px 0">---- 以下涉及数据保存问题，请认真操作 ----</p>
        <el-form-item class="randomValueInput" label="字段存值绑定">
          <dictionary-cascader type="合同模板存值" v-model="drawerFormData.model" placeholder="不填为不存库" filterable clearable
                               :isShowAll="true"></dictionary-cascader>
        </el-form-item>
        <el-form-item class="randomValueInput" label="字段取值绑定">
          <dictionary-cascader type="合同模板取值" v-model="drawerFormData.readModel" placeholder="不填为不读取赋值" filterable
                               clearable :isShowAll="true"></dictionary-cascader>
        </el-form-item>
        <el-form-item label="占位提示符">
          <el-input v-model="drawerFormData.placeholder" placeholder="不填默认为：空"></el-input>
        </el-form-item>
        <el-form-item label="是否可拖拽">
          <el-radio-group v-model="drawerFormData.resize">
            <el-radio :label="'both'">可拖拽</el-radio>
            <el-radio :label="'none'">不可拖拽</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="多重数值验证">
          <el-select v-model="drawerFormData.validator" multiple placeholder="请选择值验证方式">
            <el-option
              v-for="item in validatorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="限制输入长度">
          <el-input v-model="drawerFormData.valueLength" placeholder="不填默认为：200"></el-input>
        </el-form-item>
        <div class="drawer-footer">
           <el-button size="small" @click="drawerVisible(false)">取 消</el-button>
           <el-button size="small" type="primary" @click="drawerVisible(false, 'drawerFormData')">保存修改</el-button>
        </div>
      </div>
      <!--行内元素-->
      <div key="pDrawer" v-if="updateDrawerType === 'pDrawer'">
        <h2>当前选中行参数修改</h2>
        <p class="drawerTips"><i class="el-icon-s-opportunity"></i> <span>不建议</span>随意选择一行作为锚点链接</p>
        <el-form-item label="是否锚点链接">
          <el-radio-group v-model="drawerFormData.isAnchorLink">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">不是</el-radio>
          </el-radio-group>
        </el-form-item>
        <p class="drawerTips"><i class="el-icon-s-opportunity"></i> <span>不建议</span>随意修改源代码</p>
        <el-form-item label="当前行代码">
          <el-input
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 15}"
            placeholder="当前行内html代码"
            disabled
            v-model="drawerFormData.outerHTML">
          </el-input>
        </el-form-item>
        <div class="drawer-footer">
           <el-button size="small" @click="drawerVisible(false)">取 消</el-button>
           <el-button size="small" type="primary" @click="drawerVisible(false, 'drawerFormData')">保存修改</el-button>
        </div>
      </div>
    </transition>
  </el-form>
</template>

<script>
  import validator from '@/utils/validate.js';
  import {Dic} from '@/utils/auth';

  export default {
    name: "contractEditor-rightBar",
    data() {
      return {
        //--------------------------------
        updateDrawerType: '',
        //form数据
        drawerFormLabelWidth: '100px',
        drawerFormData: {},
        //select可选择项
        selectOptionList: [],
        //下拉字典选择
        selectDicOptionList: [],
        //验证
        validator: validator,
        validatorOptions: [{
          label: '必填',
          value: 'required'
        }, {
          label: '纯数字',
          value: 'number'
        }, {
          label: '纯英文',
          value: 'english'
        }, {
          label: '正整数',
          value: 'zhengnumber'
        }, {
          label: '电话号码',
          value: 'phone'
        }, {
          label: '座机号码',
          value: 'telephone'
        }, {
          label: '邮箱',
          value: 'email'
        }, {
          label: 'qq号码',
          value: 'qq'
        }, {
          label: '微信号码',
          value: 'wechat'
        }, {
          label: '身份证号码',
          value: 'IDCard'
        }, {
          label: '银行卡号码',
          value: 'bankCard'
        }, {
          label: '网址',
          value: 'url'
        }]
      }
    },
    created() {
      //处理字典
      this.AllDicInfo = Dic.getToken().dic;
      for (let i = 0; i < this.AllDicInfo.length; i++) {
        this.selectDicOptionList.push({
          label: this.AllDicInfo[i].label
        })
      }
    },
    methods: {
      //从外部调的方法打开
      openUpdateDrawer(drawerType, drawerInitData) {
        if (this.updateDrawerType === drawerType) {
          this.updateDrawerType = '';
        }
        setTimeout(() => {
          this.drawerFormData = {};
          this.updateDrawerType = drawerType;
          this.drawerFormData = drawerInitData;
          //处理多重验证
          if (drawerType !== 'pDrawer' && drawerType !== 'selectDrawer') {
            if (drawerInitData.validator !== '') {
              this.drawerFormData.validator = drawerInitData.validator.split(",");
            }
          }
          if (drawerType !== 'pDrawer') {
            //处理样式
            this.drawerFormData.width = parseInt(this.drawerFormData.width);
            this.drawerFormData.height = parseInt(this.drawerFormData.height);
            //处理数据
            this.drawerFormData.model = this.drawerFormData.model.slice(5);
          }
          //选择框数据导入
          if (drawerType === 'selectDrawer') {
            this.selectOptionList = [];
            this.selectOptionList = drawerInitData.optionList;
          }
        }, 100);
      },
      //关闭抽屉
      drawerVisible(visible, formName) {
        if (formName) {
          this.$refs[formName].validate((valid) => {
            if (valid) {
              if (this.updateDrawerType === 'selectDrawer') {
                //select赋值
                if (this.drawerFormData.isDicSelect) {
                  this.drawerFormData.selectOptionList = [];
                } else {
                  this.drawerFormData.selectOptionList = this.selectOptionList;
                  this.drawerFormData.map = '';
                  this.selectOptionList = [];
                }
              }
              this.$emit('updateDrawerData', {
                updateData: this.drawerFormData
              });
              this.updateDrawerType = '';
              this.updateDrawerVisible(false);
              //清空
              this.drawerFormData = {};
            } else {
              this.showMessage('请完善表单！', 'warning');
              return false;
            }
          });
        } else {
          //点击取消
          this.updateDrawerType = '';
          this.updateDrawerVisible(false);
          //清空
          this.drawerFormData = {};
        }
      },
      //-------------select新增或删除option
      addNewSelectOption(selectOption) {
        if (!selectOption && selectOption === '') {
          this.showMessage('请填写新增可选项!', 'warning');
        } else {
          this.selectOptionList.push(selectOption);
          this.showMessage('成功添加一个可选项：' + selectOption, 'success');
          this.drawerFormData.selectOption = '';
        }
      },
      deleteSelectOption(index, item) {
        this.selectOptionList.splice(index, 1);
        this.showMessage('删除可选项：' + item + ' 成功!', 'success');
      },
      //-------------------
      //修改抽屉显示状态
      updateDrawerVisible(visible) {
        this.$emit('showUpdateDrawer', visible);
      },
      //--------------
      //显示提示信息
      showMessage(message, type) {
        this.$message({
          showClose: true,
          message: message,
          type: type
        });
      }
    }
  }
</script>

<style scoped lang="scss">

</style>
