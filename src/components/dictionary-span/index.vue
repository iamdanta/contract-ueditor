<template>
  <span>{{ dicSpan }}</span>
</template>

<script>

  /**
   * 字典文本组件
   */
  import { Dic } from '@/utils/auth';
  export default {
    props: ['type', 'binddata'],
    data() {
      return {};
    },
    computed: {
      dicSpan() {
        if (this.type) {
          this.allDic = Dic.getToken().dic;
          const dicArr = this.allDic.find((item) => {
            return item.label === this.type;
          });
          // 判断子集非空
          if (dicArr.childrens) {
            const filterObj = dicArr.childrens.filter((item) => {
              if (typeof this.binddata === "string") {
                return item.value === this.binddata;
              } else if (typeof this.binddata === "number")
                return item.value === this.binddata.toString();
            });
            if (filterObj.length > 0) {
              return filterObj[0].label;
            } else {
              return '';
            }
          }
        }
      }
    }
  };
</script>
