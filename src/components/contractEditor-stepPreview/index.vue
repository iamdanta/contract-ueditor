<template>
  <div class="contractPreview full-height">
    <el-row class="full-height" :gutter="20">
      <el-col :span="4" class="preview-left full-height">
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
      <el-col :span="15" class="preview-center full-height">
        <div class="center-form full-height">
          <previewMainApp
            id="previewMain"
            class="previewMain"
            ref="templateModel"
            :key="viewKey"
            :allModelData="allModelData"
            :viewData="viewData"
          ></previewMainApp>
        </div>
      </el-col>
      <el-col :span="5" class="preview-right full-height">
        <div class="preview-right-tips">
          <el-button
            class="printBtn"
            type="primary"
            size="medium"
            v-print="printPreviewConfig"
            >打印<i class="el-icon-s-claim el-icon--right"></i
          ></el-button>
          <h2>打印模板提示：</h2>
          <ol>
            <li>
              谷歌说："<span style="color: red;font-weight: bold"
                >许多浏览器供应商认为所有打印规范都是由用户自行决定的。</span
              >"
            </li>
            <li>
              建议点击打印后在<span style="color: red;font-weight: bold"
                >更多设置</span
              >里<span style="color: red;font-weight: bold">关闭页眉页脚</span
              >选项，<span style="color: red;font-weight: bold"
                >打开背景图形</span
              >选项
            </li>
          </ol>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
/**
 *  合同模板 查看 打印 赋值打印
 *  by wupeng
 *
 *  initContractPreview 初始化方法
 *  ---doWhat : close/contractView/view/print
 *
 *  contractPrint 打印触发方法
 */

export default {
  name: 'contractEditor-preview',
  data() {
    return {
      viewData: '',
      allModelData: {},
      anchorList: [],
      viewKey: 100,
      printPreviewConfig: {
        id: 'previewMain',
        extraCss: './contractPrint.css'
      },
      //--------正则
      inputRegExp: /<input (.*?)\/>/g, //input匹配正则
      selectRegExp: /<select ([a-zA-Z][^>]*)=[^>]*>(.*?)<\/select>/g, //select匹配正则
      optionRegExp: /<option ([a-zA-Z][^>]*)=[^>]*>(.*?)<\/option>/g, //option匹配正则
      textareaRegExp: /<textarea ([a-zA-Z][^>]*)=[^>]*>(.*?)<\/textarea>/g, //textarea匹配正则
      labelRegExp: /(<label id).*?(<\/label>)/g, //锚点匹配正则
      nameAndIdRegExp: /(['"])(?:(?!\1).)*?\1/g, //属性匹配正则
      cmrListRegExp: /(<p><label cmrliststart.*>\*\*\*\*\*出卖人列表开始).*?(出卖人列表结束\*\*\*\*\*<\/label><\/p>)|(<p><label cmrliststart.*>\*\*\*\*\*出卖人列表开始).*?(出卖人列表结束\*\*\*\*\*<\/span><\/label><\/p>)/g, //出卖人列表匹配正则
      msrListRegExp: /(<p><label msrliststart.*>\*\*\*\*\*买受人列表开始).*?(买受人列表结束\*\*\*\*\*<\/label><\/p>)|(<p><label msrliststart.*>\*\*\*\*\*买受人列表开始).*?(买受人列表结束\*\*\*\*\*<\/span><\/label><\/p>)/g, //买受人列表匹配正则
      qlrDataRegExp: /(<\/label><\/p>).*?(<p><label)/g, //权利人列表匹配正则
      //------------
      idReg: /id=".*?"/g,
      styleReg: /style=".*?"/g,
      vModelReg: /v-model=".*?"/g,
      mapDataReg: /mapdata=".*?"/g
    };
  },
  props: ['allPreViewData'],
  mounted() {
    if (this.allPreViewData) {
      this.initContractPreview(this.allPreViewData, this.allPreViewData.doWhat);
    }
  },
  methods: {
    //-------------------------------------基本方法
    initContractPreview(viewData, doWhat) {
      this.viewData = '';
      this.anchorList = [];
      if (viewData && doWhat) {
        //处理锚点
        switch (doWhat) {
          case 'contractView':
          case 'view':
            this.getAnchorList(viewData.tk);
            this.viewData = viewData.tk;
            break;
          case 'print':
            this.getAnchorList(viewData.tk);
            viewData.tk = this.convertObiList(
              viewData.tk,
              'cmrList',
              this.cmrListRegExp
            );
            viewData.tk = this.convertObiList(
              viewData.tk,
              'msrList',
              this.msrListRegExp
            );
            viewData.tk = this.convertHtml(
              viewData.tk,
              'input',
              this.inputRegExp
            );
            viewData.tk = this.convertHtml(
              viewData.tk,
              'select',
              this.selectRegExp
            );
            viewData.tk = this.convertHtml(
              viewData.tk,
              'textarea',
              this.textareaRegExp
            );
            this.viewData = viewData.tk;
            break;
        }
        this.allModelData = viewData;
        this.allModelData.doWhat = doWhat;
      }
    },
    //打印
    contractPrint() {
      this.$print(this.$refs.templateModel);
    },
    //-------------------------------------转换html
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
      tagList.forEach((tagData) => {
        //获取标签数据内的所有的属性数据
        let allList = {
          idData: searchAndBuild(tagData, this.idReg),
          styleData: searchAndBuild(tagData, this.styleReg),
          vModelData: searchAndBuild(tagData, this.vModelReg),
          mapData: searchAndBuild(tagData, this.mapDataReg)
        };
        let vModelProps =
          allList.vModelData.match(this.nameAndIdRegExp) !== null
            ? allList.vModelData
                .match(this.nameAndIdRegExp)[0]
                .replace(/"/g, '')
            : '';
        switch (convertType) {
          case 'input':
            viewData = viewData.replace(
              tagData,
              `<span class="previewInputSpan" ${
                allList.styleData
              }>{{${vModelProps}}}</span>`
            );
            break;
          case 'select':
            allList.mapData =
              allList.mapData.match(this.nameAndIdRegExp) !== null
                ? allList.mapData
                    .match(this.nameAndIdRegExp)[0]
                    .replace(/"/g, '')
                : '';
            if (allList.mapData) {
              viewData = viewData.replace(
                tagData,
                `<dictionary-span class="previewSelectSpan" type="${
                  allList.mapData
                }" :binddata="${vModelProps}" ${
                  allList.styleData
                }></dictionary-span>`
              );
            } else {
              viewData = viewData.replace(
                tagData,
                `<span class="previewSelectSpan" ${
                  allList.styleData
                }>{{${vModelProps}}}</span>`
              );
            }
            break;
          case 'textarea':
            viewData = viewData.replace(
              tagData,
              `<div class="previewTextarea" ${
                allList.styleData
              }>{{${vModelProps}}}</div>`
            );
            break;
        }
      });
      return viewData;
    },
    //匹配列表替换html
    convertObiList(viewData, convertType, regExp) {
      //判断是否有权利人列表数据
      if (viewData && convertType && regExp) {
        viewData = viewData.replace(/[\r\n]/g, '');
        let allQlrList =
          viewData.match(regExp) !== null ? viewData.match(regExp)[0] : '';
        let allObligeeData =
          allQlrList.match(this.qlrDataRegExp) !== null
            ? allQlrList.match(this.qlrDataRegExp)[0]
            : '';
        allObligeeData = allObligeeData
          .replace('</label></p><p>', '')
          .replace('</p><p><label', '');
        //allObligeeData为截取后的列表
        switch (convertType) {
          case 'cmrList':
            //将v-model转为数组循环
            if (allObligeeData.includes('form.cmrList.')) {
              allObligeeData = allObligeeData.replace(
                /form\.cmrList\./g,
                'peopleItem.'
              );
            }
            //转为特殊span
            allObligeeData = this.convertHtml(
              allObligeeData,
              'input',
              this.inputRegExp
            );
            allObligeeData = this.convertHtml(
              allObligeeData,
              'select',
              this.selectRegExp
            );
            viewData = viewData.replace(
              allQlrList,
              `
            <div class="viewObiList" v-for="(peopleItem, index) in form.cmrList" :key="peopleItem.qlr">
            ${allObligeeData}
            </div>
            `
            );
            break;
          case 'msrList':
            //将v-model转为数组循环
            if (allObligeeData.includes('form.msrList.')) {
              allObligeeData = allObligeeData.replace(
                /form\.msrList\./g,
                'peopleItem.'
              );
            }
            //转为特殊span
            allObligeeData = this.convertHtml(
              allObligeeData,
              'input',
              this.inputRegExp
            );
            allObligeeData = this.convertHtml(
              allObligeeData,
              'select',
              this.selectRegExp
            );
            viewData = viewData.replace(
              allQlrList,
              `
            <div class="viewObiList" v-for="(peopleItem, index) in form.msrList" :key="peopleItem.qlr">
            ${allObligeeData}
            </div>
            `
            );
            break;
        }
        return viewData;
      }
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
    //点击锚点跳转dom内
    jumpAnchorLink(item) {
      let main = document.getElementById('contractViewBody');
      main.scrollTop = main.querySelector('#' + item.id).offsetTop - 30;
      this.$message({
        message: '已跳转至锚点：' + item.name + ' 处',
        type: 'success'
      });
    }
  },
  components: {
    previewMainApp: {
      props: ['allModelData', 'viewData'],
      data() {
        return {
          form: {
            contract: {},
            cmrList: [],
            msrList: []
          },
          templateData: this.viewData
        };
      },
      created() {
        //模板赋值
        this.$options.template =
          `<el-form :model="form" ref="form" class="templateForm">` +
          this.templateData +
          `</el-form>`;
      },
      mounted() {
        //打印赋值
        if (this.allModelData.doWhat === 'print') {
          this.form = JSON.parse(this.allModelData.tcnr);
        }
      },
      methods: {},
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

<style scoped></style>
