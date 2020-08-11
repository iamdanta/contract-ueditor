<template>
  <div class="contract-editor-help">
    <p class="title"><i class="el-icon-info"></i>自定义合同模板编辑器-更新日志</p>
    <p>当前版本：V0.2.4版本</p>
    <p>更新日志：</p>
    <ul>
      <li>
        <p>2020.07.31 V0.2.4版本 wupeng</p>
        <ol>
          <li>接口对接完毕，区分开发模式和发布模式</li>
          <li>发布模式加入历史数据对比</li>
          <li>历史数据使用codemirror addon merge插件制作完毕</li>
          <li>codemirror加入主题选择</li>
        </ol>
      </li>
      <li>
        <p>2020.07.21 V0.2.3版本 wupeng</p>
        <ol>
          <li>测试优化第二步基本完成，等待对接接口解决编辑问题</li>
          <li>bug修复</li>
        </ol>
      </li>
      <li>
        <p>2020.07.20 V0.2.2版本 wupeng</p>
        <ol>
          <li>分离组件按钮组</li>
          <li>删除codemirror，移入下一步操作</li>
          <li>bug修复</li>
        </ol>
      </li>
      <li>
        <p>2020.07.17 V0.2.1版本 wupeng</p>
        <ol>
          <li>编辑器布局重新优化</li>
          <li>加入更多的原生操作按钮</li>
          <li>计划加入直接编写代码</li>
        </ol>
      </li>
      <li>
        <p>2019.xx.xx V0.1.0版本 wupeng</p>
        <ol>
          <li>基于UEditor制作合同模板编辑器</li>
        </ol>
      </li>
    </ul>

  </div>
</template>

<script>
  export default {
    name: "contractEditor-update-work"
  }
</script>

<style scoped lang="scss">
  .contract-editor-help {
    padding: 5px;

    h2 {
      margin: 20px 0 20px;
    }

    p.title {
      font-size: 17px;
      font-weight: bold;
      color: #333333;
      margin: 20px 0 20px;

      i {
        color: #0E90FE;
        margin-right: 10px;
      }
    }

    li {
      font-weight: 400;
      color: #333333;
      line-height: 20px;
      margin: 20px 20px;
    }
  }
</style>
