<template>
  <div class="contract-editor-help">
    <p class="title"><i class="el-icon-info"></i>新增模板提示</p>
    <p>注意：</p>
    <ol>
      <li>为了更好的打印效果，模板字体请手动控制，默认16px，建议<span class="tips">手动调整打印页边距</span></li>
      <li><span class="tips">请不要绑定不需要存库的值</span>，否则前端报错渲染失败</li>
      <li><span class="tips">请不要随意改动模板控件值</span>，否则前端报错渲染失败</li>
    </ol>
    <p>操作：</p>
    <ol>
      <li><span class="tips">单击HTML按钮</span>查看对应代码</li>
      <li><span class="tips">单击预览</span>查看模板渲染</li>
      <li><span class="tips">单击任意控件按钮</span>添加指定控件至光标处
      </li>
      <li><span class="tips">双击输入类型控件</span>修改控件配置属性与参数</li>
      <li><span class="tips">双击任意行</span>可设置<span class="tips">锚点跳转链接</span>
      </li>
      <li><span class="tips">单击锚点按钮</span>跳转文档对应位置</li>
      <li>配置中<span class="tips">数值自动转大写</span>需要绑定至少两个输入框为同一绑定值</li>
    </ol>
  </div>
</template>

<script>
  export default {
    name: "contractEditor-help"
  }
</script>

<style scoped lang="scss">
  .contract-editor-help {
    padding: 5px;

    h2 {
      margin: 20px 0 20px;
    }

    .tips {
      color: red;
      font-weight: bold;
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
