<template>
  <div class="contract-editor-step-operation full-height" v-loading="modelLoading"
       :element-loading-text="modelLoadingText">
    <el-drawer
      class="left-bar full-height"
      title="锚点"
      :visible.sync="leftBarDrawerShow"
      size="350px"
      direction="ltr">
      <h3 class="h3-title">
        <i class="el-icon-collection-tag"></i>自定义锚点
      </h3>
      <transition-group name="list-complete" tag="ul">
        <li v-for="(item, index) in anchorList" :key="item.id">
          <el-row>
            <el-col :span="6" class="anchor-link"><i class="el-icon-collection"></i> <span>{{index + 1}}</span>
            </el-col>
            <el-col :span="18" class="go-anchor-link"><span
              @click="jumpAnchorLink(item, 'edit-main-app')">{{item.name}}</span>
            </el-col>
          </el-row>
        </li>
      </transition-group>
    </el-drawer>
    <div class="main-view full-height">
      <component v-if="componentCode && !htmlCode && !warningTips"
                 id="contract-model-view"
                 :is="componentCode" :key="viewKey"
                 :allBaseData="allBaseData"
                 ref="editorVueComponent" @handleClick="handleClick"/>
      <div v-if="htmlCode && !warningTips" class="contract-view" v-html="htmlCode"></div>
      <div v-if="warningTips" class="warning-tips">{{warningTips}}</div>
    </div>
    <div class="left-btn">
      <div class="btn-item">
        <el-badge :value="anchorList.length">
          <el-button @click="showLeftDrawer(true)" type="primary" size="small" icon="el-icon-paperclip">查看锚点</el-button>
        </el-badge>
      </div>
    </div>
    <div class="right-btn">
      <div class="btn-item" v-if="allBaseData.doWhat === 'edit'">
        <el-button @click="save" size="small" type="primary" icon="el-icon-document-add">保存</el-button>
      </div>
      <!--      v-if="allBaseData.doWhat === 'print'"-->
      <div class="btn-item">
        <el-button type="primary" v-print="printPreviewConfig" size="small" icon="el-icon-printer">打印</el-button>
      </div>
      <div class="btn-item">
        <el-popover
          placement="left-start"
          width="400"
          trigger="hover">
          <div class="print-help" style="padding: 15px;">
            <h2>打印提示：</h2>
            <ol>
              <li><span style="color: red;font-weight: bold">许多浏览器供应商认为所有打印规范都是由用户自行决定的</span></li>
              <li>建议点击打印后在<span style="color: red;font-weight: bold">打印的更多设置</span>里<span
                style="color: red;font-weight: bold">关闭页眉页脚</span>选项，<span
                style="color: red;font-weight: bold">打开背景图形选项</span></li>
            </ol>
          </div>
          <el-button type="success" size="small" slot="reference" icon="el-icon-s-opportunity">帮助</el-button>
        </el-popover>
      </div>
    </div>
    <div class="other-slot">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue';
  import contractBaseFunction from '@/mixins/contract-base-function';

  /**
   *  contractEditor-stepOperation
   *  合同模板 步骤操作
   *  by wupeng
   *
   *
   *  methods === saveEditData 保存 return 所有form数据
   *
   *
   *  doWhat === contractView 合同模板查看
   *  doWhat === view 合同查看
   *  doWhat === print 合同查看+打印
   *  doWhat === edit 合同填写
   *  doWhat === edit + tcnr 二次编辑 合同填写
   *
   *  slot === 插槽
   *  props: data //getAll所有数据
   */

  export default {
    name: 'contractEditor-stepOperation',
    mixins: [contractBaseFunction],
    data() {
      return {
        modelLoading: false,
        modelLoadingText: '正在渲染合同模板，请等待。。。',
        //赋值
        componentCode: '',
        htmlCode: '',
        //弹框
        dialogVisible: false,
        //模板基本数据
        allBaseData: {},
        viewKey: 100,
        //左侧锚点
        anchorList: [],
        leftBarDrawerShow: false,
        //打印专用
        printPreviewConfig: {
          id: 'contract-model-view',
          extraCss: './contractPrint.css'
        },
        warningTips: ''
      };
    },
    props: ['data'],
    mounted() {
      if (this.data) {
        this.initContract(this.data);
      }
    },
    methods: {
      //-------------------------------------基本方法
      initContract(baseData) {
        this.modelLoading = true;
        this.componentCode = '';
        this.htmlCode = '';
        this.anchorList = [];
        if (baseData) {
          console.log(baseData);
          if (!baseData.contractTermsBo) {
            this.$notify.error({
              title: '错误',
              message: '丢失合同数据，请联系管理员！'
            });
            this.modelLoadingText = '合同模板渲染出错。原因：丢失合同数据'
            return false;
          }
          switch (baseData.doWhat) {
            case 'contractView':
              this.htmlCode = baseData.contractTermsBo.tk;
              this.getAnchorList(this.htmlCode);
              break;
            case 'view':
            case 'print':
              baseData.readonly = true;
              this.initCode(baseData);
              break;
            case 'edit':
              this.initCode(baseData);
              break;
          }
          this.allBaseData = baseData;
          setTimeout(() => {
            this.modelLoading = false;
          }, 1000);
        }
      },
      //---------------------------------------------------
      initCode(baseData) {
        let zstk = baseData.contractTermsBo.zstk;
        if (zstk) {
          if (zstk.includes('template')) {
            //处理分期
            // zstk = this.convertJjfs(zstk, this.jjfsRegExp, baseData);
            // zstk = this.convertFqxx(zstk, this.fqxxRegExp, baseData);
            //买受人
            // zstk = this.convertMsr(zstk, this.msrRegExp, baseData.buyerList);
            //商品房 存量房 出卖人
            // zstk = this.convertCmr(zstk, this.spfCmrRegExp, baseData.sellerList);
            // zstk = this.convertCmr(zstk, this.clfCmrRegExp, baseData.sellerList);
            //获取锚点
            this.getAnchorList(zstk);
            this.componentCode = Vue.extend(this.getCode(zstk));
          } else {
            this.warningTips = '非Vue代码，无法编译渲染';
          }
        } else {
          this.warningTips = '未获取到代码，无法编译渲染';
        }
      },
      //组织动态组件代码
      getCode(code) {
        const template = this.getTagContent(code, 'template') || '<div></div>';
        const js =
          this.getTagContent(code, 'script').replace(/[^{]*/, '') || '{}';
        let options = {};
        try {
          options = new Function(`return ${js}`)();
        } catch (e) {
          console.log(e, 'e');
        }
        return {
          ...options,
          template
        };
      },
      //检查动态组件代码标签
      getTagContent(code, tag) {
        const startTag = `<${tag}>`;
        const endTag = `</${tag}>`;
        const startIndex = code.indexOf(startTag) + startTag.length;
        const endIndex = code.lastIndexOf(endTag);
        if (startIndex !== -1 && endIndex !== -1) {
          return code.slice(startIndex, endIndex);
        } else {
          return '';
        }
      },
      //---------------------------------------------------
      //触发保存
      save() {
        this.$refs.editorVueComponent.saveContractData();
      },
      //保存数据的方法
      handleClick(option) {
        console.log('回调方法：' + option.operate);
        //操作选项
        switch (option.operate) {
          case 'save':
            if (this.allBaseData.doWhat === 'edit') {
              this.$emit('saveEditData', option.data);
            }
            break;
        }
      },
      //---------------------------------------------------
      //更新注销原因
      updateZxyyData() {
        this.$emit('editorStockCancelSave', {
          htid: this.allModelData.htid,
          zxyy: this.zxyyData.zxyy
        });
      },
      //控制左侧抽屉展示外部方法
      showLeftDrawer(visible) {
        this.leftBarDrawerShow = visible;
      }
    },
    watch: {
      baseData() {
        if (this.baseData !== '') {
          ++this.viewKey;
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  .contract-editor-step-operation {
    position: relative;

    .left-bar {
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

    .main-view {
      background-color: #eeeeee !important;
      border: 1px solid #d4d4d4;
      border-radius: 4px;

      /deep/ .contract-model-view, .contract-view {
        height: calc(100% - 60px);
        width: 660px !important;
        margin: 30px auto;
        background-color: #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
        padding: 30px 60px 30px;
        overflow: auto;

        //滚动条消失
        &::-webkit-scrollbar {
          display: none;
        }

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

    .left-btn {
      position: absolute;
      left: 0;
      bottom: 0;
      height: auto;

      .btn-item {
        margin-bottom: 10px;
      }
    }

    .right-btn {
      position: absolute;
      right: 0;
      bottom: 0;
      height: auto;

      .btn-item {
        margin-bottom: 10px;
      }
    }

    .other-slot {
      position: absolute;
      right: 0;
      top: 0;
    }
  }

</style>
