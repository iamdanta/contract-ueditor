<template>
  <div class="contract-edit full-height" v-loading="modelLoading" :element-loading-text="modelLoadingText">
    <el-row class="full-height" :gutter="20">
      <el-col :span="4" class="edit-left full-height">
        <h3 class="h3-title">
          <i class="el-icon-collection-tag"></i>自定义锚点
        </h3>
        <transition-group name="list-complete" tag="ul">
          <li v-for="(item, index) in anchorList" :key="item.id">
            <el-row>
              <el-col :span="6" class="anchor-link"><i class="el-icon-collection"></i> <span>{{index + 1}}</span>
              </el-col>
              <el-col :span="18" class="go-anchor-link"><span @click="jumpAnchorLink(item, 'edit-main-app')">{{item.name}}</span>
              </el-col>
            </el-row>
          </li>
        </transition-group>
      </el-col>
      <el-col :span="15" class="edit-center full-height">
        <div class="center-form full-height">
          <editMainApp
            :key="viewKey"
            :allModelData="allModelData"
            :viewData="viewData"
            class="edit-main scrollbar-default"
            @saveContractData="saveContractData"
            id="edit-main-app"
            :selectOption="selectOption"
          ></editMainApp>
        </div>
      </el-col>
      <el-col :span="5" class="edit-right full-height"></el-col>
    </el-row>
  </div>
</template>

<script>
  import {companyInfo} from '@/utils/auth';
  import validator from '@/utils/validate';
  import contractBaseFunction from '@/mixins/contract-base-function';

  /**
   *  contractEditor-stepEdit
   *  合同模板 编辑
   *  by wupeng
   *
   *
   *  editDialogVisible 弹框显示方法
   *  ---doWhat : newEdit
   *
   *  editorEditContract 放出的保存方法
   *  ---return form数据
   *
   * props: allEditData //getAll所有数据
   */

  export default {
    name: 'contractEditor-stepEdit',
    mixins: [contractBaseFunction],
    data() {
      return {
        modelLoading: false,
        modelLoadingText: '正在渲染合同模板，请等待。。。',
        //赋值
        viewData: '',
        //弹框
        dialogVisible: false,
        //模板基本数据
        allModelData: {},
        viewKey: 100,
        //左侧锚点
        anchorList: [],
        selectOption: {},
        //-----------------------------正则
      };
    },
    props: ['allEditData'],
    mounted() {
      if (this.allEditData) {
        this.initContractEdit(this.allEditData);
      }
    },
    methods: {
      //-------------------------------------基本方法
      initContractEdit(viewData) {
        this.modelLoading = true;
        this.viewData = '';
        this.anchorList = [];
        if (viewData) {
          if (!viewData.contractTermsBo) {
            this.$notify.error({
              title: '错误',
              message: '丢失合同数据，请联系管理员！'
            });
            this.modelLoadingText = '合同模板渲染出错。原因：丢失合同数据'
            return false;
          }
          let tk = viewData.contractTermsBo.tk;
          //处理输入框
          tk = this.convertHtml(tk, 'input', this.inputRegExp);
          tk = this.convertHtml(tk, 'select', this.selectRegExp);
          tk = this.convertHtml(tk, 'textarea', this.textareaRegExp);
          //处理分期
          tk = this.convertJjfs(tk, this.jjfsRegExp, viewData);
          tk = this.convertFqxx(tk, this.fqxxRegExp, viewData);
          //买受人
          tk = this.convertMsr(tk, this.msrRegExp, viewData.buyerList);
          //商品房 存量房 出卖人
          tk = this.convertCmr(tk, this.spfCmrRegExp, viewData.sellerList);
          tk = this.convertCmr(tk, this.clfCmrRegExp, viewData.sellerList);
          //绑定页面数据
          tk = tk.replace(/[\r\n]/g, '');
          // console.log(tk);
          //获取锚点
          this.getAnchorList(tk);
          this.viewData = tk;
          this.allModelData = viewData;
          setTimeout(() => {
            this.modelLoading = false;
          }, 2000);
        }
      },
      //保存数据的方法
      saveContractData(data) {
        if (this.allModelData.doWhat === 'newEdit') {
          this.$emit('editorEditContract', data);
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
            form: {
              contract: {},
              housingtranContract: {},
              housingtranHouse: {},
              housingtranObligeeList: {},
              installmentinfoList: {},
              projectManagerInfo: {},
              surveyBuildingBo: {}
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
            `<el-form :model="form" ref="form" class="templateForm">` +
            this.templateData +
            `<el-button class="editSaveBtn" id="edit-save-btn" type="primary" size="medium" @click="saveContractData()">保存已填数据<i class="el-icon-s-claim el-icon--right"></i></el-button></el-form>`;
        },
        mounted() {
          if (this.allModelData.doWhat === 'newEdit' && !this.allModelData.contractTermsBo.tcnr) {
            //赋值操作
            let main = document.getElementById('edit-main-app');
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
                  if (this.allModelData[objValueList[0]]) {
                    // 仅限有值的情况才允许插入避免报错
                    if (this.allModelData[objValueList[0]][objValueList[1]]) {
                      this.$set(
                        this.form,
                        [bindValueList[0]],
                        this.allModelData[objValueList[0]][objValueList[1]]
                      );
                    }
                  }
                }
              }
            }
          } else if (this.allModelData.doWhat === 'newEdit' && this.allModelData.contractTermsBo.tcnr) {
            //不做赋值操作直接拿tcnr绑定
            this.$nextTick(() => {
              this.form = JSON.parse(this.allModelData.contractTermsBo.tcnr);
            });
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
  .contract-edit {

    .edit-left {
      background-color: #fff;
      overflow: auto;
      border: 1px solid #d4d4d4;
      border-radius: 4px;
      padding: 20px;

      .h3-title {
        line-height: 20px;

        .el-icon-collection-tag {
          color: #fff;
          padding: 4px;
          border-radius: 50%;
          background-color: #0e90fe;
          margin-right: 7px;
        }
      }

      ul {
        display: flex;
        flex-direction: column;
        position: relative;

        li {
          transition: all .5s;
          height: 33px;
          margin: 10px 0;
          list-style: none;
          line-height: 30px;
          color: #333333;
          border: 1px solid #d2d2d2;

          .el-row {
            height: 100%;
            width: 100%;

            .el-col {
              height: 100%;
              line-height: 33px;
            }

            .anchor-link {
              background-color: #53B478;

              i {
                margin-left: 5px;
                font-size: 18px;
                color: #fff;
              }

              span {
                color: #fff;
                padding: 0 10px;
              }
            }

            .go-anchor-link {
              cursor: pointer;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;

              span {
                margin-left: 10px;
              }
            }

            .authorDelete {
              text-align: right;

              i {
                cursor: pointer;
                opacity: 0;
                transition: .5s opacity;
              }
            }

            &:hover {
              i {
                opacity: 1;
              }
            }
          }
        }
      }
    }

    .edit-center {
      .center-form {
        background-color: #d7d7d7 !important;
        border: 1px solid #d4d4d4;
        border-radius: 4px;

        /deep/ .edit-main {
          height: calc(100% - 60px);
          width: 660px !important;
          margin: 30px auto;
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
          padding: 30px 60px 30px;
          overflow: auto;

          //通用字符
          .preview-span {
            height: 20px;
            display: inline-block;
            border-bottom: 1px solid #000;
            vertical-align: -8px;
            line-height: 1;
            overflow: hidden;
          }

          //小字体
          .small-text {
            font-size: 14px;
          }
        }
      }

      //保存按钮
      /deep/ .editSaveBtn {
        position: absolute;
        top: 10px;
        right: 10%;
      }
    }

    .edit-right {
      background-color: #fff;
      border: 1px solid #d4d4d4;
      border-radius: 4px;
    }
  }
</style>
