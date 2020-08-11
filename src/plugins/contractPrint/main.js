import Print from './print.js';
Print.install = function(Vue) {
  Vue.directive('print', Print);
};

export default Print;
