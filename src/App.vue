<template>
  <div id="app" class="full flex">
    <navBar></Navbar>
    <mainBody class="flex-1"></mainBody>
  </div>
</template>

<script>

    import navBar from "./layout/navbar";
    import mainBody from "./layout/mainBody";

    export default {
        name: 'app',
        data() {
            return {
            }
        },
        components: {navBar, mainBody}
    }
</script>

<style scoped lang="scss">
  .navBar {
    width: 300px;
    border-right: 1px solid red;
  }
</style>
