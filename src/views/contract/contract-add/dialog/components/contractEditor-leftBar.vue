<template>
  <div>
    <div class="leftBarAuthor">
      <p class="title"><i class="el-icon-collection-tag"></i>自定义锚点</p>
      <transition-group name="list-complete" tag="ul">
        <li v-for="(item, index) in contractAnchorLinkList" :key="item.id">
          <el-row>
            <el-col :span="6" class="anchorLink"><i class="el-icon-collection"></i> <span>{{index + 1}}</span>
            </el-col>
            <el-col :span="15" class="goAnchorLink"><span @click="jumpAnchorLink(item)">{{item.name}}</span>
            </el-col>
            <el-col :span="3" class="authorDelete"><i class="el-icon-circle-close"
                                                      @click="deleteAnchorLink(item)"></i></el-col>
          </el-row>
        </li>
      </transition-group>
    </div>
  </div>
</template>

<script>
  export default {
    name: "contractEditor-leftBar",
    props: ['frame', 'contractModelData', 'contractAnchorLinkList'],
    data() {
      return {}
    },
    methods: {
      //删除锚点链接
      deleteAnchorLink(item) {
        for (let i = 0; i < this.contractAnchorLinkList.length; i++) {
          if (this.contractAnchorLinkList[i].id === item.id) {
            this.contractAnchorLinkList.splice(i, 1);
            let spanList = this.frame.document.getElementsByTagName('label');
            for (let a = 0; a < spanList.length; a++) {
              if (spanList[a].id === item.id) {
                spanList[a].parentNode.removeChild(spanList[a]);
                this.showMessage('已删除 ' + item.name + ' 锚点链接', 'success');
                this.$refs.contractEditorRightBar.updateDrawerVisible(true);
              }
            }
          }
        }
      },
      //点击锚点跳转
      jumpAnchorLink(item) {
        this.frame.location.hash = '#' + item.id;
        this.showMessage('编辑器已跳转至锚点：' + item.name + ' 处', 'success');
      },
      //显示提示信息
      showMessage(message, type) {
        this.$message({
          showClose: true,
          message: message,
          type: type
        });
      }
    }
  }
</script>

<style scoped>
</style>
