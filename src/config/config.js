let CONFIG = {
  UEditorPackAgeUrl: '/contract-ueditor-ui/UEditor/'
};
//编辑器公用配置
window.UEditorMainConfig = {
  // 编辑器不自动被内容撑高
  autoHeightEnabled: false,
  // 初始容器宽度
  initialFrameWidth: '100%',
  // UEditor 资源文件的存放路径，如果你使用的是 vue-cli 生成的项目，通常不需要设置该选项，vue-ueditor-wrap 会自动处理常见的情况，如果需要特殊配置，参考下方的常见问题2
  UEDITOR_HOME_URL: '',
  toolbars: [
    ['source', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', '|', 'bold', 'italic', 'underline', 'fontborder', 'strikethrough', '|', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', 'pagebreak', 'insertorderedlist', 'insertunorderedlist', '|',  'print'],
    ['help', '|']
  ],
  //自动保存
  enableAutoSave: false
};
export default CONFIG;
