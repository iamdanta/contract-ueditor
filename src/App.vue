<template>
  <div id="app" class="full-height">
    <router-view></router-view>
  </div>
</template>

<script>
  import { userAuth, Dic, App } from '@/utils/auth';

  export default {
    name: 'app',
    data() {
      return {};
    },
    mounted() {
      userAuth.setToken({
        userName: 'DanTa',
        realName: 'wupeng'
      });
      Dic.setToken({
        dic: [{
          label: '是否',
          value: '1',
          childrens: [{
            label: '是',
            value: '1',
          }, {
            label: '否',
            value: '0',
          }]
        }, {
          label: '颜色',
          value: '1',
          childrens: [{
            label: '红',
            value: '0',
          }, {
            label: '橙',
            value: '1',
          }, {
            label: '黄',
            value: '2',
          }]
        }],
        name: '字典'
      });
      App.setToken({
        appName: 'test',
        appCreatePeople: 'DanTa'
      });
    },
    methods: {}
  };
</script>

<style lang="scss" scoped></style>
