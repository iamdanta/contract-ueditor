const validate = {
  // 验证自然数
  naturalNumber: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^(([0-9]*[1-9][0-9]*)|(0+))$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入自然数'));
      }
    }
  },
  // 微信号
  wechat: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入正确的微信号码'));
      }
    }
  },
  // 英文
  english: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^.[A-Za-z]+$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入英文字符'));
      }
    }
  },
  // 座机
  telephone: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^\d{3}-\d{7,8}|\d{4}-\d{7,8}$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入正确的座机号'));
      }
    }
  },
  // 银行卡号码
  bankCard: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^[1-9]\d{9,19}$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入正确的银行卡号码'));
      }
    }
  },
  // 证件号码
  IDNumber: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^[a-z0-9A-Z]{0,50}$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入正确的证件号码'));
      }
    }
  },
  // 身份证号码,包括15位和18位的
  IDCard: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{7}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$)/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入正确的身份证号码'));
      }
    }
  },
  // QQ号码
  qq: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^[1-9]\d{4,11}$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入正确的QQ号码'));
      }
    }
  },
  // 网址, 仅支持http和https开头的
  url: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入以http和https开头的网址'));
      }
    }
  },
  // 0到20位的英文字符和数字
  enNum0to20: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^[a-z0-9A-Z]{0,20}$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入20位以内的英文字符和数字'));
      }
    }
  },
  // 2到100位的中英文字符和空格
  cnEnSpace2to100: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^[a-zA-Z\u4E00-\u9FA5\s*]{2,100}$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入2到100位的中英文字符和空格'));
      }
    }
  },
  // 数字和换行符
  numLinefeed: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^[0-9\n*]+$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入数字和换行符'));
      }
    }
  },
  // 255位以内的字符
  char0to255: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^.{0,255}$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入255位以内的字符'));
      }
    }
  },
  // 特殊字符
  specialChar: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^[^`~!@#$^&*()=|{}':;',/\\[\].<>?]*$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请删除特殊字符'));
      }
    }
  },
  // 保留两位小数
  twoDecimal: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^(([0-9][0-9]*)|(([0]\.\d{1,2}|[0-9][0-9]*\.\d{1,2})))$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('小数点保留最多两位'));
      }
    }
  },
  // 用户名 第一个是字母,长度是4-20
  loginname: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^[a-zA-Z]\w{3,19}$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('字母开头，长度为4-20'));
      }
    }
  },
  // 密码  6-20位字母，数字和符号两种以上组合
  password: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&*_,]+$)[a-zA-Z\d!@#$%^&*_,]+$/g;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('6-20位字母，数字和符号两种以上组合'));
      }
    }
  },
  // 必填
  required: {
    required: true,
    message: '必填'
  },
  phone: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^((0\d{2,3}-\d{7,8})|((13[0-9])|(14[5,7,9])|(15[^4])|(18[0-9])|(17[0,1,3,5,6,7,8]))\d{8})$/g;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('必须为合法电话'));
      }
    }
  },
  //不必填，但是需要验证
  noNeedRequire: {
    required: false,
    trigger: ['blur']
  },
  // 护照
  Passport: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^[a-zA-Z0-9]{3,21}$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入正确的护照格式'));
      }
    }
  },
  // 户口薄
  Household: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^[a-zA-Z0-9]{3,21}$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入正确的户口簿格式'));
      }
    }
  },
  // 军官证
  Officer: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^[a-zA-Z0-9]{7,21}$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入正确的军官证格式'));
      }
    }
  },
  // 组织机构代码
  OrganizationCode: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      let ws = [3, 7, 9, 10, 5, 8, 4, 2];
      let str = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let reg = /^([0-9A-Z]){8}$/;
      if (!reg.test(value)) {
        return callback(new Error('请输入正确的组织机构代码格式'));
      }
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += str.indexOf(value.charAt(i)) * ws[i];
      }
      let c9 = 11 - (sum % 11);
      if (c9 == 10) {
        c9 = 'X';
      } else if (c9 == 11) {
        c9 = '0';
      }
      if (c9 !== value.charAt(9)) {
        return callback(new Error('请输入正确的组织机构代码格式'));
      } else {
        callback();
      }
    }
  },
  // 统一社会信用代码
  SocialCreditCode: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const partn = /^[0-9A-Z]+$/;
      if (value.length !== 18 || partn.test(value) === false) {
        return callback(new Error('不是有效的统一社会信用编码'));
      } else {
        let Ancode; //统一社会信用代码的每一个值
        let Ancodevalue; //统一社会信用代码每一个值的权重
        let total = 0;
        let weightedfactors = [
          1,
          3,
          9,
          27,
          19,
          26,
          16,
          17,
          20,
          29,
          25,
          13,
          8,
          24,
          10,
          30,
          28
        ]; //加权因子
        let str = '0123456789ABCDEFGHJKLMNPQRTUWXY';
        //不用I、O、S、V、Z
        for (let i = 0; i < value.length - 1; i++) {
          Ancode = value.substring(i, i + 1);
          Ancodevalue = str.indexOf(Ancode);
          total = total + Ancodevalue * weightedfactors[i];
          //权重与加权因子相乘之和
        }
        let logiccheckcode = 31 - (total % 31);
        if (logiccheckcode == 31) {
          logiccheckcode = 0;
        }
        let Str =
          '0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,T,U,W,X,Y';
        let Array_Str = Str.split(',');
        logiccheckcode = Array_Str[logiccheckcode];

        let checkcode = value.substring(17, 18);
        if (logiccheckcode != checkcode) {
          return callback(new Error('不是有效的统一社会信用编码'));
        } else {
          callback();
        }
      }
    }
  },
  // 营业执照
  Businesslicense: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /(^(?:(?![IOZSV])[\dA-Z]){2}\d{6}(?:(?![IOZSV])[\dA-Z]){10}$)|(^\d{15}$)/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入正确的营业执照格式'));
      }
    }
  },
  // 汉字加字字母
  normalchar: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /([\u4e00-\u9fa5]|\w)+$/g;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('只能为汉字数字字母'));
      }
    }
  },
  // email
  email: {
    type: 'email',
    message: '请输入正确的邮箱'
  },
  // 数值
  number: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^\d*(\.\d+)?$/g;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('只能是数字'));
      }
    }
  },
  // 邮政编码
  postalCode: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^[1-9][0-9]{5}$/;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入正确的邮政编码'));
      }
    }
  },
  // 正整数
  zhengnumber: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback();
      }
      const reg = /^([1-9]\d*|[0]{1,1})$/g;
      if (reg.test(value)) {
        callback();
      } else {
        return callback(new Error('只能是正整数'));
      }
    }
  },
  isExternal: (path) => {
    return /^(https?:|mailto:|tel:)/.test(path);
  }
};

export default validate;
