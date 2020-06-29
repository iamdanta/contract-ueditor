<template>
  <el-dialog :title="editorDialogTitle" :visible.sync="editorDialogVisible" :show-close="false"
             :close-on-press-escape="false"
             :close-on-click-modal="false" :fullscreen="true" destroy-on-close class="contractEditorDialog full-height">
    <el-row :gutter="20" class="contractEditorRow full-height" v-loading.fullscreen.lock="loading"
            element-loading-text="拼命加载中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)">
      <el-col :span="4" class="leftBar full-height">
        <contractEditorLeftBar ref="contractEditorLeftBar" :frame="frame" :contractModelData="contractModelData"
                               :contractAnchorLinkList="contractAnchorLinkList"></contractEditorLeftBar>
      </el-col>
      <el-col :span="15" class="centerBar full-height">
        <vue-ueditor-wrap class="UEditorBody full-height" v-model="UEditorInitMsg" :config="UEditorConfig"
                          @ready="UEditorReady"
                          @beforeInit="UEditorAddCustomButton"></vue-ueditor-wrap>
      </el-col>
      <el-col :span="5" class="rightBar full-height">
        <contractEditorRightBar ref="contractEditorRightBar"
                                @updateDrawerData="updateDrawerData"></contractEditorRightBar>
      </el-col>
    </el-row>
    <div class="contractEditorFooter">
      <el-form class="contractEditorFooterForm" :model="contractModelData" ref="modelForm" :inline="true">
        <el-form-item prop="modelName" :rules="[validator.required]">
          <el-input class="contractEditorFooterFormInput" size="small" v-model="contractModelData.modelName"
                    placeholder="请输入模板名称"
                    :disabled="contractModelSaved" clearable></el-input>
        </el-form-item>
        <el-form-item prop="modelType" :rules="[validator.required]">
          <dictionary-select v-model="contractModelData.modelType" type="模板类型" placeholder="请选择模板类型" clearable
                             :disabled="contractModelSaved"></dictionary-select>
        </el-form-item>
        <el-button type="primary" @click="saveModelMsg()" size="small" :disabled="contractModelSaved">保存名称和类型<i
          class="el-icon-s-claim el-icon--right"></i></el-button>
        <el-button type="primary" size="small" @click="openContractEditorPreview(true)">预览<i
          class="el-icon-view el-icon--right"></i></el-button>
        <el-button v-show="!isEditContract" type="primary" size="small" @click="goAddContract()">保存并新增合同模板<i
          class="el-icon-document-add el-icon--right"></i></el-button>
        <el-button v-show="isEditContract" type="primary" size="small" @click="goAddContract()">保存编辑后的合同模板<i
          class="el-icon-document-add el-icon--right"></i></el-button>
        <el-button size="small" @click="mainDialogVisible(false)">取 消<i class="el-icon-close el-icon--right"></i>
        </el-button>
      </el-form>
      <contractEditor-preview ref="contractEditorPreview"></contractEditor-preview>
    </div>
  </el-dialog>
</template>

<script>
  import CONFIG from '@/config/config';
  //-----------------vue 和 UEditor的集合体
  import VueUeditorWrap from 'vue-ueditor-wrap'
  //-----------------
  //接口
  import validator from '@/utils/validate';
  //-----------------
  import contractEditorLeftBar from './contractEditor-leftBar';
  import contractEditorRightBar from './contractEditor-rightBar';

  export default {
    name: "contractEditor-main",
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
        //------------------------------
        //UE主弹框数据
        editorDialogVisible: false,
        editorDialogTitle: '',
        //------------------------------
        //编辑器内部iframe指向的window
        frame: '',
        //----------------------------------
        //编辑器
        UEditorInitMsg: ``
      }
    },
    components: {
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
    methods: {
      //退出或打开主弹框
      mainDialogVisible(visible, data) {
        let cleanEditor = () => {
          //清空文档
          this.UEditorInitMsg = '';
          //清空基本数据
          this.contractModelData = {};
          this.contractModelSaved = false;
          //清空锚点
          this.contractAnchorLinkList = [];
          //编辑状态为false
          this.isEditContract = false;
          //弹框显示
          this.editorDialogVisible = visible;
          this.$emit('getList');
        };
        if (!visible && data === '关闭弹框') {
          cleanEditor();
          return false;
        }
        if (!visible) {
          this.$confirm('退出不会保存您的内容, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            cleanEditor();
          });
        } else {
          this.editorDialogVisible = visible;
          this.UEditorInitMsg = '';
          this.contractModelData = {};
          this.contractModelSaved = false;
          this.contractAnchorLinkList = [];
          this.isEditContract = false;
          this.editorDialogTitle = '新增合同模板';
        }
        //如果有data则是编辑状态
        if (data) {
          this.UEditorInitMsg = data.tk;
          this.editorDialogTitle = '编辑 ' + data.mbmc + ' 合同模板';
          this.contractModelData.modelName = data.mbmc;
          this.contractModelData.modelType = data.mblx;
          this.contractModelData.id = data.id;
          this.contractModelSaved = true;
          this.isEditContract = true;
        }
      },
      //------------------------------------
      //UEditor初始化
      UEditorReady(editorInstance) {
        //编辑器实例editorInstance
        this.editorInstance = editorInstance;
        //控件双击事件初始化
        this.UEditorInitBtnDoubleClick();
        //编辑器内容变动后自动关闭右侧修改栏
        editorInstance.addListener('contentChange', () => {
          this.$refs.contractEditorRightBar.updateDrawerVisible(true);
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
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个分期信息展示区域控件',
                className: 'fqxxBtn',
                // 点击时执行的命令
                onclick: () => {
                  if (this.UEditorInitMsg.includes('分期信息展示区域开始*****')) {
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
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个商品房流程出卖人信息展示区域控件',
                className: 'spfCmrBtn',
                // 点击时执行的命令
                onclick: () => {
                  if (this.UEditorInitMsg.includes('商品房流程-出卖人信息展示区域开始*****')) {
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
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个存量房流程出卖人信息展示区域控件',
                className: 'clfCmrBtn',
                // 点击时执行的命令
                onclick: () => {
                  if (this.UEditorInitMsg.includes('存量房流程-出卖人信息展示区域开始*****')) {
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
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个买受人信息展示区域控件',
                className: 'msrBtn',
                // 点击时执行的命令
                onclick: () => {
                  if (this.UEditorInitMsg.includes('买受人信息展示区域开始*****')) {
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
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个计价方式信息展示区域控件',
                className: 'jjfsBtn',
                // 点击时执行的命令
                onclick: () => {
                  if (this.UEditorInitMsg.includes('计价方式信息展示区域开始*****')) {
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
              btn.setChecked(false)
            } else {
              btn.setDisabled(false);
              btn.setChecked(state)
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
        this.frame.document.styleSheets[0].insertRule('body::-webkit-scrollbar-track-piece { background: #d3dce6 }', 0);
        this.frame.document.styleSheets[0].insertRule('body::-webkit-scrollbar { width: 1px }', 0);
        this.frame.document.styleSheets[0].insertRule('body::-webkit-scrollbar-thumb { background: #99a9bf }', 0);
        //双击触发修改事件
        this.frame.addEventListener("dblclick", (eObj) => {
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
                return parent
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
      //------------------------------------
      //打开双击修改的抽屉
      openUpdateDrawer(drawerType, drawerInitData) {
        console.log(drawerInitData);
        this.$refs.contractEditorRightBar.openUpdateDrawer(false, drawerType, drawerInitData);
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
                  modelValue = dataObj.updateData[key]
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
        this.$message.success('已修改当前选中控件！');
      },
      //存储pDrawer的document对象
      savePDrawerDocument(document) {
        this.pDrawerDocument = '';
        this.pDrawerDocument = document;
      },
      //------------------------------------
      //打开预览
      openContractEditorPreview(visible) {
        if (!this.editorInstance.hasContents()) {
          this.$message.warning('请输入合同内容！');
          return false;
        }
        let contractTermsBo = {
          tk: this.UEditorInitMsg
        };
        this.$refs.contractEditorPreview.initContractPreviewDialog(visible, {
          contractTermsBo
        }, 'contractView');
      },
      //----
      //保存模板基本信息
      saveModelMsg() {
        this.$refs.modelForm.validate((valid) => {
          if (valid && !this.contractModelSaved) {
            this.contractModelSaved = true;
            this.$message.success('保存模板基本信息成功！');
          }
        });
      },
      //保存并新增模板
      goAddContract() {
        this.$refs.modelForm.validate((valid) => {
          if (!this.editorInstance.hasContents()) {
            this.$message.warning('请输入合同内容！');
            return false;
          }
          if (valid && this.contractModelSaved) {
            this.loading = true;
            alert('保存')
          } else {
            this.$message.warning('请输入合同模板基本信息！');
          }
        });
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
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
