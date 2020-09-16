/**
 * 合同模板 基本方法
 * import contractBaseFunction from '@/mixins/contract-base-function';
 * 请勿随意修改避免异常
 */
import {format} from 'date-fns';
import {Dic} from '@/utils/auth';

export default {
  data() {
    return {
      //-----------------------------代码正则
      inputRegExp: /<input (.*?)\/>/g, //input匹配正则
      selectRegExp: /<select ([a-zA-Z][^>]*)=[^>]*>(.*?)<\/select>/g, //select匹配正则
      optionRegExp: /<option ([a-zA-Z][^>]*)=[^>]*>(.*?)<\/option>/g, //option匹配正则
      textareaRegExp: /<textarea ([a-zA-Z][^>]*)=[^>]*>(.*?)<\/textarea>/g, //textarea匹配正则
      labelRegExp: /(<label id).*?(<\/label>)/g, //锚点匹配正则
      nameAndIdRegExp: /(['"])(?:(?!\1).)*?\1/g, //属性匹配正则
      // qlrDataRegExp: /(<\/label><\/p>).*?(<p><label)/g, //权利人列表匹配正则
      // jjfsRegExp: /<p>\*\*\*\*\*勿删，计价方式信息展示区域开始.*?勿删，计价方式信息展示区域结束\*\*\*\*\*<\/p>/g,
      // fqxxRegExp: /<p>\*\*\*\*\*勿删，分期信息展示区域开始.*?勿删，分期信息展示区域结束\*\*\*\*\*<\/p>/g,
      // msrRegExp: /<p>\*\*\*\*\*勿删，买受人信息展示区域开始.*?勿删，买受人信息展示区域结束\*\*\*\*\*<\/p>/g,
      // spfCmrRegExp: /<p>\*\*\*\*\*勿删，商品房流程-出卖人信息展示区域开始.*?勿删，商品房流程-出卖人信息展示区域结束\*\*\*\*\*<\/p>/g,
      // clfCmrRegExp: /<p>\*\*\*\*\*勿删，存量房流程-出卖人信息展示区域开始.*?勿删，存量房流程-出卖人信息展示区域结束\*\*\*\*\*<\/p>/g,
      //-----------------------------属性正则
      idReg: /id=".*?"/g,
      classReg: /class=".*?"/g,
      typeReg: /type=".*?"/g,
      placeHolderReg: /placeHolder=".*?"/g,
      styleReg: /style=".*?"/g,
      validatorReg: /validator=".*?"/g,
      valueLengthReg: /valuelength=".*?"/g,
      vModelReg: /v-model=".*?"/g,
      bindModelReg: /bind-model=".*?"/g,
      readModelReg: /read-model=".*?"/g,
      mapDataReg: /mapdata=".*?"/g,
      capitalizeReg: /capitalize=".*?"/g
    }
  },
  methods: {
    //----------------------------------------------------
    //点击锚点跳转dom内
    jumpAnchorLink(item, id) {
      let main = document.getElementById(id);
      main.scrollTop = main.querySelector('#' + item.id).offsetTop - 30;
      this.$message({
        message: '已跳转至锚点：' + item.name + ' 处',
        type: 'success'
      });
    },
    //匹配锚点
    getAnchorList(viewData) {
      let anchorList = [];
      let labelList =
        viewData.match(this.labelRegExp) !== null
          ? viewData.match(this.labelRegExp)
          : [];
      //匹配label中的name和id
      for (let i = 0; i < labelList.length; i++) {
        let nameIdList =
          labelList[i].match(this.nameAndIdRegExp) !== null
            ? labelList[i].match(this.nameAndIdRegExp)
            : [];
        let newIdList = nameIdList.map((value) => value.replace(/"/g, ''));
        anchorList.push({id: newIdList[0], name: newIdList[1]});
      }
      //处理左侧锚点，获得处理过后的name,id
      if (anchorList.length !== 0) {
        this.anchorList = anchorList;
      }
    },
    //----------------------------------------------------
    //正则匹配替换html
    convertHtml(viewData, convertType, regExp) {
      //去除所有换行符
      viewData = viewData.replace(/[\r\n]/g, '');
      //获取根据正则匹配的标签数据
      let tagList =
        viewData.match(regExp) !== null ? viewData.match(regExp) : [];
      //匹配方法
      let searchAndBuild = (data, reg) =>
        data.match(reg) !== null ? data.match(reg)[0] : '';
      //循环
      tagList.forEach((tagData) => {
        //获取标签数据内的所有的属性数据
        let allList = {
          attrList: searchAndBuild(tagData, this.nameAndIdRegExp),
          idData: searchAndBuild(tagData, this.idReg),
          classData: searchAndBuild(tagData, this.classReg),
          typeData: searchAndBuild(tagData, this.typeReg),
          placeHolderData: searchAndBuild(tagData, this.placeHolderReg),
          styleData: searchAndBuild(tagData, this.styleReg),
          validatorData: searchAndBuild(tagData, this.validatorReg),
          vModelData: searchAndBuild(tagData, this.vModelReg),
          bindModelData: searchAndBuild(tagData, this.bindModelReg),
          readModelData: searchAndBuild(tagData, this.readModelReg),
          valueLengthData: searchAndBuild(tagData, this.valueLengthReg),
          mapData: searchAndBuild(tagData, this.mapDataReg),
          capitalize: searchAndBuild(tagData, this.capitalizeReg)
        };
        //转化属性数据内的验证数据
        let newValidatorList = [];
        //验证
        let vModelProps =
          allList.vModelData.match(this.nameAndIdRegExp) !== null
            ? allList.vModelData
              .match(this.nameAndIdRegExp)[0]
              .replace(/"/g, '')
            : '';
        allList.validatorData =
          allList.validatorData.match(this.nameAndIdRegExp) !== null
            ? allList.validatorData
              .match(this.nameAndIdRegExp)[0]
              .replace(/"/g, '')
            : '';
        if (allList.validatorData !== '') {
          //先转成数组再加上validator
          newValidatorList = allList.validatorData
            .split(',')
            .map((value) => 'validator.' + value);
        }
        switch (convertType) {
          case 'input':
            if (allList.typeData.includes('text')) {
              if (allList.capitalize.includes('1')) {
                viewData = viewData.replace(
                  tagData,
                  `<el-form-item ${allList.styleData}>
                    <el-input ${allList.classData} ${
                    allList.idData
                  } :value="${vModelProps} | capitalize" ${
                    allList.bindModelData
                  } ${allList.readModelData} ${allList.placeHolderData} ${
                    allList.valueLengthData
                  } readonly></el-input>
                 </el-form-item>`
                );
              } else {
                viewData = viewData.replace(
                  tagData,
                  `<el-form-item ${allList.styleData} prop="${
                    vModelProps.includes('form')
                      ? vModelProps.slice(5)
                      : vModelProps
                  }" :rules="[${newValidatorList.toString()}]">
                    <el-input ${allList.classData} ${allList.idData} ${
                    allList.vModelData
                  } ${allList.bindModelData} ${allList.readModelData} ${
                    allList.placeHolderData
                  } ${allList.valueLengthData}></el-input>
                 </el-form-item>`
                );
              }
            } else if (allList.typeData.includes('date')) {
              viewData = viewData.replace(
                tagData,
                `<el-form-item ${allList.styleData} prop="${
                  vModelProps.includes('form')
                    ? vModelProps.slice(5)
                    : vModelProps
                }" :rules="[${newValidatorList.toString()}]">
                    <el-date-picker type="date" ${allList.classData} ${
                  allList.idData
                } ${allList.vModelData} ${allList.bindModelData} ${
                  allList.readModelData
                } ${
                  allList.placeHolderData
                } value-format="yyyy-MM-dd"></el-date-picker>
                 </el-form-item>`
              );
            }
            break;
          case 'select':
            allList.mapData =
              allList.mapData.match(this.nameAndIdRegExp) !== null
                ? allList.mapData
                  .match(this.nameAndIdRegExp)[0]
                  .replace(/"/g, '')
                : '';
            if (allList.mapData !== '') {
              //如果有map
              viewData = viewData.replace(
                tagData,
                `<el-form-item ${allList.styleData}>
                    <dictionary-select ${allList.classData} ${allList.idData} ${
                  allList.vModelData
                } ${allList.bindModelData} ${allList.readModelData} type="${
                  allList.mapData
                }" clearable></dictionary-select>
                 </el-form-item>`
              );
            } else {
              //没有
              let optionList =
                tagData.match(/value=".*?"/g) !== null
                  ? tagData
                    .match(/value=".*?"/g)
                    .map((value) =>
                      value.match(this.nameAndIdRegExp)[0].replace(/"/g, '')
                    )
                  : [];
              if (optionList) {
                let randomNum = parseInt(Math.random() * 1000000);
                if (randomNum) {
                  this.selectOption['optionList' + randomNum] = optionList;
                  viewData = viewData.replace(
                    tagData,
                    `<el-form-item ${allList.styleData}>
                    <el-select ${allList.classData} ${allList.idData} ${
                      allList.vModelData
                    } ${allList.bindModelData} ${
                      allList.readModelData
                    } clearable>
                        <el-option v-for="item in selectOption.${'optionList' +
                    randomNum}" :key="item" :label="item" :value="item" name="${randomNum}"></el-option>
                    </el-select>
                 </el-form-item>`
                  );
                }
              }
            }
            break;
          case 'textarea':
            if (allList.validatorData !== '') {
              //先转成数组再加上validator
              newValidatorList = allList.validatorData
                .split(',')
                .map((value) => 'validator.' + value);
            }
            viewData = viewData.replace(
              tagData,
              `<el-form-item ${allList.styleData} prop="${
                vModelProps.includes('form')
                  ? vModelProps.slice(5)
                  : vModelProps
              }" :rules="[${newValidatorList.toString()}]">
                    <el-input type="textarea" ${allList.classData} ${
                allList.idData
              } ${allList.vModelData} ${allList.bindModelData} ${
                allList.readModelData
              } ${allList.placeHolderData} ${
                allList.valueLengthData
              }></el-input>
                 </el-form-item>`
            );
            break;
        }
      });
      return viewData;
    },
    //暂时不会用这种东西了
    //能写代码就不会用组件
    // convertHtmlToPreview(viewData, convertType, regExp) {
    //   //去除所有换行符
    //   viewData = viewData.replace(/[\r\n]/g, '');
    //   //获取根据正则匹配的标签数据
    //   let tagList =
    //     viewData.match(regExp) !== null ? viewData.match(regExp) : [];
    //   //匹配方法
    //   let searchAndBuild = (data, reg) =>
    //     data.match(reg) !== null ? data.match(reg)[0] : '';
    //   tagList.forEach((tagData) => {
    //     //获取标签数据内的所有的属性数据
    //     let allList = {
    //       idData: searchAndBuild(tagData, this.idReg),
    //       styleData: searchAndBuild(tagData, this.styleReg),
    //       vModelData: searchAndBuild(tagData, this.vModelReg),
    //       mapData: searchAndBuild(tagData, this.mapDataReg)
    //     };
    //     let vModelProps =
    //       allList.vModelData.match(this.nameAndIdRegExp) !== null
    //         ? allList.vModelData
    //           .match(this.nameAndIdRegExp)[0]
    //           .replace(/"/g, '')
    //         : '';
    //     switch (convertType) {
    //       case 'input':
    //         viewData = viewData.replace(
    //           tagData,
    //           `<span class="preview-span" ${
    //             allList.styleData
    //           }>{{${vModelProps}}}</span>`
    //         );
    //         break;
    //       case 'select':
    //         allList.mapData =
    //           allList.mapData.match(this.nameAndIdRegExp) !== null
    //             ? allList.mapData
    //               .match(this.nameAndIdRegExp)[0]
    //               .replace(/"/g, '')
    //             : '';
    //         if (allList.mapData) {
    //           viewData = viewData.replace(
    //             tagData,
    //             `<dictionary-span class="preview-span" type="${
    //               allList.mapData
    //             }" :binddata="${vModelProps}" ${
    //               allList.styleData
    //             }></dictionary-span>`
    //           );
    //         } else {
    //           viewData = viewData.replace(
    //             tagData,
    //             `<span class="preview-span" ${
    //               allList.styleData
    //             }>{{${vModelProps}}}</span>`
    //           );
    //         }
    //         break;
    //       case 'textarea':
    //         viewData = viewData.replace(
    //           tagData,
    //           `<div class="preview-textarea" ${
    //             allList.styleData
    //           }>{{${vModelProps}}}</div>`
    //         );
    //         break;
    //     }
    //   });
    //   return viewData;
    // },
    // convertJjfs(viewData, regExp, convertData) {
    //   let allJjfsList =
    //     viewData.match(regExp) !== null ? viewData.match(regExp)[0] : '';
    //   if (allJjfsList !== '' && !convertData) {
    //     viewData = viewData.replace(allJjfsList, '<p>*****渲染计价方式信息失败！原因：丢失计价方式信息数据*****</p>');
    //     return viewData;
    //   }
    //   if (allJjfsList !== '') {
    //     let aaa = ` <p class="small-text">出卖人与买受人按照下列第${convertData.housingtranContract.jjfs}种方式计算该商品房价款</p>`
    //     switch (convertData.housingtranContract.jjfs) {
    //       case '1': // 按照套内建筑面积计算
    //         viewData = viewData.replace(
    //           allJjfsList,
    //           `${aaa}
    //            <p class="small-text">1。按照套内建筑面积计算，该商品房单价为每平方米<span class="preview-span" style="width: 100px">${convertData.housingtranContract.zjbz}</span>(币种)
    //           <span class="preview-span" style="width: 100px">${convertData.housingtranContract.dj}</span>元，
    //           总价款为<span class="preview-span" style="width: 100px">${convertData.housingtranContract.zjbz}</span>(币种)
    //           <span class="preview-span" style="width: 100px">${convertData.housingtranContract.zj}</span>元
    //           （大写<span class="preview-span" style="width: 300px">${convertData.housingtranContract.zjjedx}</span>元整）</p>
    //           `
    //         );
    //         break;
    //       case '2': // 按照建筑面积计算
    //         viewData = viewData.replace(
    //           allJjfsList,
    //           `${aaa}
    //            <p class="small-text">2。按照建筑面积计算，该商品房单价为每平方米<span class="preview-span" style="width: 100px">${convertData.housingtranContract.zjbz}</span>(币种)
    //           <span class="preview-span" style="width: 100px">${convertData.housingtranContract.dj}</span>元，
    //           总价款为<span class="preview-span" style="width: 100px">${convertData.housingtranContract.zjbz}</span>(币种)
    //           <span class="preview-span" style="width: 100px">${convertData.housingtranContract.zj}</span>元
    //           （大写<span class="preview-span" style="width: 300px">${convertData.housingtranContract.zjjedx}</span>元整）</p>
    //           `
    //         );
    //         break;
    //       case '3': // 按照套计算
    //         viewData = viewData.replace(
    //           allJjfsList,
    //           `${aaa}
    //            <p class="small-text">3。按照套计算，该商品房总价款为<span class="preview-span" style="width: 100px">${convertData.housingtranContract.zjbz}</span>(币种)
    //           <span class="preview-span" style="width: 100px">${convertData.housingtranContract.zj}</span>元
    //           （大写<span class="preview-span" style="width: 300px">${convertData.housingtranContract.zjjedx}</span>元整）</p>
    //           `
    //         );
    //         break;
    //       case '4': // 其它
    //         viewData = viewData.replace(
    //           allJjfsList,
    //           `${aaa}
    //            <p class="small-text">4。按照<span class="preview-span" style="width: 100px">${this.getDicName('计价方式', convertData.housingtranContract.jjfs)}</span>计算，
    //           该商品房总价款为<span class="preview-span" style="width: 100px">${convertData.housingtranContract.zjbz}</span>(币种)
    //           <span class="preview-span" style="width: 100px">${convertData.housingtranContract.zj}</span>元
    //           （大写<span class="preview-span" style="width: 300px">${convertData.housingtranContract.zjjedx}</span>元整）</p>
    //           `
    //         );
    //         break;
    //     }
    //   }
    //   return viewData;
    // },
    // convertFqxx(viewData, regExp, convertData) {
    //   let allFqfkList =
    //     viewData.match(regExp) !== null ? viewData.match(regExp)[0] : '';
    //   if (allFqfkList !== '' && !convertData) {
    //     viewData = viewData.replace(allFqfkList, '<p>*****渲染分期信息失败！原因：丢失分期信息数据*****</p>');
    //     return viewData;
    //   }
    //   if (allFqfkList !== '') {
    //     let aaa = [];
    //     switch (convertData.housingtranContract.fklx) {
    //       case '1': //一次性付款
    //         viewData = viewData.replace(
    //           allFqfkList,
    //           `
    //            <p class="small-text">一次性付款。买受人应当在<span class="preview-span" style="width: 100px">${
    //             this.dateD(convertData.housingtranContract.fksj)
    //           }</span>前支付该商品房全部价款。</p>
    //           `
    //         );
    //         break;
    //       case '2': //分期付款
    //         for (let i = 0; i < convertData.installmentinfoList.length; i++) {
    //           if (i === 0) {
    //             aaa.push(
    //               ` <p class="small-text">分期付款。首期房价款${
    //                 convertData.housingtranContract.zjbz
    //               }（币种）<span class="preview-span" style="width: 100px">${
    //                 convertData.installmentinfoList[i].fqje
    //               }</span>（大写 ${
    //                 convertData.installmentinfoList[i].fqjedx
    //               } 元整）应当于 <span class="preview-span" style="width: 100px">${this.dateD(
    //                 convertData.installmentinfoList[i].endTime
    //               )}</span> 前支付。</p>`
    //             );
    //           } else {
    //             aaa.push(
    //               ` <p class="small-text">${convertData.installmentinfoList[i].no}期房价款${
    //                 convertData.housingtranContract.zjbz
    //               }（币种）<span class="preview-span" style="width: 100px">${
    //                 convertData.installmentinfoList[i].fqje
    //               }</span>（大写 ${
    //                 convertData.installmentinfoList[i].fqjedx
    //               } 元整）应当于 <span class="preview-span" style="width: 100px">${this.dateD(
    //                 convertData.installmentinfoList[i].endTime
    //               )}</span> 前支付。</p>`
    //             );
    //           }
    //         }
    //         viewData = viewData.replace(allFqfkList, aaa.toString().replace(/,/g, ''));
    //         break;
    //       case '3': //贷款方式
    //         viewData = viewData.replace(
    //           allFqfkList,
    //           `
    //            <p class="small-text">贷款方式付款：<span class="preview-span" style="width: 100px;">${this.getDicName('贷款方式', convertData.housingtranContract.dkfs)}</span>。买受人应当于 <span class="preview-span" style="width: 100px;">${this.dateD(convertData.housingtranContract.fksj)}</span> 前支付首期房价款 ${convertData.housingtranContract.zjbz}（币种） <span class="preview-span" style="width: 100px;">${convertData.housingtranContract.dkfkje}</span> 元（大写 ${convertData.housingtranContract.dkfkjedx} 元整）</p>
    //           `
    //         );
    //         break;
    //       case '99': //其他方式
    //         viewData = viewData.replace(
    //           allFqfkList,
    //           `
    //            <p class="small-text">其他方式：</p>
    //            <p class="small-text"><span class="preview-span" style="width: 100%;">${convertData.housingtranContract.qtfsfk}</span></p>
    //           `
    //         );
    //         break;
    //     }
    //   }
    //   return viewData;
    // },
    // convertMsr(viewData, regExp, convertData) {
    //   let allMsrList =
    //     viewData.match(regExp) !== null ? viewData.match(regExp)[0] : '';
    //   if (allMsrList !== '' && !convertData) {
    //     viewData = viewData.replace(allMsrList, '<p>*****渲染买受人列表失败！原因：丢失人数据*****</p>');
    //     return viewData;
    //   }
    //   if (allMsrList !== '' && convertData.length > 0) {
    //     let aaa = [];
    //     let bbb = [];
    //     for (let i = 0; i < convertData.length; i++) {
    //       aaa.push([]);
    //       for (const key in convertData[i]) {
    //         if (convertData[i].hasOwnProperty(key)) {
    //           if (!convertData[i][key]) {
    //             convertData[i][key] = '';
    //           }
    //         }
    //       }
    //       aaa[i].push(` <p class="small-text">买受人：<span class="preview-span" style="width: calc(100% - 100px);">${convertData[i].qlrmc}</span></p>`);
    //       // aaa[i].push(` <p class="small-text">${convertData[i].dllx}：<span>${convertData[i].dlrmc}</span></p>`);
    //       if (convertData[i].frgjhj === 1) {
    //         aaa[i].push(` <p class="small-text">${this.getDicName('国籍或户籍所在地', convertData[i].frgjhj)}：<span class="preview-span" style="width: calc(100% - 100px);">${convertData[i].gj}</span></p>`);
    //       } else if (convertData[i].frgjhj === 2) {
    //         aaa[i].push(` <p class="small-text">${this.getDicName('国籍或户籍所在地', convertData[i].frgjhj)}：<span class="preview-span" style="width: calc(100% - 100px);">${convertData[i].hjszss}</span></p>`);
    //       }
    //       aaa[i].push(`<p class="small-text">证件类型：<span class="preview-span" style="width: calc(50% - 100px);">${this.getDicName('证件种类', convertData[i].zjzl)}</span>，证号：<span class="preview-span" style="width: calc(50% - 100px);">${convertData[i].zjh}</span></p>`);
    //       aaa[i].push(`<p class="small-text">出生日期：<span class="preview-span" style="width: calc(50% - 100px);">${this.dateD(convertData[i].csrq)}</span>，性别：<span class="preview-span" style="width: calc(50% - 100px);">${this.getDicName('性别', convertData[i].xb)}</span></p>`);
    //       aaa[i].push(`<p class="small-text">通讯地址：<span class="preview-span" style="width: calc(100% - 100px);">${convertData[i].dz}</span></p>`);
    //       aaa[i].push(`<p class="small-text">邮政编码：<span class="preview-span" style="width: calc(50% - 100px);">${convertData[i].yb}</span>，联系电话：<span class="preview-span" style="width: calc(50% - 100px);">${convertData[i].dh}</span></p>`);
    //       aaa[i].push(` <p class="small-text">${this.getDicName('代理类型', convertData[i].dllx)}：<span class="preview-span" style="width: calc(100% - 100px);">${convertData[i].dlrmc}</span></p>`);
    //       if (convertData[i].dlrgjhj === 1) {
    //         aaa[i].push(` <p class="small-text">${this.getDicName('国籍或户籍所在地', convertData[i].dlrgjhj)}：<span class="preview-span" style="width: calc(100% - 100px);">${convertData[i].dlgj}</span></p>`);
    //       } else if (convertData[i].dlrgjhj === 2) {
    //         aaa[i].push(` <p class="small-text">${this.getDicName('国籍或户籍所在地', convertData[i].dlrgjhj)}：<span class="preview-span" style="width: calc(100% - 100px);">${convertData[i].dlrszsx}</span></p>`);
    //       }
    //       aaa[i].push(` <p class="small-text">证件类型：<span class="preview-span" style="width: calc(50% - 100px);">${this.getDicName('证件种类', convertData[i].dlrzjzl)}</span>，证号：<span class="preview-span" style="width: calc(50% - 100px);">${convertData[i].dlrzjh}</span></p>`);
    //       aaa[i].push(` <p class="small-text">出生日期：<span class="preview-span" style="width: calc(50% - 100px);">${this.dateD(convertData[i].dlcsrq)}</span>，性别：<span class="preview-span" style="width: calc(50% - 100px);">${this.getDicName('性别', convertData[i].dlxb)}</span></p>`);
    //       aaa[i].push(` <p class="small-text">通讯地址：<span class="preview-span" style="width: calc(100% - 100px);">${convertData[i].dltxdz}</span></p>`);
    //       aaa[i].push(` <p class="small-text">邮政编码：<span class="preview-span" style="width: calc(100% - 100px);">${convertData[i].dlyzbm}</span></p>`);
    //       bbb.push(aaa[i].toString().replace(/,/g, ''));
    //     }
    //     viewData = viewData.replace(allMsrList, bbb.toString().replace(/,/g, ''));
    //   }
    //   return viewData;
    // },
    // convertCmr(viewData, regExp, convertData) {
    //   let allCmrList =
    //     viewData.match(regExp) !== null ? viewData.match(regExp)[0] : '';
    //   if (allCmrList !== '' && !convertData) {
    //     viewData = viewData.replace(allCmrList, ' <p>*****渲染出卖人列表失败！原因：丢失人数据*****</p>');
    //     return viewData;
    //   }
    //   if (allCmrList !== '' && convertData.length > 0) {
    //     let aaa = [];
    //     let bbb = [];
    //     for (let i = 0; i < convertData.length; i++) {
    //       aaa.push([]);
    //       for (const key in convertData[i]) {
    //         if (convertData[i].hasOwnProperty(key)) {
    //           if (!convertData[i][key]) {
    //             convertData[i][key] = '';
    //           }
    //         }
    //       }
    //       aaa[i].push(` <p class="small-text">出卖人：<span class="preview-span" style="width: calc(100% - 100px);">${convertData[i].qlrmc}</span></p>`);
    //       aaa[i].push(` <p class="small-text">通讯地址：<span class="preview-span" style="width: calc(100% - 100px);">${convertData[i].dz}</span></p>`);
    //       aaa[i].push(` <p class="small-text">邮政编码：<span class="preview-span" style="width: calc(100% - 100px);"></span></p>`);
    //       aaa[i].push(` <p class="small-text">营业执照注册号：<span class="preview-span" style="width: calc(100% - 140px);"></span></p>`);
    //       aaa[i].push(` <p class="small-text">企业资质证书号：<span class="preview-span" style="width: calc(100% - 140px);"></span></p>`);
    //       aaa[i].push(` <p class="small-text">法定代表人：<span class="preview-span" style="width: calc(50% - 100px);">${convertData[i].frmc}</span>联系电话：<span class="preview-span" style="width: calc(50% - 100px);">${convertData[i].frdh}</span></p>`);
    //       aaa[i].push(` <p class="small-text">委托代理人：<span class="preview-span" style="width: calc(50% - 100px);">${convertData[i].dlrmc}</span>联系电话：<span class="preview-span" style="width: calc(50% - 100px);">${convertData[i].dlrdh}</span></p>`);
    //       aaa[i].push(` <p class="small-text">委托销售经纪机构：<span class="preview-span" style="width: calc(100% - 150px);">${convertData[i].dljg}</span></p>`);
    //       aaa[i].push(` <p class="small-text">通讯地址：<span class="preview-span" style="width: calc(100% - 100px);">${convertData[i].dltxdz}</span></p>`);
    //       aaa[i].push(` <p class="small-text">邮政编码：<span class="preview-span" style="width: calc(100% - 100px);">${convertData[i].dlyzbm}</span></p>`);
    //       aaa[i].push(` <p class="small-text">营业执照注册号：<span class="preview-span" style="width: calc(100% - 150px);"></span></p>`);
    //       aaa[i].push(` <p class="small-text">经纪机构备案证明号：<span class="preview-span" style="width: calc(100% - 160px);"></span></p>`);
    //       aaa[i].push(` <p class="small-text">法定代表人：<span class="preview-span" style="width: calc(50% - 100px);"></span>联系电话：<span class="preview-span" style="width: calc(50% - 100px);"></span></p>`);
    //       bbb.push(aaa[i].toString().replace(/,/g, ''));
    //     }
    //     viewData = viewData.replace(allCmrList, bbb.toString().replace(/,/g, ''));
    //   }
    //   return viewData;
    // },
    //----------------------------------------------------
    getRandomNum() {
      let random = Math.floor(Math.random() * 1000000);
      //强制获取6位数
      if (random < 100000 || random >= 1000000) {
        this.getRandomNum();
      } else {
        return random;
      }
    },
    dateD(value) {
      if (value > 0) {
        return format(value, 'yyyy-MM-dd');
      } else {
        return '';
      }
    },
    getDicName(type, binddata) {
      if (!binddata) {
        return '';
      }
      const allDic = Dic.getToken().dic;
      const dicArr = allDic.find((item) => {
        return item.label === type;
      });
      // 判断子集非空
      if (dicArr.childrens) {
        const filterObj = dicArr.childrens.filter((item) => {
          return item.value === binddata.toString();
        });
        if (filterObj.length > 0) {
          return filterObj[0].label;
        } else {
          return '';
        }
      }
    }
  }
};
