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
    created() {
      if (this.$router.path !== '/home') {
        this.$router.replace('/home')
      }
    },
    mounted() {
      const expires = this.setUserLocal();
      // 设置过期时间
      //执行存local
      let userData = {
        userName: 'DanTa',
        realName: 'wupeng'
      };
      let dicData = {
        dic: require('../public/dic.json').data,
        name: '字典'
      };
      let appData = {
        appName: 'test',
        appCreatePeople: 'DanTa'
      };
      userData.expires = expires;
      dicData.expires = expires;
      appData.expires = expires;
      userAuth.setToken(userData);
      Dic.setToken(dicData);
      App.setToken(appData);
    },
    methods: {
      setUserLocal() {
        const now = new Date();
        const dateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return dateTime.getTime();
      }
    }
  };
</script>

<style lang="scss" scoped></style>
