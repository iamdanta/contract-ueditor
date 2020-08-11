<template>
  <el-dialog :title="editorDialogTitle" :visible.sync="lastRebuildDialogVisible" :show-close="false"
             :close-on-press-escape="false"
             :close-on-click-modal="false" :fullscreen="true" destroy-on-close append-to-body
             class="contract-last-rebuild-dialog full-height">
    <div class="main-last-rebuild-body full-height">
      <transition-group name="spread-in" mode="out-in">
        <div class="rebuild-body full-height" v-if="!showHistoryCode" key="html-main">
          <div class="code-main full-height scrollbar-default">
            <div class="btn-list">
              <div class="btn-item">
                <el-button @click="codeSave" size="small" type="primary" icon="el-icon-finished">保存并渲染代码</el-button>
                <el-button @click="codeRefresh" size="small" type="primary" icon="el-icon-refresh">格式化代码</el-button>
              </div>
              <div class="btn-item">
                <el-select v-model="currentTheme" size="small" placeholder="主题" style="width: 90px">
                  <el-option
                    v-for="item in themeList"
                    :key="item"
                    :label="item"
                    :value="item">
                  </el-option>
                </el-select>
              </div>
              <div class="btn-item code-list-item">
                <el-popover
                  placement="bottom"
                  title="代码库 (点击代码即可复制)"
                  width="500"
                  trigger="hover">
                  <div class="code-list">
                    <el-table :data="codeList">
                      <el-table-column width="100" property="name" label="名称"></el-table-column>
                      <el-table-column width="200" property="code" label="代码">
                        <template slot-scope="scope">
                          <clipboard-text :text="scope.row.code"></clipboard-text>
                        </template>
                      </el-table-column>
                      <el-table-column property="purpose" label="作用"></el-table-column>
                    </el-table>
                  </div>
                  <el-button slot="reference" type="primary" size="small" icon="el-icon-star-on">代码库</el-button>
                </el-popover>
              </div>
            </div>
            <contract-editor-codemirror ref="editorCodemirror" :code.sync="rebuildData" :theme="currentTheme" />
          </div>
          <div class="html-main full-height">
            <div class="btn-list">
              <div class="btn-item">
                <el-select v-model="currentHistory" size="small" placeholder="请选择历史记录"
                           :disibled="historyList.length > 0">
                  <el-option
                    v-for="(item, index) in historyList"
                    :key="item.id"
                    :label="(index + 1) + '：' + timestampToTime(item.cjsj) + ' 历史记录'"
                    :value="item.zstk">
                  </el-option>
                </el-select>
                <el-button @click="openCodeHistory" size="small" type="primary" icon="el-icon-search"
                           :disibled="historyList.length > 0">对比历史
                </el-button>
              </div>
              <div class="btn-item">
                <el-button type="primary" v-print="printPreviewConfig" size="small" icon="el-icon-printer">打印
                </el-button>
              </div>
            </div>
            <contract-editor-vue-component ref="editorVueComponent" :code="rebuildData"/>
          </div>
        </div>
        <div class="rebuild-body full-height" v-if="showHistoryCode" key="code-history-main">
          <div class="code-history-main full-height">
          <div class="btn-list">
            <div class="btn-item">
              <el-button @click="closeCodeHistory" size="small" type="primary"
                         icon="el-icon-close" :disibled="historyList.length > 0">关闭对比历史并保存
              </el-button>
            </div>
            <div class="btn-item">
              <el-button @click="codeRefreshHistory()" type="primary" size="small" icon="el-icon-refresh">格式化左侧代码</el-button>
            </div>
            <div class="btn-item">
              <span>选择历史记录以对比：</span>
              <el-select v-model="currentHistory" size="small" placeholder="请选择历史记录"
                         :disibled="historyList.length > 0">
                <el-option
                  v-for="(item, index) in historyList"
                  :key="item.id"
                  :label="(index + 1) + '：' + timestampToTime(item.cjsj) + ' 历史记录'"
                  :value="item.zstk">
                </el-option>
              </el-select>
            </div>
          </div>
          <contract-editor-code-mirror-history ref="editorCodemirrorHistory" :code.sync="rebuildData"
                                               :currentHistory="currentHistory"/>
        </div>
        </div>
      </transition-group>
    </div>
    <div class="editor-footer">
      <tips-scroll :tips="tips"/>
      <div class="btn-list">
        <el-button type="primary" size="small" v-if="allData.zt === 'fb'" @click="goHt()" icon="el-icon-refresh-left">
          回退至开发状态
        </el-button>
        <el-button type="primary" size="small" @click="goSaveFb('fb')" icon="el-icon-document-add">保存发布
        </el-button>
        <el-button size="small" @click="mainDialogVisible(false)" icon="el-icon-close">退 出
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  // 最后一步的优化
  import ContractEditorCodemirror from "./contractEditor-codemirror";
  import ContractEditorVueComponent from "./contractEditor-vueComponent";
  import contractBaseFunction from '@/mixins/contract-base-function';
  import TipsScroll from "./components/tips-scroll";
  import ContractEditorCodeMirrorHistory from "./contractEditor-codemirror-history";

  export default {
    name: "contractEditor-lastRebuild",
    components: {ContractEditorCodeMirrorHistory, TipsScroll, ContractEditorVueComponent, ContractEditorCodemirror},
    mixins: [contractBaseFunction],
    data() {
      return {
        lastRebuildDialogVisible: false,
        editorDialogTitle: '合同模板-发布阶段',
        //代码
        rebuildData: '',
        //模板信息
        allData: {},
        //提示帮助
        tips: [
          '1：请点击保存并渲染才能看到页面效果',
          '2：编辑代码时使用快捷键ctrl进行代码补全',
          '3：用对比历史代码来进行更新合并操作',
          '4：回退至开发状态去使用UEditor进行布局操作',
          '5：发布状态会自动转换开发状态的输入框控件',
          '6：只有发布状态才能使用合同模板哦',
          '7：有问题请联系前端，多看看控制台报错'
        ],
        //历史记录
        showHistoryCode: false,
        currentHistory: '',
        historyList: [],
        //代码库
        codeList: [
          {
            name: '打印分页',
            code: '<div class="fy" style="page-break-after: always;" title="打印分页"> </div>',
            purpose: '打印会自动执行分页效果'
          }
        ],
        //打印专用
        printPreviewConfig: {
          id: 'contract-model-view-form',
          extraCss: './contractPrint.css'
        },
        //主题
        currentTheme: 'default',
        themeList: [
          'default',
          'abcdef',
          'ayu-mirage',
          'base16-dark',
          'base16-light',
          'blackboard',
          'dracula',
          'gruvbox-dark',
          'isotope',
          'mbo',
          'panda-syntax',
          'paraiso-light',
        ]
      }
    },
    mounted() {
      // this.onError();
    },
    methods: {
      mainDialogVisible(visible, allData) {
        if (!visible) {
          if (allData === '直接关闭弹框') {
            this.showHistoryCode = false;
            this.currentHistory = '';
            this.rebuildData = '';
            this.currentTheme = 'default';
            this.lastRebuildDialogVisible = false;
            this.$emit('getList');
            return false;
          } else {
            this.$confirm('退出不会保存您的内容, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.showHistoryCode = false;
              this.currentHistory = '';
              this.rebuildData = '';
              this.currentTheme = 'default';
              this.lastRebuildDialogVisible = false;
              this.$emit('getList');
              return false;
            });
          }
        } else {
          this.showHistoryCode = false;
          this.currentHistory = '';
          this.rebuildData = '';
          this.currentTheme = 'default';
          this.lastRebuildDialogVisible = true;
        }
        if (allData) {
          this.editorDialogTitle = '编辑 ' + allData.mbmc + ' 合同模板-发布状态';
          console.log(allData);
          this.allData = JSON.parse(JSON.stringify(allData));
          this.queryHistoryList();
          if (allData.zt === 'kf') {
            let trueData = JSON.parse(JSON.stringify(allData.tk));
            if (!trueData.includes('<template>')) {
              this.$confirm('检测到本代码是原生html，为了更好的还原文档，当前发布状态会转为vue代码进行开发编译，请确认', '提示', {
                confirmButtonText: '好的，帮我转vue编码开发',
                cancelButtonText: '对不起，我不想转',
                type: 'warning'
              }).then(() => {
                this.initCode(trueData);
              }).catch((err) => {
                if (err !== 'cancel') {
                  console.log(err);
                  this.$message({
                    type: 'warning',
                    message: '生成vue代码发生错误，请联系前端!'
                  });
                }
                this.mainDialogVisible(false, '直接退出弹框');
              });
            } else {
              this.rebuildData = trueData;
            }
          } else if (allData.zt === 'fb') {
            this.rebuildData = allData.zstk;
            setTimeout(() => {
              this.$refs.editorCodemirror.refresh();
            }, 500);
          }
        }
      },
      initCode(data) {
        //处理输入框
        data = this.convertHtml(data, 'input', this.inputRegExp);
        data = this.convertHtml(data, 'select', this.selectRegExp);
        data = this.convertHtml(data, 'textarea', this.textareaRegExp);
        this.rebuildData = `<template>
                              <div class="contract-model-view" :style="viewStyle">
                              <el-form :model="form" ref="form" class="templateForm" id="contract-model-view-form">
                            ${data}
                            </el-form></div>
                            </template>
                            <script>
                              export default {
                                props: ['allBaseData'],
                                data() {
                                  return {
                                    // 控件输入绑定 禁止删除
                                    form: {
                                      contract: {},
                                      housingtranContract: {},
                                      housingtranHouse: {},
                                      housingtranObligeeList: {},
                                      installmentinfoList: {},
                                      projectManagerInfo: {},
                                      surveyBuildingBo: {}
                                    },
                                    // 框内样式插入
                                    viewStyle: {
                                      fontFamily: 'none', //去掉element样式
                                      fontSize: '16px', //默认字体大小
                                      color: 'black',
                                      padding: '15px', //模拟页间距。非实际页间距
                                      lineHeight: '30px' //默认行高
                                    }
                                  }
                                },
                                mounted() {
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
                                              if (this.allBaseData[objValueList[0]]) {
                                                // 仅限有值的情况才允许插入避免报错
                                                if (this.allBaseData[objValueList[0]][objValueList[1]]) {
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
                                      } else if (this.allBaseData.doWhat === 'edit' && this.allBaseData.contractTermsBo.tcnr) {
                                        //不做赋值操作直接拿tcnr绑定
                                        this.$nextTick(() => {
                                          this.form = JSON.parse(this.allBaseData.contractTermsBo.tcnr);
                                        });
                                      }
                                  }
                                },
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
                                        });
                                      } else {
                                        //验证未通过
                                        this.$message.warning('请完善表单！');
                                        return false;
                                      }
                                    });
                                  }
                                }
                              }
                              ` +
          '<\/script>';
        setTimeout(() => {
          this.$refs.editorCodemirror.refresh();
        }, 500);
        this.$message({
          type: 'success',
          message: '已自动转为vue代码!'
        });
      },
      onError() {
        onerror = (msg) => {
          alert(msg);
        }
      },
      //点击代码保存
      codeSave() {
        this.$refs.editorCodemirror.save();
      },
      //点击代码格式化
      codeRefresh() {
        this.$refs.editorCodemirror.refresh();
      },
      //点击左侧代码格式化
      codeRefreshHistory() {
        this.$refs.editorCodemirrorHistory.refresh();
      },
      //打开比对
      openCodeHistory() {
        if (this.currentHistory) {
          this.showHistoryCode = true;
        } else {
          this.$message.warning('请选择历史记录');
        }
      },
      //关闭比对
      closeCodeHistory() {
        this.showHistoryCode = false;
        this.currentHistory = '';
        //触发保存
        this.$refs.editorCodemirrorHistory.save();
      },
      goHt() {
        this.$confirm('请确认是否回退至开发状态？', '提示', {
          confirmButtonText: '确定转为开发状态',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$confirm('是否保存当前发布状态数据？', '提示', {
            confirmButtonText: '确定保存发布数据',
            cancelButtonText: '不保存发布数据',
            type: 'warning'
          }).then(() => {
            //执行保存方法并回退到开发
            this.goSaveFb('kf', this.goReturnKf());
          }).catch(data => {
            if (data === 'cancel') {
              //不执行保存方法并回退到开发
              this.goReturnKf();
            }
          });
        });
      },
      // 查询历史记录
      queryHistoryList() {
        if (this.allData.historyList) {
          this.historyList = this.allData.historyList;
        }
      },
      // 回退
      goReturnKf(data) {
        data.historyList.push({
          id: this.getRandomNum.toString() + this.getRandomNum().toString(),
          cjsj: Date.parse(new Date()),
          zstk: this.rebuildData
        });
        this.$emit('update', data);
        this.$message.success('回退至开发状态成功');
        this.mainDialogVisible(false, '直接关闭弹框');
      },
      // 保存
      goSaveFb(zt, fn) {
        // 先同步最新代码
        this.codeSave();
        let data = {
          ...this.allData,
          zstk: this.rebuildData,
          zt: zt
        };
        if (fn) {
          this.$message.success('保存发布模式数据成功');
          fn(data);
        } else {
          this.$emit('update', data);
          console.log(data);
          this.$message.success('保存发布模式数据成功');
          this.mainDialogVisible(false, '直接关闭弹框');
        }
      },
      timestampToTime(timestamp) {
        let strDate;
        let date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        let Y = date.getFullYear() + '-';
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
        let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        let s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
        strDate = Y + M + D + h + m + s;
        return strDate;
      },
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
    }
  }
</script>

<style scoped lang="scss">
  .main-last-rebuild-body {
    overflow: hidden;

    .rebuild-body {
      display: flex;

      // 按钮组
      .btn-list {
        display: flex;
        height: 50px;
        line-height: 50px;
        position: relative;
        border-bottom: 1px solid #eeeeee;

        .btn-item {
          margin-left: 20px;
        }

        .code-list-item {
          position: absolute;
          right: 20px;
        }
      }

      .code-main {
        width: calc(100% - 660px - 35px);
        background-color: #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
        border-radius: 5px;

        .contract-editor-code-mirror {
          height: calc(100% - 50px);
        }
      }

      .html-main {
        width: 660px;
        background-color: #fff;
        margin-left: 35px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
        border-radius: 5px;

        .contract-model-view {
          height: calc(100% - 50px);
        }
      }

      .code-history-main {
        width: 100%;
        background-color: #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
        border-radius: 5px;

        .codemirror-history {
          height: calc(100% - 50px);
        }
      }
    }

  }
</style>
