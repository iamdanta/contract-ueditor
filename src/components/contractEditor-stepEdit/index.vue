<template>
  <div class="contractEdit full-height">
    <el-row class="full-height" :gutter="20">
      <el-col :span="4" class="edit-left full-height">
        <h2>合同锚点</h2>
        <ul>
          <li v-for="(item, index) in anchorList" :key="item.id">
            <el-row>
              <el-col :span="10" class="anchorLink"
                ><span><i class="el-icon-paperclip"></i> {{ index + 1 }}</span>
              </el-col>
              <el-col :span="14" class="goAnchorLink"
                ><span @click="jumpAnchorLink(item)" :id="item.id">{{
                  item.name
                }}</span>
              </el-col>
            </el-row>
          </li>
        </ul>
      </el-col>
      <el-col :span="15" class="edit-center full-height">
        <div class="center-form full-height">
          <editMainApp
            :key="viewKey"
            :allModelData="allModelData"
            :viewData="viewData"
            class="editMain"
            @saveContractData="saveContractData"
            id="editMain"
            :selectOption="selectOption"
          ></editMainApp>
        </div>
      </el-col>
      <el-col :span="5" class="edit-right full-height">
        <div
          v-if="zxyyData.isShow"
          style="margin-top: 100px;position: relative"
        >
          <h2 style="height:40px;margin: 20px 0;line-height: 40px">
            注销原因：
          </h2>
          <el-input
            type="textarea"
            :autosize="{ minRows: 5, maxRows: 5 }"
            placeholder="请输入注销原因"
            v-model="zxyyData.zxyy"
            :disabled="allModelData.doWhat === 'stockCancelView'"
          ></el-input>
          <el-button
            type="primary"
            @click="updateZxyyData()"
            style="position: absolute;top: 0;right: 10px"
            >修改注销原因
          </el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { companyInfo } from '@/utils/auth';
import validator from '@/utils/validate.js';

/**
 *  合同模板 编辑
 *  by wupeng
 *
 *  editDialogVisible 弹框显示方法
 *  ---doWhat : newEdit/edit/stockCancelEdit/stockCancelView
 *
 *  editorNewEditContract 放出的第一次保存方法，需要保存必须写这个前置方法
 *  editorEditContract 放出的修改更新方法，需要编辑必须写这个前置方法
 *  ---return form数据
 *
 *  !!注意写
 *  ---@editorNewEditContract='editorNewEditContract'
 */

export default {
  name: 'contractEditor-previewAndEdit',
  data() {
    return {
      title: '',
      //赋值
      viewData: '',
      //弹框
      dialogVisible: false,
      //模板基本数据
      allModelData: {},
      viewKey: 100,
      //左侧锚点
      anchorList: [],
      zxyyData: {
        isShow: false,
        zxyy: ''
      },
      selectOption: {},
      //-----------------------------正则
      //特殊换行/<input[^>]+>[\\s\\S]*?/g
      inputRegExp: /<input (.*?)\/>/g, //input匹配正则
      selectRegExp: /<select ([a-zA-Z][^>]*)=[^>]*>(.*?)<\/select>/g, //select匹配正则
      optionRegExp: /<option ([a-zA-Z][^>]*)=[^>]*>(.*?)<\/option>/g, //option匹配正则
      textareaRegExp: /<textarea ([a-zA-Z][^>]*)=[^>]*>(.*?)<\/textarea>/g, //textarea匹配正则
      labelRegExp: /(<label id).*?(<\/label>)/g, //锚点匹配正则
      nameAndIdRegExp: /(['"])(?:(?!\1).)*?\1/g, //属性匹配正则
      cmrListRegExp: /(<p><label cmrliststart.*>\*\*\*\*\*出卖人列表开始).*?(出卖人列表结束\*\*\*\*\*<\/label><\/p>)|(<p><label cmrliststart.*>\*\*\*\*\*出卖人列表开始).*?(出卖人列表结束\*\*\*\*\*<\/span><\/label><\/p>)/g, //出卖人列表匹配正则
      msrListRegExp: /(<p><label msrliststart.*>\*\*\*\*\*买受人列表开始).*?(买受人列表结束\*\*\*\*\*<\/label><\/p>)|(<p><label msrliststart.*>\*\*\*\*\*买受人列表开始).*?(买受人列表结束\*\*\*\*\*<\/span><\/label><\/p>)/g, //买受人列表匹配正则
      qlrDataRegExp: /(<\/label><\/p>).*?(<p><label)/g, //权利人列表匹配正则
      //--------正则，限制不会自动换行生效 labelRegExp: /<label(\s+[^="']+=(['"]).*?\2)*\s*>/g,
      idReg: /id=".*?"/g,
      classReg: /class=".*?"/g,
      typeReg: /type=".*?"/g,
      placeHolderReg: /placeHolder=".*?"/g,
      styleReg: /style=".*?"/g,
      validatorReg: /validator=".*?"/g,
      valueLengthReg: /valuelength=".*?"/g,
      vModelReg: /v-model=".*?"/g,
      bindModelReg: /bind-model=".*?"/g,
      readModelReg: /read-model=".*?"/g,
      mapDataReg: /mapdata=".*?"/g
    };
  },
  props: ['allEditData'],
  mounted() {
    if (this.allEditData) {
      this.initContractEdit(this.allEditData, this.allEditData.doWhat);
    }
  },
  methods: {
    //-------------------------------------基本方法
    initContractEdit(allModelData, doWhat) {
      this.viewData = '';
      this.anchorList = [];
      this.title = '';
      this.zxyyData = {
        isShow: false,
        zxyy: ''
      };
      if (allModelData && doWhat) {
        this.allModelData = allModelData;
        this.allModelData.doWhat = doWhat;
        let tk = allModelData.tk;
        tk = this.convertHtml(tk, 'input', this.inputRegExp);
        tk = this.convertHtml(tk, 'select', this.selectRegExp);
        tk = this.convertHtml(tk, 'textarea', this.textareaRegExp);
        //转换权利人列表
        tk = this.convertQlrList(tk, 'cmrList', this.cmrListRegExp);
        tk = this.convertQlrList(tk, 'msrList', this.msrListRegExp);
        //绑定页面数据
        tk = tk.replace(/[\r\n]/g, '');
        if (this.allModelData.errorMessage) {
          this.viewData = `
            <h1>模板渲染错误！</h1>
            <p style="color: red">该模板使用权利人模块存在格式问题，请联系管理员！</p>
            `;
        } else {
          //获取锚点
          this.getAnchorList(tk);
          this.viewData = tk;
        }
        if (doWhat === 'stockCancelEdit' || doWhat === 'stockCancelView') {
          this.zxyyData = {
            isShow: true,
            zxyy: this.allModelData.zxyy
          };
        }
      }
    },
    //保存数据的方法
    saveContractData(data) {
      if (this.allModelData.doWhat === 'newEdit') {
        this.$emit('editorNewEditContract', data);
      } else if (this.allModelData.doWhat === 'edit') {
        this.$emit('editorEditContract', data);
      }
    },
    updateZxyyData() {
      this.$emit('editorStockCancelSave', {
        id: this.allModelData.htid,
        zxyy: this.zxyyData.zxyy
      });
    },
    //-------------------------------------转换html
    //点击锚点跳转dom内
    jumpAnchorLink(item) {
      let main = document.getElementById('editMain');
      main.scrollTop = main.querySelector('#' + item.id).offsetTop - 30;
      this.$message({
        message: '已跳转至锚点：' + item.name + ' 处',
        type: 'success'
      });
    },
    //匹配锚点
    getAnchorList(viewData) {
      let anchorList = [];
      let labelList =
        viewData.match(this.labelRegExp) !== null
          ? viewData.match(this.labelRegExp)
          : [];
      //匹配label中的name和id
      for (let i = 0; i < labelList.length; i++) {
        let nameIdList =
          labelList[i].match(this.nameAndIdRegExp) !== null
            ? labelList[i].match(this.nameAndIdRegExp)
            : [];
        let newIdList = nameIdList.map((value) => value.replace(/"/g, ''));
        anchorList.push({ id: newIdList[0], name: newIdList[1] });
      }
      //处理左侧锚点，获得处理过后的name,id
      if (anchorList.length !== 0) {
        this.anchorList = anchorList;
      }
    },
    //正则匹配替换html
    convertHtml(viewData, convertType, regExp) {
      //去除所有换行符
      viewData = viewData.replace(/[\r\n]/g, '');
      //获取根据正则匹配的标签数据
      let tagList =
        viewData.match(regExp) !== null ? viewData.match(regExp) : [];
      //匹配方法
      let searchAndBuild = (data, reg) =>
        data.match(reg) !== null ? data.match(reg)[0] : '';
      //循环
      tagList.forEach((tagData) => {
        //获取标签数据内的所有的属性数据
        let allList = {
          attrList: searchAndBuild(tagData, this.nameAndIdRegExp),
          idData: searchAndBuild(tagData, this.idReg),
          classData: searchAndBuild(tagData, this.classReg),
          typeData: searchAndBuild(tagData, this.typeReg),
          placeHolderData: searchAndBuild(tagData, this.placeHolderReg),
          styleData: searchAndBuild(tagData, this.styleReg),
          validatorData: searchAndBuild(tagData, this.validatorReg),
          vModelData: searchAndBuild(tagData, this.vModelReg),
          bindModelData: searchAndBuild(tagData, this.bindModelReg),
          readModelData: searchAndBuild(tagData, this.readModelReg),
          valueLengthData: searchAndBuild(tagData, this.valueLengthReg),
          mapData: searchAndBuild(tagData, this.mapDataReg)
        };
        //转化属性数据内的验证数据
        let newValidatorList = [];
        //验证
        let vModelProps =
          allList.vModelData.match(this.nameAndIdRegExp) !== null
            ? allList.vModelData
                .match(this.nameAndIdRegExp)[0]
                .replace(/"/g, '')
            : '';
        allList.validatorData =
          allList.validatorData.match(this.nameAndIdRegExp) !== null
            ? allList.validatorData
                .match(this.nameAndIdRegExp)[0]
                .replace(/"/g, '')
            : '';
        if (allList.validatorData !== '') {
          //先转成数组再加上validator
          newValidatorList = allList.validatorData
            .split(',')
            .map((value) => 'validator.' + value);
        }
        switch (convertType) {
          case 'input':
            if (allList.typeData.includes('text')) {
              viewData = viewData.replace(
                tagData,
                `<el-form-item ${allList.styleData} prop="${
                  vModelProps.includes('form')
                    ? vModelProps.slice(5)
                    : vModelProps
                }" :rules="[${newValidatorList.toString()}]">
                    <el-input ${allList.classData} ${allList.idData} ${
                  allList.vModelData
                } ${allList.bindModelData} ${allList.readModelData} ${
                  allList.placeHolderData
                } ${allList.valueLengthData}></el-input>
                 </el-form-item>`
              );
            } else if (allList.typeData.includes('date')) {
              viewData = viewData.replace(
                tagData,
                `<el-form-item ${allList.styleData} prop="${
                  vModelProps.includes('form')
                    ? vModelProps.slice(5)
                    : vModelProps
                }" :rules="[${newValidatorList.toString()}]">
                    <el-date-picker type="date" ${allList.classData} ${
                  allList.idData
                } ${allList.vModelData} ${allList.bindModelData} ${
                  allList.readModelData
                } ${
                  allList.placeHolderData
                } value-format="yyyy-MM-dd"></el-date-picker>
                 </el-form-item>`
              );
            }
            break;
          case 'select':
            allList.mapData =
              allList.mapData.match(this.nameAndIdRegExp) !== null
                ? allList.mapData
                    .match(this.nameAndIdRegExp)[0]
                    .replace(/"/g, '')
                : '';
            if (allList.mapData !== '') {
              //如果有map
              viewData = viewData.replace(
                tagData,
                `<el-form-item ${allList.styleData}>
                    <dictionary-select ${allList.classData} ${allList.idData} ${
                  allList.vModelData
                } ${allList.bindModelData} ${allList.readModelData} type="${
                  allList.mapData
                }" clearable></dictionary-select>
                 </el-form-item>`
              );
            } else {
              //没有
              let optionList =
                tagData.match(/value=".*?"/g) !== null
                  ? tagData
                      .match(/value=".*?"/g)
                      .map((value) =>
                        value.match(this.nameAndIdRegExp)[0].replace(/"/g, '')
                      )
                  : [];
              if (optionList) {
                let randomNum = parseInt(Math.random() * 1000000);
                if (randomNum) {
                  this.selectOption['optionList' + randomNum] = optionList;
                  viewData = viewData.replace(
                    tagData,
                    `<el-form-item ${allList.styleData}>
                    <el-select ${allList.classData} ${allList.idData} ${
                      allList.vModelData
                    } ${allList.bindModelData} ${
                      allList.readModelData
                    } clearable>
                        <el-option v-for="item in selectOption.${'optionList' +
                          randomNum}" :key="item" :label="item" :value="item" name="${randomNum}"></el-option>
                    </el-select>
                 </el-form-item>`
                  );
                }
              }
            }
            break;
          case 'textarea':
            if (allList.validatorData !== '') {
              //先转成数组再加上validator
              newValidatorList = allList.validatorData
                .split(',')
                .map((value) => 'validator.' + value);
            }
            viewData = viewData.replace(
              tagData,
              `<el-form-item ${allList.styleData} prop="${
                vModelProps.includes('form')
                  ? vModelProps.slice(5)
                  : vModelProps
              }" :rules="[${newValidatorList.toString()}]">
                    <el-input type="textarea" ${allList.classData} ${
                allList.idData
              } ${allList.vModelData} ${allList.bindModelData} ${
                allList.readModelData
              } ${allList.placeHolderData} ${
                allList.valueLengthData
              }></el-input>
                 </el-form-item>`
            );
            break;
        }
      });
      return viewData;
    },
    //正则匹配替换权利人列表
    convertQlrList(viewData, convertType, regExp) {
      viewData = viewData.replace(/[\r\n]/g, '');
      //匹配所有的权利人块
      //权利人有且只有一个
      let allQlrList =
        viewData.match(regExp) !== null ? viewData.match(regExp)[0] : '';
      if (allQlrList !== '') {
        //匹配单个权利人块的内容
        let allObligeeData =
          allQlrList.match(this.qlrDataRegExp) !== null
            ? allQlrList.match(this.qlrDataRegExp)[0]
            : '';
        allObligeeData = allObligeeData
          .replace('</label></p><p>', '')
          .replace('</p><p><label', '');
        if (allObligeeData.includes('randomValue')) {
          this.allModelData.errorMessage =
            '该模板使用权利人模块存在格式问题，请联系管理员！';
        } else {
          //正则修改组内验证
          switch (convertType) {
            case 'cmrList':
              //将v-model转为数组循环
              if (allObligeeData.includes('form.cmrList.')) {
                allObligeeData = allObligeeData.replace(
                  /form\.cmrList\./g,
                  'peopleItem.'
                );
              }
              //处理props
              if (allObligeeData.includes('cmrList.')) {
                let allProps =
                  allObligeeData.match(/(prop=").*?(")/g) !== null
                    ? allObligeeData.match(/(prop=").*?(")/g)
                    : [];
                for (let j = 0; j < allProps.length; j++) {
                  let allPropsName =
                    allProps[j].match(this.nameAndIdRegExp) !== null
                      ? allProps[j].match(this.nameAndIdRegExp)
                      : [];
                  //获取全部props
                  let newPropsName = allPropsName.map((value) =>
                    value.replace(/"/g, '')
                  );
                  //获取绑定值
                  let newName = allPropsName.map((value) =>
                    value.replace(/cmrList\./g, '').replace(/"/g, '')
                  );
                  //转prop
                  allObligeeData = allObligeeData.replace(
                    newPropsName[0],
                    "'" + convertType + ".' + index + '." + newName[0] + "'"
                  );
                }
                allObligeeData = allObligeeData.replace(/prop/g, ':prop');
                viewData = viewData.replace(
                  allQlrList,
                  `
          <div class="contractQlrList">
            <el-button size="mini" type="info" icon="el-icon-plus" @click="addQlrList('cmr')">新增出卖人</el-button>
            <div v-for="(peopleItem, index) in form.cmrList" :key="peopleItem.name" class="contractQlrListBody">
            <p>第{{index + 1}}位出卖人</p>${allObligeeData}
              <el-tooltip effect="dark" content="删除此出卖人" placement="right">
                <span class="deleteListBtn" @click="deleteQlrList('cmr', index, peopleItem)"><i class="el-icon-circle-close"></i></span>
              </el-tooltip>
            </div>
          </div>
          `
                );
              }
              break;
            case 'msrList':
              //将v-model转为数组循环
              if (allObligeeData.includes('form.msrList.')) {
                allObligeeData = allObligeeData.replace(
                  /form\.msrList\./g,
                  'peopleItem.'
                );
              }
              //处理props
              if (allObligeeData.includes('msrList.')) {
                let allProps =
                  allObligeeData.match(/(prop=").*?(")/g) !== null
                    ? allObligeeData.match(/(prop=").*?(")/g)
                    : [];
                for (let j = 0; j < allProps.length; j++) {
                  let allPropsName =
                    allProps[j].match(this.nameAndIdRegExp) !== null
                      ? allProps[j].match(this.nameAndIdRegExp)
                      : [];
                  //获取全部props
                  let newPropsName = allPropsName.map((value) =>
                    value.replace(/"/g, '')
                  );
                  //获取绑定值
                  let newName = allPropsName.map((value) =>
                    value.replace(/msrList\./g, '').replace(/"/g, '')
                  );
                  //转prop
                  allObligeeData = allObligeeData.replace(
                    newPropsName[0],
                    "'" + convertType + ".' + index + '." + newName[0] + "'"
                  );
                }
                allObligeeData = allObligeeData.replace(/prop/g, ':prop');
                viewData = viewData.replace(
                  allQlrList,
                  `
          <div class="contractQlrList">
            <el-button size="mini" type="info" icon="el-icon-plus" @click="addQlrList('msr')">新增买受人</el-button>
            <div v-for="(peopleItem, index) in form.msrList" :key="peopleItem.name" class="contractQlrListBody">
            <p>第{{index + 1}}位买受人</p>${allObligeeData}
              <el-tooltip effect="dark" content="删除此买受人" placement="right">
                <span class="deleteListBtn" @click="deleteQlrList('msr', index, peopleItem)"><i class="el-icon-circle-close"></i></span>
              </el-tooltip>
            </div>
          </div>
          `
                );
              }
              break;
          }
        }
      }
      return viewData;
    },
    getRandomNum() {
      let random = Math.floor(Math.random() * 1000000);
      //强制获取6位数
      if (random < 100000 || random >= 1000000) {
        this.getRandomNum();
      } else {
        return random;
      }
    }
  },
  //-------------------------------------渲染html
  components: {
    editMainApp: {
      props: ['allModelData', 'viewData', 'selectOption'],
      data() {
        return {
          //用户基本数据
          AllCompanyInfo: '',
          isDisabled: false,
          form: {
            contract: {},
            cmrList: [],
            msrList: []
          },
          templateData: this.viewData,
          validator: validator
        };
      },
      created() {
        ///获取用户数据
        this.AllCompanyInfo = companyInfo.getToken();
        //模板赋值
        this.$options.template =
          `<el-form :model="form" ref="form" class="templateForm" :disabled="isDisabled">${this.templateData}<el-button class="editSaveBtn" type="primary" size="medium" @click="saveContractData()">保存已填数据<i class="el-icon-s-claim el-icon--right"></i></el-button></el-form>`;
      },
      mounted() {
        this.isDisabled = false;
        if (this.allModelData.doWhat === 'newEdit') {
          if (this.allModelData.errorMessage) {
            this.isDisabled = true;
          } else {
            //赋值操作
            let main = document.getElementById('editMain');
            let allReadModelDom = main.querySelectorAll('[read-model]');
            for (let i = 0; i < allReadModelDom.length; i++) {
              //获取的是带点的值 需要转换成数组
              let bindValueList = allReadModelDom[i]
                .getAttribute('bind-model')
                .split('.');
              let objValueList = allReadModelDom[i]
                .getAttribute('read-model')
                .split('.');
              this.$set(
                this.form[bindValueList[0]],
                [bindValueList[1]],
                this.allModelData[objValueList[0]][objValueList[1]]
              );
            }
          }
        } else {
          //判断是否禁用
          if (
            this.allModelData.doWhat === 'stockCancelEdit' ||
            this.allModelData.doWhat === 'stockCancelView'
          ) {
            this.isDisabled = true;
          }
          //不做赋值操作直接拿tcnr绑定
          if (this.allModelData.tcnr) {
            this.form = JSON.parse(this.allModelData.tcnr);
          }
        }
      },
      methods: {
        //保存已填数据
        saveContractData() {
          this.$refs.form.validate((valid) => {
            if (valid) {
              //触发保存方法
              this.$emit('saveContractData', this.form);
            } else {
              //验证未通过
              this.$message({
                message: '请完善表单！',
                type: 'warning'
              });
              return false;
            }
          });
        },
        //添加人
        addQlrList(data) {
          switch (data) {
            case 'cmr':
              this.form.cmrList.push({});
              this.$message.success('新增出卖人成功！');
              break;
            case 'msr':
              this.form.msrList.push({});
              this.$message.success('新增买受人成功！');
              break;
          }
        },
        //删除人
        deleteQlrList(data, index, item) {
          switch (data) {
            case 'cmr':
              this.form.cmrList.splice(index, 1);
              this.$message.success('删除 ' + item.name + ' 信息成功！');
              break;
            case 'msr':
              this.form.msrList.splice(index, 1);
              this.$message.success('删除 ' + item.name + ' 信息成功！');
              break;
          }
        }
      },
      template: ``
    }
  },
  watch: {
    viewData() {
      if (this.viewData !== '') {
        ++this.viewKey;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
p {
  line-height: 20px;
  font-size: 16px;
}

/deep/ .el-dialog__header {
  background: none;
  padding: 20px 20px 10px;
  text-align: left;
}

/deep/ .el-dialog__title {
  color: #303133;
}

/deep/ .el-dialog__headerbtn {
  top: 20px;

  .el-dialog__close {
    color: #909399;
  }
}
</style>
