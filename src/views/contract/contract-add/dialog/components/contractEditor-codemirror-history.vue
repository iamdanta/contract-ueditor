<template>
  <div class="codemirror-history">
    <div id="codemirror-history" class="codemirror-history-main" ref="codemirror-history"></div>
  </div>
</template>

<script>
  import CodeMirror from 'codemirror';
  import 'codemirror/mode/vue/vue.js';
  //代码版本差异比较
  import 'codemirror/addon/merge/merge.css';
  import 'codemirror/addon/merge/merge.js';
  import './formatting';

  //滚动条
  //scrollbarStyle: "simple"
  import 'codemirror/addon/scroll/simplescrollbars.js';
  import 'codemirror/addon/scroll/simplescrollbars.css';

  export default {
    name: "contractEditor-codeMirror-history",
    props: ['code', 'currentHistory'],
    data() {
      return {
        codemirror: null,
        //是否有编辑器
        isHaveEditor: false
      }
    },
    watch: {
      currentHistory(val) {
        this.refresh(this.codemirror.editor());
        this.codemirror.right.orig.setValue(val);
        this.refresh(this.codemirror.right.orig);
      },
    },
    mounted() {
      this.$refs['codemirror-history'].innerHTML = '';
      //生成实例
      this.initCodemirrorHistory();
      //插入代码
      this.codemirror.editor().setValue(this.code);
      this.refresh(this.codemirror.editor());
      this.codemirror.right.orig.setValue(this.currentHistory);
      this.refresh(this.codemirror.right.orig);
    },
    methods: {
      initCodemirrorHistory() {
        //this.codemirror.right.orig 为右侧编辑器实例
        //this.codemirror.editor() 左侧
        this.codemirror = CodeMirror.MergeView(this.$refs['codemirror-history'], {
          value: '',//上次内容
          origLeft: null,
          origRight: '',//本次内容
          lineNumbers: true,//显示行号
          mode: "text/x-vue",
          highlightDifferences: true,
          styleActiveLine: true,
          matchBrackets: true,
          connect: 'align',
          //滚动条样式
          scrollbarStyle: 'simple'
        });
      },
      refresh(dom = this.codemirror.editor()) {
        let totalLines = dom.lineCount();
        dom.autoFormatRange({line: 0, ch: 0}, {line: totalLines});
      },
      save() {
        this.$emit('update:code', this.codemirror.editor().getValue());
        this.$message.success('更新代码成功！');
      }
    }
  }
</script>

<style scoped lang="scss">
  .codemirror-history {
    .codemirror-history-main {
      height: 100%;

      /deep/ .CodeMirror-merge {
        height: 100%;

        .CodeMirror-merge-pane {
          height: 100%;

          .CodeMirror {
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
    }
  }
</style>
