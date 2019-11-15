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
  import validator from '@/utils/validate';
  //-----------------
  import contractEditorLeftBar from './contractEditor-leftBar';
  import contractEditorRightBar from './contractEditor-rightBar';

  export default {
    name: "contractEditor-main",
    props: {},
    data() {
      return {
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
      this.UEditorConfig = CONFIG.UEditorMainConfig;
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
        let _this = this;
        //编辑器内容变动后自动关闭右侧修改栏
        editorInstance.addListener('contentChange', function (eObj) {
          _this.$refs.contractEditorRightBar.updateDrawerVisible(true);
          if (_this.contractAnchorLinkList.length > 0) {
            for (let i = 0; i < _this.contractAnchorLinkList.length; i++) {
              if (!editorInstance.getContent().includes(_this.contractAnchorLinkList[i].id)) {
                _this.contractAnchorLinkList.splice(i, 1);
              }
            }
          }
        });
      },
      //UEditor初始化加入几大按钮
      UEditorAddCustomButton(editorId) {
        let _this = this;
        window.UE.registerUI('addInputBtn addSelectBtn addTextareaBtn addCrrListBtn addMsrListBtn', function (editor, uiName) {
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
                onclick: function () {
                  // 这里可以不用执行命令，做你自己的操作也可
                  let randomId = _this.getRandomNum();
                  let randomModel = _this.getRandomNum();
                  if (randomId && randomModel) {
                    let ids = 'I' + randomId;
                    let models = 'form.randomValue' + randomModel;
                    editor.execCommand('inserthtml', `<input type="text" class="UEditorInput" id="${ids}" v-model="${models}" bind-model="" read-model="" style="width: 50px;height: 20px" placeholder="" validator="" valueLength="20" />`);
                    _this.$message.success('成功添加了一个Input控件！');
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
                onclick: function () {
                  // 这里可以不用执行命令，做你自己的操作也可
                  let randomId = _this.getRandomNum();
                  let randomModel = _this.getRandomNum();
                  if (randomId && randomModel) {
                    let ids = 'S' + randomId;
                    let models = 'form.randomValue' + randomModel;
                    editor.execCommand('inserthtml', `<select class="UEditorSelect" id="${ids}" v-model="${models}" bind-model="" read-model="" style="width: 100px;height: 26px"></select>`);
                    _this.$message.success('成功添加了一个Select控件！');
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
                onclick: function () {
                  // 这里可以不用执行命令，做你自己的操作也可
                  let randomId = _this.getRandomNum();
                  let randomModel = _this.getRandomNum();
                  if (randomId && randomModel) {
                    let ids = 'T' + randomId;
                    let models = 'form.randomValue' + randomModel;
                    editor.execCommand('inserthtml', `<textarea class="UEditorTextarea" id="${ids}" v-model="${models}" bind-model="" read-model="" style="width: 200px;height: 50px;resize: both;display: block" placeholder="" validator="" valueLength="200"></textarea>`);
                    _this.$message.success('成功添加了一个Textarea控件！');
                  }
                }
              });
              break;
            case 'addCrrListBtn':
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个出卖人列表控件',
                className: 'crrListBtn',
                // 点击时执行的命令
                onclick: function () {
                  if (_this.UEditorInitMsg.includes('*****出卖人列表开始')) {
                    _this.$message.warning('您已经添加了一个出卖人列表控件，无法重复添加！');
                    return false;
                  }
                  // 这里可以不用执行命令，做你自己的操作也可
                  editor.execCommand('inserthtml', `<p><label cmrListStart>*****出卖人列表开始*****</label></p>
<p>《《《请在当前行插入出卖人信息》》》</p>
<p><label cmrListEnd>*****出卖人列表结束*****</label></p>`);
                    _this.$message.success('成功添加出卖人列表控件！');
                }
              });
              break;
            case 'addMsrListBtn':
              btn = new window.UE.ui.Button({
                // 按钮的名字
                name: uiName,
                // 提示
                title: '在指针处添加一个买受人列表控件',
                className: 'msrListBtn',
                // 点击时执行的命令
                onclick: function () {
                  if (_this.UEditorInitMsg.includes('*****买受人列表开始')) {
                    _this.$message.warning('您已经添加了一个出卖人列表，无法重复添加！');
                    return false;
                  }
                  // 这里可以不用执行命令，做你自己的操作也可
                  editor.execCommand('inserthtml', `<p><label msrListStart>*****买受人列表开始*****</label></p>
<p>《《《请在当前行插入买受人信息》》》</p>
<p><label msrListEnd>*****买受人列表结束*****</label></p>`);
                    _this.$message.success('成功添加买受人列表控件！');
                }
              });
              break;
          }
          // 当点到编辑内容上时，按钮要做的状态反射
          editor.addListener('selectionchange', function () {
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
        let _this = this;
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
        //双击触发修改事件
        this.frame.addEventListener("dblclick", function (eObj) {
          //获取选定的dom
          let node = eObj.srcElement || eObj.target;
          let nodeDom = _this.frame.document.getElementById(node.id);
          //判断是否是dom元素
          if (nodeDom) {
            switch (node.nodeName.toLowerCase()) {
              case 'input':
                _this.openUpdateDrawer('inputDrawer', {
                  id: node.id,
                  type: node.type,
                  className: node.className,
                  width: node.style.width,
                  height: node.style.height,
                  model: nodeDom.getAttribute('v-model'),
                  readModel: nodeDom.getAttribute('read-model'),
                  placeholder: node.placeholder,
                  validator: nodeDom.getAttribute('validator'),
                  valueLength: nodeDom.getAttribute('valueLength')
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
                _this.openUpdateDrawer('selectDrawer', {
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
                _this.oldOptionList = optionList;
                break;
              case 'textarea':
                _this.openUpdateDrawer('textareaDrawer', {
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
              _this.$refs.contractEditorRightBar.updateDrawerVisible(false);
              return false;
            }
            let isAnchorLink = false;
            //判断是否存在锚点链接
            if (parentNode.getElementsByTagName('label').length > 0) {
              isAnchorLink = true;
              _this.openUpdateDrawer('pDrawer', {
                isPId: true,
                outerHTML: parentNode.outerHTML,
                innerText: parentNode.innerText,
                isAnchorLink: isAnchorLink,
                anchorLinkId: parentNode.getElementsByTagName('label')[0].id
              });
            } else {
              _this.openUpdateDrawer('pDrawer', {
                isPId: true,
                outerHTML: parentNode.outerHTML,
                innerText: parentNode.innerText,
                isAnchorLink: isAnchorLink
              });
            }
            _this.savePDrawerDocument(parentNode);
          }
        });
      },
      //------------------------------------
      //打开双击修改的抽屉
      openUpdateDrawer(drawerType, drawerInitData) {
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
        let _this = this;
        let byIdDocument = this.frame.document.getElementById(dataObj.updateData.id);
        if (dataObj.updateData) {
          //统一更新
          Object.getOwnPropertyNames(dataObj.updateData).forEach(function (key) {
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
                  randomModel = _this.getRandomNum();
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
        this.$refs.contractEditorPreview.initContractPreviewDialog(visible, {
          tk: this.UEditorInitMsg
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
  /deep/ .el-dialog__header{
    background: none;
    padding: 20px 20px 10px;
    text-align: left;
  }
  /deep/ .el-dialog__title{
    color: #303133;
  }
  /deep/ .el-dialog__headerbtn{
    top: 20px;
    .el-dialog__close{
      color: #909399;
    }
  }
</style>
