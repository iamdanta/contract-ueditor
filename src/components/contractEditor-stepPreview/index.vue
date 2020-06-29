<template>
  <div class="contract-preview full-height" v-loading="modelLoading" :element-loading-text="modelLoadingText">
    <el-row class="full-height" :gutter="20">
      <el-col :span="4" class="preview-left full-height">
        <h3 class="h3-title">
          <i class="el-icon-collection-tag"></i>自定义锚点
        </h3>
        <transition-group name="list-complete" tag="ul">
          <li v-for="(item, index) in anchorList" :key="item.id">
            <el-row>
              <el-col :span="6" class="anchor-link"><i class="el-icon-collection"></i> <span>{{index + 1}}</span>
              </el-col>
              <el-col :span="18" class="go-anchor-link"><span @click="jumpAnchorLink(item, 'preview-main-app')">{{item.name}}</span>
              </el-col>
            </el-row>
          </li>
        </transition-group>
      </el-col>
      <el-col :span="15" class="preview-center full-height">
        <div class="center-form full-height">
          <previewMainApp
            id="preview-main-app"
            class="preview-main scrollbar-default"
            ref="previewMainApp"
            :key="viewKey"
            :allModelData="allModelData"
            :viewData="viewData"
          ></previewMainApp>
        </div>
      </el-col>
      <el-col :span="5" class="preview-right full-height">
        <div class="preview-right-tips" v-if="allModelData.doWhat === 'print'">
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
        <div v-if="zxyyData.isShow">
          <h2 style="height:40px;margin: 20px 0;line-height: 40px">
            注销原因：
          </h2>
          <el-input
            type="textarea"
            :autosize="{ minRows: 5, maxRows: 5 }"
            placeholder="请输入注销原因"
            v-model="zxyyData.zxyy"
            :disabled="allPreViewData.doWhat === 'cancelView'"
          ></el-input>
          <el-button
            type="primary"
            @click="updateZxyyData()"
            style="position: absolute;top: 0;right: 10px"
            v-if="allPreViewData.doWhat === 'cancelEdit'"
            size="small"
          >修改注销原因
          </el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  /**
   *  contractEditor-stepPreview
   *  合同模板 查看 打印 赋值打印
   *  by wupeng
   *
   *
   *  initContractPreview 初始化方法
   *  ---doWhat : close/contractView/view/print/cancelView/cancelEdit
   *
   *  contractPrint 打印触发方法
   */
  import contractBaseFunction from '@/mixins/contract-base-function';

  export default {
    name: 'contractEditor-stepPreview',
    mixins: [contractBaseFunction],
    data() {
      return {
        modelLoading: false,
        modelLoadingText: '正在渲染合同模板，请等待。。。',
        viewData: '',
        allModelData: {},
        anchorList: [],
        viewKey: 100,
        //打印专用
        printPreviewConfig: {
          id: 'preview-main-app',
          extraCss: './contractPrint.css'
        },
        zxyyData: {
          isShow: false,
          zxyy: ''
        }
      };
    },
    props: ['allPreViewData'],
    mounted() {
      if (this.allPreViewData) {
        this.initContractPreview(this.allPreViewData);
      }
    },
    methods: {
      //-------------------------------------基本方法
      initContractPreview(viewData) {
        this.viewData = '';
        this.anchorList = [];
        this.modelLoading = true;
        //注销信息
        this.zxyyData = {
          isShow: false,
          zxyy: ''
        };
        if (viewData) {
          //处理锚点
          let tk = viewData.contractTermsBo.tk;
          this.getAnchorList(tk);
          switch (viewData.doWhat) {
            case 'contractView':
              this.viewData = tk;
              break;
            case 'view':
            case 'print':
            case 'cancelView':
            case 'cancelEdit':
              if (viewData.doWhat === 'cancelView' || viewData.doWhat === 'cancelEdit') {
                this.zxyyData = {
                  isShow: true,
                  zxyy: viewData.zxyy
                };
              }
              tk = this.convertHtmlToPreview(tk, 'input', this.inputRegExp);
              tk = this.convertHtmlToPreview(tk, 'select', this.selectRegExp);
              tk = this.convertHtmlToPreview(tk, 'textarea', this.textareaRegExp);
              //处理分期
              tk = this.convertJjfs(tk, this.jjfsRegExp, viewData);
              tk = this.convertFqxx(tk, this.fqxxRegExp, viewData);
              //买受人
              tk = this.convertMsr(tk, this.msrRegExp, viewData.buyerList);
              //商品房 存量房 出卖人
              tk = this.convertCmr(tk, this.spfCmrRegExp, viewData.sellerList);
              tk = this.convertCmr(tk, this.clfCmrRegExp, viewData.sellerList);
              this.viewData = tk;
              break;
          }
          this.allModelData = viewData;
          setTimeout(() => {
            this.modelLoading = false;
          }, 2000);
        }
      },
      //打印
      contractPrint() {
        this.$print(this.$refs.previewMainApp);
      },
      //更新注销原因
      updateZxyyData() {
        this.$emit('editorStockCancelSave', {
          htid: this.allModelData.htid,
          zxyy: this.zxyyData.zxyy
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
          //需要延迟进行对数据的处理，数据获取会延迟
          this.$nextTick(() => {
            if (this.allModelData.doWhat !== 'contractView' && this.allModelData.contractTermsBo) {
              if (this.allModelData.contractTermsBo.tcnr) {
                this.form = JSON.parse(this.allModelData.contractTermsBo.tcnr);
              }
            }
          });
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

<style lang="scss" scoped>
  .contract-preview {

    .preview-left {
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

    .preview-center {
      .center-form {
        background-color: #d7d7d7 !important;
        border: 1px solid #d4d4d4;
        border-radius: 4px;

        /deep/ .preview-main {
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
    }

    .preview-right {
      background-color: #fff;
      border: 1px solid #d4d4d4;
      border-radius: 4px;

      .preview-right-tips {
        .printBtn {
          margin: 10px 0 30px;
        }

        li {
          line-height: 20px;
          margin: 20px 20px;
        }
      }
    }
  }
</style>
