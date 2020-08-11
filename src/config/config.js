let CONFIG = {
  UEditorPackAgeUrl: '/contract-ueditor-ui/UEditor/'
};
//编辑器公用配置
window.UEditorMainConfig = {
  serverUrl: 'http://35.201.165.105:8000/controller.php',
  // 编辑器不自动被内容撑高
  autoHeightEnabled: false,
  // 初始容器宽度
  initialFrameWidth: '100%',
  // UEditor 资源文件的存放路径，如果你使用的是 vue-cli 生成的项目，通常不需要设置该选项，vue-ueditor-wrap 会自动处理常见的情况，如果需要特殊配置，参考下方的常见问题2
  UEDITOR_HOME_URL: '',
  toolbars: [
    // ['source', '|', 'fontfamily', 'fontsize', 'forecolor', 'backcolor', '|', 'bold', 'italic', 'underline', 'fontborder', 'strikethrough', '|', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', 'pagebreak', 'insertorderedlist', 'insertunorderedlist', '|',  'print'],
    // ['help', '|'],
    // 全局配置
    ['fullscreen', 'source', '|', 'undo', 'redo', '|',
      'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
      'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
      'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
      'directionalityltr', 'directionalityrtl', 'indent', '|',
      'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
      'link', 'unlink', 'anchor', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
      'simpleupload', 'insertimage', 'emotion', 'scrawl', 'insertvideo', 'music', 'attachment', 'map', 'gmap', 'insertframe', 'insertcode', 'webapp', 'pagebreak', 'template', 'background', '|',
      'horizontal', 'date', 'time', 'spechars', 'snapscreen', 'wordimage', '|',
      'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'charts', '|',
      'print', 'searchreplace']
  ],
  //自动保存
  enableAutoSave: false
};
export default CONFIG;
