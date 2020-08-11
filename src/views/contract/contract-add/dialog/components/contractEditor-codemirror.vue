<template>
  <div class="contract-editor-code-mirror full-height">
    <codemirror ref="myCode" v-model="codeData" :options="options" @ready="onCmReady"
                class="scrollbar-default"></codemirror>
  </div>
</template>

<script>
  import {codemirror} from 'vue-codemirror';
  import './formatting';
  import 'codemirror/lib/codemirror.css';
  //主题
  import 'codemirror/theme/abcdef.css';
  import 'codemirror/theme/ayu-mirage.css';
  import 'codemirror/theme/base16-dark.css';
  import 'codemirror/theme/base16-light.css';
  import 'codemirror/theme/blackboard.css';
  import 'codemirror/theme/dracula.css';
  import 'codemirror/theme/gruvbox-dark.css';
  import 'codemirror/theme/isotope.css';
  import 'codemirror/theme/mbo.css';
  import 'codemirror/theme/panda-syntax.css';
  import 'codemirror/theme/paraiso-light.css';
  //语法
  import 'codemirror/mode/javascript/javascript.js';
  import 'codemirror/mode/css/css.js';
  import 'codemirror/mode/xml/xml.js'
  import 'codemirror/mode/vue/vue.js';
  //自动更新
  import 'codemirror/addon/display/autorefresh';
  //代码补全提示
  import 'codemirror/addon/hint/show-hint.css';
  import 'codemirror/addon/hint/show-hint.js';
  import 'codemirror/addon/hint/anyword-hint.js';
  import 'codemirror/addon/hint/css-hint.js';
  import 'codemirror/addon/hint/html-hint.js';
  import 'codemirror/addon/hint/javascript-hint.js';

  //滚动条
  //scrollbarStyle: "simple"
  import 'codemirror/addon/scroll/simplescrollbars.js';
  import 'codemirror/addon/scroll/simplescrollbars.css';

  export default {
    name: "contractEditor-codeMirror",
    components: {
      codemirror
    },
    props: ['code', 'readonly', 'theme'],
    data() {
      return {
        codeData: this.code,
        options: {
          mode: "text/x-vue", //以什么格式进行代码高亮
          // theme: "base16-light",// ambiance, foo bar, darcula //配置编辑器的主题样式
          smartIndent: true, // 自动缩进
          tabSize: 4, //tab字符的宽度
          lineNumbers: true, // 是否显示行
          firstLineNumber: 1, //第一行的行号
          showCursorWhenSelecting: true, // 在选择时是否显示光标
          readOnly: false, //是否只读,不能获取焦点
          line: true,
          autoRefresh: true,
          extraKeys: {"Ctrl": "autocomplete"},
          modes: [{
            value: 'css',
            label: 'CSS'
          }, {
            value: 'javascript',
            label: 'Javascript'
          }, {
            value: 'html',
            label: 'XML/HTML'
          }],
          //滚动条样式
          scrollbarStyle: "simple"
        }
      }
    },
    mounted() {
      this.refresh();
      // 控制只读
      if (this.readonly) {
        this.codemirror.options.readOnly = true;
      }
    },
    watch: {
      code(val) {
        this.codeData = val;
      },
      theme(val) {
        if (val) {
          this.codemirror.setOption('theme', val);
          this.codemirror.refresh();
          this.$message.success('更换主题成功！');
        }
      }
    },
    computed: {
      codemirror() {
        return this.$refs.myCode.codemirror;
      }
    },
    methods: {
      onCmReady() {
      },
      save() {
        this.$emit('update:code', this.codeData);
      },
      refresh() {
        let totalLines = this.codemirror.lineCount();
        this.codemirror.autoFormatRange({line: 0, ch: 0}, {line: totalLines});
      }
    }
  }
</script>

<style scoped lang="scss">
  .contract-editor-code-mirror {
    width: 100%;

    .vue-codemirror {
      width: 100%;
      height: 100%;

      /deep/ .CodeMirror {
        width: 100%;
        height: 100%;
        border: 1px solid #eee;
        border-top: none;

        .CodeMirror-scroll {
          height: 100%;

          .CodeMirror-sizer {

            .CodeMirror-lines {
              padding: 0;

              .CodeMirror-code {
                line-height: 20px;

                .CodeMirror-linenumber {
                  padding: 0;
                  width: auto !important;
                }
                .CodeMirror-line {
                  padding-left: 35px;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
