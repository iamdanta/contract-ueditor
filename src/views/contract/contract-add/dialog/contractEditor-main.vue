<template>
  <el-dialog :title="editorDialogTitle" :visible.sync="editorDialogVisible" :show-close="false"
             :close-on-press-escape="false"
             :close-on-click-modal="false" :fullscreen="true" destroy-on-close
             class="contract-editor-main-dialog full-height">
    <div class="main-editor-body full-height" v-loading.fullscreen.lock="loading"
         element-loading-text="拼命加载中"
         element-loading-spinner="el-icon-loading"
         element-loading-background="rgba(0, 0, 0, 0.8)">
      <el-drawer
        class="left-bar full-height"
        title="锚点"
        :visible.sync="leftBarDrawerShow"
        size="350px"
        direction="ltr">
        <contractEditorLeftBar ref="contractEditorLeftBar" :frame="frame" :contractModelData="contractModelData"
                               :contractAnchorLinkList="contractAnchorLinkList"
                               class="scrollbar-default"></contractEditorLeftBar>
      </el-drawer>
      <div class="other-components">
        <el-tooltip class="item" effect="dark" :content="item.title" placement="right"
                    v-for="(item, i) in UEditorOtherComponents" :key="i">
          <el-button type="primary" size="small" plain @click="UEditorOtherComponentsClick(item)">{{item.name}}
          </el-button>
        </el-tooltip>
      </div>
      <div class="vue-ueditor full-height">
        <vue-ueditor-wrap class="UEditorBody full-height" v-model="UEditorBaseCodeData" :config="UEditorConfig"
                          @ready="UEditorReady"
                          @beforeInit="UEditorAddCustomButton"></vue-ueditor-wrap>
      </div>
      <el-drawer
        class="right-bar full-height"
        title="修改组件"
        :visible.sync="rightBarDrawerShow"
        size="350px"
        direction="rtl">
        <contractEditorRightBar ref="contractEditorRightBar" class="scrollbar-default"
                                @updateDrawerData="updateDrawerData"
                                @showUpdateDrawer="showUpdateDrawer"></contractEditorRightBar>
      </el-drawer>
      <div class="other-button flex flex-column">
        <el-popover
          placement="left-start"
          width="400"
          trigger="hover">
          <contract-editor-help/>
          <el-button type="success" size="small" slot="reference" icon="el-icon-thumb">操作帮助</el-button>
        </el-popover>
        <el-button type="success" size="small" slot="reference" icon="el-icon-notebook-1" @click="lc">流程示意</el-button>
        <el-popover
          placement="left-start"
          width="400"
          trigger="hover">
          <contract-editor-update-work/>
          <el-button type="success" size="small" slot="reference" icon="el-icon-s-opportunity">更新日志</el-button>
        </el-popover>
      </div>
    </div>
    <div class="editor-footer">
      <el-form class="contractEditorFooterForm" :model="contractModelData" ref="modelForm" :inline="true">
        <el-badge :value="contractAnchorLinkList.length">
          <el-button type="primary" size="small" @click="showLeftDrawer(true)" icon="el-icon-paperclip">查看锚点</el-button>
        </el-badge>
        <el-form-item prop="modelName" :rules="[validator.required]">
          <el-input class="contractEditorFooterFormInput" size="small" v-model="contractModelData.modelName"
                    placeholder="请输入模板名称"
                    clearable></el-input>
        </el-form-item>
        <el-form-item prop="modelType" :rules="[validator.required]">
          <dictionary-select v-model="contractModelData.modelType" type="模板类型" placeholder="请选择模板类型" clearable
          ></dictionary-select>
        </el-form-item>
        <el-button v-if="!isEditContract" type="primary" size="small" @click="goAddContract()"
                   icon="el-icon-document-add">保存开发
        </el-button>
        <el-button v-if="!isEditContract" type="primary" size="small" @click="goAddContract(yh)"
                   icon="el-icon-magic-stick">保存并进行发布优化
        </el-button>
        <el-button v-if="isEditContract" type="primary" size="small" @click="goSaveUpdateContract()"
                   icon="el-icon-document-add">保存开发
        </el-button>
        <el-button v-if="isEditContract" type="primary" size="small" @click="goSaveUpdateContract(yh)"
                   icon="el-icon-magic-stick">保存并进行发布优化
        </el-button>
        <el-button size="small" @click="mainDialogVisible(false)" icon="el-icon-close">退 出
        </el-button>
      </el-form>
      <contract-editor-last-rebuild ref="contractEditorLastRebuild"/>
      <contract-editor-help-step ref="contractEditorHelpStep"/>
    </div>
  </el-dialog>
</template>

<script>
  /**
   *  contractEditor-main
   *  自定义合同模板编辑器
   *  by wupeng
   *
   *  请勿随意修改代码
   */

  //-----------------
  //接口与所需配置
  import CONFIG from '@/config/config';
  import validator from '@/utils/validate';
  //-----------------vue 和 UEditor的集合体
  import VueUeditorWrap from 'vue-ueditor-wrap';
  //-----------------
  import contractEditorLeftBar from './components/contractEditor-leftBar';
  import contractEditorRightBar from './components/contractEditor-rightBar';
  import ContractEditorHelp from './components/contractEditor-help';
  import ContractEditorUpdateWork from './components/contractEditor-update-work';
  import ContractEditorLastRebuild from './components/contractEditor-lastRebuild';
  import ContractEditorHelpStep from './components/contractEditor-help-step';

  export default {
    name: 'contractEditor-main',
    props: {},
    data() {
      return {
        UEditorConfig: {},
        loading: false, //加载状态
        isEditContract: false, //是否是编辑状态
        validator: validator, //验证
        //模板名称 控制填入
        contractModelData: {},
        contractModelSaved: false,
        //模板锚点数据
        contractAnchorLinkList: [],
        //----
        //左侧
        leftBarDrawerShow: false,
        //右侧
        rightBarDrawerShow: false,
        //------------------------------
        labelRegExp: /(<label id).*?(<\/label>)/g, //锚点匹配正则
        nameAndIdRegExp: /(['"])(?:(?!\1).)*?\1/g, //属性匹配正则
        //------------------------------
        //UE主弹框数据
        editorDialogVisible: false,
        editorDialogTitle: '',
        //------------------------------
        //编辑器内部iframe指向的window
        frame: '',
        //----------------------------------
        //编辑器
        editorInstance: null,
        //编辑器双向绑定数据
        UEditorBaseCodeData: ``,
        //编辑器额外组件按钮
        UEditorOtherComponents: []
      };
    },
    components: {
      ContractEditorLastRebuild,
      ContractEditorUpdateWork,
      ContractEditorHelp,
      ContractEditorHelpStep,
      VueUeditorWrap,
      contractEditorLeftBar,
      contractEditorRightBar
    },
    created() {
      //UEditor初始配置
      this.UEditorConfig = window.UEditorMainConfig;
      if (process.env.NODE_ENV === 'development') {
        // 不打包时，使用如下配置
        this.UEditorConfig.UEDITOR_HOME_URL = '/UEditor/';
      } else {
        // 打包时对应服务器路径
        this.UEditorConfig.UEDITOR_HOME_URL = CONFIG.UEditorPackAgeUrl;
      }
    },
    watch: {
      // 隐藏按钮
      'UEditorOtherComponents'(val) {
        if (val) {
          let dom;
          val.forEach(item => {
            dom = document.getElementsByClassName(item.className)[0];
            dom.setAttribute('style', 'display: none !important');
          });
        }
      }
    },
    methods: {
      //退出或打开主弹框
      mainDialogVisible(visible, data) {
        let cleanEditor = () => {
          //清空文档
          this.UEditorBaseCodeData = '';
          //清空基本数据
          this.contractModelData = {};
          this.contractModelSaved = false;
          //清空锚点
          this.contractAnchorLinkList = [];
          this.UEditorOtherComponents = [];
          //编辑状态为false
          this.isEditContract = false;
          //弹框显示
          this.editorDialogVisible = visible;
          this.$emit('getList');
        };
        if (!visible) {
          if (data === '关闭弹框') {
            cleanEditor();
            return false;
          } else {
            this.$confirm('退出不会保存您的内容, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              cleanEditor();
            });
          }
        } else {
          this.editorDialogVisible = visible;
          this.UEditorBaseCodeData = '';
          this.contractModelData = {};
          this.contractModelSaved = false;
          this.contractAnchorLinkList = [];
          this.isEditContract = false;
          this.editorDialogTitle = '新增合同模板-开发状态';
        }
        //如果有data则是编辑状态
        if (data) {
          this.UEditorBaseCodeData = data.tk;
          this.editorDialogTitle = '编辑 ' + data.mbmc + ' 合同模板-开发状态';
          this.contractModelData.modelName = data.mbmc;
          this.contractModelData.modelType = data.mblx;
          this.contractModelData.id = data.id;
          this.contractModelSaved = true;
          this.isEditContract = true;
          this.getAnchorList(data.tk);
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
          this.contractAnchorLinkList = anchorList;
        }
      },
      //------------------------------------
      //UEditor初始化
      UEditorReady(editorInstance) {
        //编辑器实例editorInstance
        this.editorInstance = editorInstance;
        //控件双击事件初始化
        this.UEditorInitBtnDoubleClick();
        //编辑器内容变动后自动匹配锚点删除
        editorInstance.addListener('contentChange', () => {
          if (this.contractAnchorLinkList.length > 0) {
            for (let i = 0; i < this.contractAnchorLinkList.length; i++) {
              if (!editorInstance.getContent().includes(this.contractAnchorLinkList[i].id)) {
                this.contractAnchorLinkList.splice(i, 1);
              }
            }
          }
        });
      },
      //UEditor初始化加入几大按钮
      UEditorAddCustomButton(editorId) {
        window.UE.registerUI('addInputBtn addSelectBtn addTextareaBtn addFqxxBtn addSpfCmrBtn addClfCmrBtn addMsrBtn addJjfsBtn', (editor, uiName) => {
          // 创建一个 button
          let btn;
          switch (uiName) {
            case 'addInputBtn':
              this.UEditorOtherComponents.push({
                name: 'input控件',
                className: 'inputBtn',
                title: '在指针处添加一个input控件'
              });
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个input控件',
                className: 'inputBtn',
                // 点击时执行的命令
                onclick: () => {
                  // 这里可以不用执行命令，做你自己的操作也可
                  let randomId = this.getRandomNum();
                  let randomModel = this.getRandomNum();
                  if (randomId && randomModel) {
                    let ids = 'I' + randomId;
                    let models = 'form.randomValue' + randomModel;
                    editor.execCommand('inserthtml', `<input type="text" class="UEditorInput" id="${ids}" v-model="${models}" bind-model="" read-model="" style="width: 50px;height: 20px" placeholder="" validator="" valueLength="20" capitalize="0" />`);
                    // this.$message.success('成功添加了一个Input控件！');
                  }
                }
              });
              break;
            case 'addSelectBtn':
              this.UEditorOtherComponents.push({
                name: 'select控件',
                className: 'selectBtn',
                title: '在指针处添加一个select控件'
              });
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个select控件',
                className: 'selectBtn',
                // 点击时执行的命令
                onclick: () => {
                  // 这里可以不用执行命令，做你自己的操作也可
                  let randomId = this.getRandomNum();
                  let randomModel = this.getRandomNum();
                  if (randomId && randomModel) {
                    let ids = 'S' + randomId;
                    let models = 'form.randomValue' + randomModel;
                    editor.execCommand('inserthtml', `<select class="UEditorSelect" id="${ids}" v-model="${models}" bind-model="" read-model="" style="width: 100px;height: 26px"></select>`);
                    // this.$message.success('成功添加了一个Select控件！');
                  }
                }
              });
              break;
            case 'addTextareaBtn':
              this.UEditorOtherComponents.push({
                name: 'textarea控件',
                className: 'textareaBtn',
                title: '在指针处添加一个textarea控件'
              });
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个textarea控件',
                className: 'textareaBtn',
                // 点击时执行的命令
                onclick: () => {
                  // 这里可以不用执行命令，做你自己的操作也可
                  let randomId = this.getRandomNum();
                  let randomModel = this.getRandomNum();
                  if (randomId && randomModel) {
                    let ids = 'T' + randomId;
                    let models = 'form.randomValue' + randomModel;
                    editor.execCommand('inserthtml', `<textarea class="UEditorTextarea" id="${ids}" v-model="${models}" bind-model="" read-model="" style="width: 200px;height: 50px;resize: both;display: block" placeholder="" validator="" valueLength="200"></textarea>`);
                    // this.$message.success('成功添加了一个Textarea控件！');
                  }
                }
              });
              break;
            case 'addFqxxBtn':
              this.UEditorOtherComponents.push({
                name: '分期信息控件',
                className: 'fqxxBtn',
                title: '在指针处添加一个分期信息展示区域控件'
              });
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个分期信息展示区域控件',
                className: 'fqxxBtn',
                // 点击时执行的命令
                onclick: () => {
                  if (this.UEditorBaseCodeData.includes('分期信息展示区域开始*****')) {
                    this.$message.warning('您已经添加了一个分期信息展示区域控件，无法重复添加！');
                    return false;
                  }
                  let html = `
                  <p>*****勿删，分期信息展示区域开始*****</p>
                  <p>1。一次性付款。买受人应当在_____前支付该商品房全部价款</p>
                  <p>2。分期付款。买受人应当在_____前分_____期支付改商品房全部价款，首期房价款_____（币种）_____元（大写：_____元整），应当与前支付。</p>
                  <p>3。贷款方式付款：_____。买受人应当于_____前支付首期房价款_____（币种）_____元（大写：_____元整），占全部房价款的_____%</p>
                  <p>3。其他方式：________________________</p>
                  <p>*****勿删，分期信息展示区域结束*****</p>
                  `;
                  // 这里可以不用执行命令，做你自己的操作也可
                  editor.execCommand('inserthtml', html);
                }
              });
              break;
            case 'addSpfCmrBtn': // 商品房出卖人
              this.UEditorOtherComponents.push({
                name: '商品房流程出卖人控件',
                className: 'spfCmrBtn',
                title: '在指针处添加一个商品房流程出卖人信息展示区域控件'
              });
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个商品房流程出卖人信息展示区域控件',
                className: 'spfCmrBtn',
                // 点击时执行的命令
                onclick: () => {
                  if (this.UEditorBaseCodeData.includes('商品房流程-出卖人信息展示区域开始*****')) {
                    this.$message.warning('您已经添加了一个商品房流程-出卖人信息控件，无法重复添加！');
                    return false;
                  }
                  let html = `
                     <p>*****勿删，商品房流程-出卖人信息展示区域开始*****</p>
                     <p>出卖人：___________________________________________________________</p>
                     <p>通讯地址：__________________________________________________________</p>
                     <p>邮政编码：_________________________________________________________</p>
                     <p>营业执照注册号：_____________________________________________________</p>
                     <p>企业资质证书号：_____________________________________________________</p>
                     <p>法定代理人：________________________联系电话：________________________</p>
                     <p>委托代理人：________________________联系电话：________________________</p>
                     <p>委托销售经纪机构：___________________________________________________</p>
                     <p>通讯地址：_________________________________________________________</p>
                     <p>邮政编码：_________________________________________________________</p>
                     <p>营业执照注册号：____________________________________________________</p>
                     <p>经济机构备案证明号：__________________________________________________</p>
                     <p>法定代表人：________________________联系电话：________________________</p>
                     <p>*****勿删，商品房流程-出卖人信息展示区域结束*****</p>
                  `;
                  // 这里可以不用执行命令，做你自己的操作也可
                  editor.execCommand('inserthtml', html);
                }
              });
              break;
            case 'addClfCmrBtn': // 存量房出卖人
              this.UEditorOtherComponents.push({
                name: '存量房流程出卖人控件',
                className: 'clfCmrBtn',
                title: '在指针处添加一个存量房流程出卖人信息展示区域控件'
              });
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个存量房流程出卖人信息展示区域控件',
                className: 'clfCmrBtn',
                // 点击时执行的命令
                onclick: () => {
                  if (this.UEditorBaseCodeData.includes('存量房流程-出卖人信息展示区域开始*****')) {
                    this.$message.warning('您已经添加了一个存量房流程-出卖人信息控件，无法重复添加！');
                    return false;
                  }
                  let html = `
                     <p>*****勿删，存量房流程-出卖人信息展示区域开始*****</p>
                     <p>没有最新的合同！！！！！！！！以下为商品房的人格式</p>
                     <p>出卖人：___________________________________________________________</p>
                     <p>通讯地址：__________________________________________________________</p>
                     <p>邮政编码：_________________________________________________________</p>
                     <p>营业执照注册号：_____________________________________________________</p>
                     <p>企业资质证书号：_____________________________________________________</p>
                     <p>法定代理人：________________________联系电话：________________________</p>
                     <p>委托代理人：________________________联系电话：________________________</p>
                     <p>委托销售经纪机构：___________________________________________________</p>
                     <p>通讯地址：_________________________________________________________</p>
                     <p>邮政编码：_________________________________________________________</p>
                     <p>营业执照注册号：____________________________________________________</p>
                     <p>经济机构备案证明号：__________________________________________________</p>
                     <p>法定代表人：________________________联系电话：________________________</p>
                     <p>*****勿删，存量房流程-出卖人信息展示区域结束*****</p>
                  `;
                  // 这里可以不用执行命令，做你自己的操作也可
                  editor.execCommand('inserthtml', html);
                }
              });
              break;
            case 'addMsrBtn': // 买受人一样
              this.UEditorOtherComponents.push({
                name: '买受人控件',
                className: 'msrBtn',
                title: '在指针处添加一个买受人信息展示区域控件'
              });
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个买受人信息展示区域控件',
                className: 'msrBtn',
                // 点击时执行的命令
                onclick: () => {
                  if (this.UEditorBaseCodeData.includes('买受人信息展示区域开始*****')) {
                    this.$message.warning('您已经添加了一个买受人信息展示区域控件，无法重复添加！');
                    return false;
                  }
                  let html = `
                     <p>*****勿删，买受人信息展示区域开始*****</p>
                     <p>买受人：_________________________________________________________</p>
                     <p>[法定代表人][负责人]：_____________________________________________</p>
                     <p>[国籍][户籍所在地]：_______________________________________________</p>
                     <p>[证件类型]：[居民身份证][护照][营业执照]：[____]，证号：_____________</p>
                     <p>出生日期：_____________________________，性别：____________________</p>
                     <p>通讯地址：_______________________________________________________</p>
                     <p>邮政编码：________________________联系电话：________________________</p>
                     <p>[委托代理人][法定代理人]：__________________________________________</p>
                     <p>[国籍][户籍所在地]：_______________________________________________</p>
                     <p>[证件类型]：[居民身份证][护照][营业执照]：[____]，证号：_____________</p>
                     <p>出生日期：_____________________________，性别：____________________</p>
                     <p>通讯地址：________________________________________________________</p>
                     <p>邮政编码：________________________联系电话：________________________</p>
                     <p>*****勿删，买受人信息展示区域结束*****</p>
                  `;
                  // 这里可以不用执行命令，做你自己的操作也可
                  editor.execCommand('inserthtml', html);
                }
              });
              break;
            case 'addJjfsBtn':
              this.UEditorOtherComponents.push({
                name: '计价方式控件',
                className: 'jjfsBtn',
                title: '在指针处添加一个计价方式信息展示区域控件'
              });
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个计价方式信息展示区域控件',
                className: 'jjfsBtn',
                // 点击时执行的命令
                onclick: () => {
                  if (this.UEditorBaseCodeData.includes('计价方式信息展示区域开始*****')) {
                    this.$message.warning('您已经添加了一个计价方式信息展示区域控件，无法重复添加！');
                    return false;
                  }
                  let html = `
                  <p>*****勿删，计价方式信息展示区域开始*****</p>
                  <p>出卖人与买受人按照下列第___种方式计算该商品房价款</p>
                  <p>1。按照套内建筑面积计算，该商品房单价为每平方米_____（币种）_____元，总价款为_____（币种）_____元（大写_____元整）。</p>
                  <p>2。按照建筑面积计算，该商品房单价为每平方米_____（币种）_____元，总价款为_____（币种）_____元（大写_____元整）。</p>
                  <p>3。按照套计算，该商品房总价款为_____（币种）_____元（大写_____元整）。</p>
                  <p>4。按照_____计算，该商品房总价款为_____（币种）_____元（大写_____元整）。</p>
                  <p>*****勿删，计价方式信息展示区域结束*****</p>
                  `;
                  // 这里可以不用执行命令，做你自己的操作也可
                  editor.execCommand('inserthtml', html);
                }
              });
              break;
          }
          // 当点到编辑内容上时，按钮要做的状态反射
          editor.addListener('selectionchange', () => {
            var state = editor.queryCommandState(uiName);
            if (state === -1) {
              btn.setDisabled(true);
              btn.setChecked(false);
            } else {
              btn.setDisabled(false);
              btn.setChecked(state);
            }
          });
          // 因为你是添加 button，所以需要返回这个 button
          return btn;
        }, 100 /* 指定添加到工具栏上的哪个位置，默认时追加到最后 */, editorId /* 指定这个 UI 是哪个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮 */);
      },
      //UEditor自定义控件加入双击事件
      UEditorInitBtnDoubleClick() {
        //处理不同frame的情况
        for (let i = 0; i < 100; i++) {
          if (document.getElementById('ueditor_' + i) !== null) {
            this.frame = document.getElementById('ueditor_' + i).contentWindow;
            break;
          }
          if (i === 99) {
            this.$message.warning('无法获取到编辑器dom，请退出重试！');
            break;
          }
        }
        //优化iframe内部的滚动条样式，避免影响间距
        // this.frame.document.styleSheets[0].insertRule('body::-webkit-scrollbar-track-piece { background: #d3dce6 }', 0);
        // this.frame.document.styleSheets[0].insertRule('body::-webkit-scrollbar { width: 1px }', 0);
        // this.frame.document.styleSheets[0].insertRule('body::-webkit-scrollbar-thumb { background: #99a9bf }', 0);
        //直接隐藏滚动条
        this.frame.document.styleSheets[0].insertRule('body::-webkit-scrollbar { display: none }', 0);
        this.frame.document.styleSheets[0].insertRule('body::-webkit-scrollbar { scrollbar-width: none }', 0);
        this.frame.document.styleSheets[0].insertRule('body::-webkit-scrollbar { -ms-overflow-style: none }', 0);
        //双击触发修改事件
        this.frame.addEventListener('dblclick', (eObj) => {
          //获取选定的dom
          let node = eObj.srcElement || eObj.target;
          let nodeDom = this.frame.document.getElementById(node.id);
          //判断是否是dom元素
          if (nodeDom) {
            switch (node.nodeName.toLowerCase()) {
              case 'input':
                this.openUpdateDrawer('inputDrawer', {
                  id: node.id,
                  type: node.type,
                  className: node.className,
                  width: node.style.width,
                  height: node.style.height,
                  model: nodeDom.getAttribute('v-model'),
                  readModel: nodeDom.getAttribute('read-model'),
                  placeholder: node.placeholder,
                  validator: nodeDom.getAttribute('validator'),
                  valueLength: nodeDom.getAttribute('valueLength'),
                  capitalize: nodeDom.getAttribute('capitalize')
                });
                break;
              case 'select':
                let optionList = [];
                let isDicSelect = true;
                for (let i = 0; i < node.options.length; i++) {
                  optionList.push(node.options[i].value);
                }
                if (optionList.length !== 0) {
                  isDicSelect = false;
                }
                this.openUpdateDrawer('selectDrawer', {
                  id: node.id,
                  className: node.className,
                  width: node.style.width,
                  height: node.style.height,
                  model: nodeDom.getAttribute('v-model'),
                  readModel: nodeDom.getAttribute('read-model'),
                  map: nodeDom.getAttribute('mapData'),
                  optionList: optionList,
                  isDicSelect: isDicSelect
                });
                this.oldOptionList = optionList;
                break;
              case 'textarea':
                this.openUpdateDrawer('textareaDrawer', {
                  id: node.id,
                  className: node.className,
                  width: node.style.width,
                  height: node.style.height,
                  resize: node.style.resize,
                  model: nodeDom.getAttribute('v-model'),
                  readModel: nodeDom.getAttribute('read-model'),
                  placeholder: node.placeholder,
                  validator: nodeDom.getAttribute('validator'),
                  valueLength: nodeDom.getAttribute('valueLength')
                });
                break;
            }
          } else {
            //处理父级元素 不管选定哪一行 父级元素肯定是p
            let getParent = (nowItem) => {
              let parent = nowItem.parentNode;
              if (parent.nodeName.toLowerCase() === 'body' || parent.nodeName.toLowerCase() === 'br') {
                return nowItem;
              } else if (parent.nodeName.toLowerCase() === 'html') {
                return false;
              } else if (parent.nodeName.toLowerCase() === 'p') {
                return parent;
              } else if (parent.nodeName.toLowerCase() !== 'p') {
                getParent(parent);
              } else {
                return false;
              }
            };
            let parentNode = getParent(node);
            if (!parentNode) {
              this.$refs.contractEditorRightBar.updateDrawerVisible(false);
              return false;
            }
            let isAnchorLink = false;
            //判断是否存在锚点链接
            if (parentNode.getElementsByTagName('label').length > 0) {
              isAnchorLink = true;
              this.openUpdateDrawer('pDrawer', {
                isPId: true,
                outerHTML: parentNode.outerHTML,
                innerText: parentNode.innerText,
                isAnchorLink: isAnchorLink,
                anchorLinkId: parentNode.getElementsByTagName('label')[0].id
              });
            } else {
              this.openUpdateDrawer('pDrawer', {
                isPId: true,
                outerHTML: parentNode.outerHTML,
                innerText: parentNode.innerText,
                isAnchorLink: isAnchorLink
              });
            }
            this.savePDrawerDocument(parentNode);
          }
        });
      },
      //UEditor自定义控件外显点击事件
      UEditorOtherComponentsClick(item) {
        if (item.className) {
          //通过class找到按钮并执行点击事件
          document.getElementsByClassName(item.className)[0].getElementsByClassName('edui-button-body')[0].click();
        }
      },
      //------------------------------------
      //控制左侧抽屉展示外部方法
      showLeftDrawer(visible) {
        this.leftBarDrawerShow = visible;
      },
      //控制右侧抽屉展示外部方法
      showUpdateDrawer(visible) {
        this.rightBarDrawerShow = visible;
      },
      //------------------------------------
      //打开双击修改的抽屉
      openUpdateDrawer(drawerType, drawerInitData) {
        this.showUpdateDrawer(true);
        this.$nextTick(() => {
          this.$refs.contractEditorRightBar.openUpdateDrawer(drawerType, drawerInitData);
        });
      },
      //获取抽屉的更新数据并更新给html
      updateDrawerData(dataObj) {
        if (dataObj.updateData.isPId) {
          //是否是行内修改
          if (!dataObj.updateData.isAnchorLink) {
            if (dataObj.updateData.anchorLinkId) {
              //如果选择了不是锚点并且含有id
              //移除
              for (let i = 0; i < this.contractAnchorLinkList.length; i++) {
                if (this.contractAnchorLinkList[i].id === dataObj.updateData.anchorLinkId) {
                  this.contractAnchorLinkList.splice(i, 1);
                }
              }
              this.pDrawerDocument.removeChild(this.pDrawerDocument.getElementsByTagName('label')[0]);
            }
          } else {
            //如果选择了是锚点
            if (dataObj.updateData.anchorLinkId) {
              //如果有锚点 后续不执行
              return false;
            }
            let randomId = this.getRandomNum();
            if (randomId) {
              let newId = 'contractAnchorLink-' + randomId;
              dataObj.updateData.innerText = dataObj.updateData.innerText.substr(0, 10);
              this.contractAnchorLinkList.push({
                name: dataObj.updateData.innerText,
                id: newId
              });
              let liElement = document.createElement('label');
              liElement.id = newId;
              liElement.title = dataObj.updateData.innerText;
              this.pDrawerDocument.appendChild(liElement);
            }
          }
          return false;
        }
        //执行非行内修改
        let byIdDocument = this.frame.document.getElementById(dataObj.updateData.id);
        if (dataObj.updateData) {
          //统一更新
          Object.getOwnPropertyNames(dataObj.updateData).forEach((key) => {
            switch (key) {
              case  'type':
                byIdDocument.setAttribute('type', dataObj.updateData[key]);
                break;
              case 'className':
              case 'placeholder':
                byIdDocument[key] = dataObj.updateData[key];
                break;
              case 'width':
              case 'height':
                byIdDocument.style[key] = dataObj.updateData[key] + 'px';
                break;
              case 'resize':
                byIdDocument.style[key] = dataObj.updateData[key];
                break;
              case 'model':
                let modelValue = '';
                let randomModel = '';
                if (dataObj.updateData[key] !== '') {
                  modelValue = dataObj.updateData[key];
                } else {
                  randomModel = this.getRandomNum();
                  if (randomModel) {
                    modelValue = 'randomValue' + randomModel;
                  }
                }
                byIdDocument.setAttribute('v-model', 'form.' + modelValue);
                byIdDocument.setAttribute('bind-model', modelValue);
                break;
              case  'readModel':
                byIdDocument.setAttribute('read-model', dataObj.updateData[key]);
                break;
              case 'map':
                if (dataObj.updateData[key] === null) {
                  dataObj.updateData[key] = '';
                }
                byIdDocument.setAttribute('mapData', dataObj.updateData[key]);
                break;
              case 'selectOptionList':
                byIdDocument.options.length = 0;
                for (let i = 0; i < dataObj.updateData.selectOptionList.length; i++) {
                  //select选择内容
                  byIdDocument.options.add(new Option(dataObj.updateData.selectOptionList[i], dataObj.updateData.selectOptionList[i]));
                }
                break;
              case 'validator':
                byIdDocument.setAttribute('validator', dataObj.updateData[key]);
                break;
              case 'valueLength':
                byIdDocument.setAttribute('valueLength', dataObj.updateData[key]);
                break;
              case 'capitalize':
                byIdDocument.setAttribute('capitalize', dataObj.updateData[key]);
                break;
            }
          });
        }
        this.showUpdateDrawer(false);
        this.$message.success('已修改当前选中控件！');
      },
      //存储pDrawer的document对象
      savePDrawerDocument(document) {
        this.pDrawerDocument = '';
        this.pDrawerDocument = document;
      },
      //------------------------------------
      //保存并新增模板
      goAddContract(fn) {
        this.$refs.modelForm.validate((valid) => {
          if (!this.editorInstance.hasContents()) {
            this.$message.warning('请输入合同内容！');
            return false;
          }
          if (valid) {
            this.loading = true;
            //
            let data = {
              id: this.getNewId(),
              mbmc: this.contractModelData.modelName,
              mblx: this.contractModelData.modelType,
              createTime: this.getNowTime(),
              createPeople: 'wupeng',
              tk: this.UEditorBaseCodeData.replace(/[\r\n]/g, ''),
              zstk: ``,
              zt: 'kf'
            };
            this.$emit('addContract', data);
            this.$message.success('新增并上传合同模板成功！');
            this.loading = false;
            this.mainDialogVisible(false, '关闭弹框');
            setTimeout(() => {
              if (fn) {
                fn(data);
              }
            }, 200);
          } else {
            this.$message.warning('请输入合同模板基本信息！');
          }
        });
      },
      //保存更新
      goSaveUpdateContract(fn) {
        this.$refs.modelForm.validate((valid) => {
          if (!this.editorInstance.hasContents()) {
            this.$message.warning('请输入合同内容！');
            return false;
          }
          if (valid) {
            this.loading = true;
            //
            let data = {
              id: this.contractModelData.id,
              mbmc: this.contractModelData.modelName,
              mblx: this.contractModelData.modelType,
              createTime: this.getNowTime(),
              createPeople: 'wupeng',
              tk: this.UEditorBaseCodeData.replace(/[\r\n]/g, ''),
              zstk: ``,
              zt: 'kf'
            };
            this.$emit('updateContract', data);
            this.$message.success('保存更新当前数据成功！');
            this.loading = false;
            this.mainDialogVisible(false, '关闭弹框');
            setTimeout(() => {
              if (fn) {
                fn(data);
              }
            }, 1000);
          }
        });
      },
      //-----------------------------------
      //其他按钮
      //打开优化
      yh(data) {
        this.$refs.contractEditorLastRebuild.mainDialogVisible(true, data);
      },
      //打开帮助
      lc() {
        this.$refs.contractEditorHelpStep.mainDialogVisible(true);
      },
      //---------------------
      //通用 取6位随机数
      getRandomNum() {
        let random = Math.floor(Math.random() * 1000000);
        //强制获取6位数
        if (random < 100000 || random >= 1000000) {
          this.getRandomNum();
        } else {
          return random;
        }
      },
      getNowTime() {
        let date = new Date();
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        let hours = date.getHours().toString().padStart(2, '0');
        let minutes = date.getMinutes().toString().padStart(2, '0');
        let seconds = date.getSeconds().toString().padStart(2, '0');
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
      },
      getNewId() {
        return this.getRandomNum().toString() + this.getRandomNum().toString();
      }
    }
  };
</script>

<style lang="scss" scoped>
  /deep/ .main-editor-body {
    position: relative;
    overflow: hidden;

    .other-components {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 150px;
      height: auto;
      z-index: 99999999;

      .el-button {
        margin: 5px 0;
      }
    }

    .vue-ueditor {
      .UEditorBody {
        height: 100% !important;

        > div:nth-child(1) {
          height: 100% !important;
        }
      }

      .edui-state-hover {
        .edui-button-wrap {
          background-color: transparent !important;
        }
      }

      .edui-editor {
        height: 100% !important;
        background-color: #eeeeee !important;

        .edui-editor-toolbarbox {
          box-shadow: none;
        }

        .edui-editor-toolbarboxouter {
          background-image: linear-gradient(to bottom, #ffffff, #ffffff);
          border: none;
        }

        .edui-editor-iframeholder {
          height: calc(100% - 100px) !important;
          width: 660px !important;
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
          padding: 30px 60px 30px;
          margin: 20px auto;

          iframe {
            i, em {
              background-color: #ccc;
              width: 20px;
              height: 20px;
            }
          }
        }

        .edui-editor-bottomContainer {
          background-color: #fff !important;
        }
      }
    }

    .other-button {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 100px;
      height: auto;
      z-index: 99999999;

      .el-button {
        width: 100%;
        margin: 5px 0;
      }
    }
  }
</style>
