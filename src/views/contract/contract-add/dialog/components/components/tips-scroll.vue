<template>
  <div class="textBox">
    <transition name="slide">
      <p class="text" :key="text.id">{{text.val}}</p>
    </transition>
  </div>
</template>

<script>
  export default {
    name: "tips-scroll",
    props: ['tips'],
    data() {
      return {
        number: 0
      }
    },
    computed: {
      text() {
        return {
          id: this.number,
          val: this.tips[this.number]
        }
      }
    },
    mounted() {
      this.startMove()
    },
    methods: {
      startMove() {
        setTimeout(() => {
          if (this.number === this.tips.length - 1) {
            this.number = 0;
          } else {
            this.number += 1;
          }
          this.startMove();
        }, 3000); // 滚动不需要停顿则将2000改成动画持续时间
      }
    }
  }
</script>

<style scoped>
  .textBox {
    width: 400px;
    height: 32px;
    line-height: 32px;
    overflow: hidden;
    position: relative;
    text-align: center;
    display: inline-block;
  }

  .text {
    width: 100%;
    position: absolute;
    bottom: 0;
  }

  .slide-enter-active, .slide-leave-active {
    transition: all 0.5s linear;
  }

  .slide-enter {
    transform: translateY(20px) scale(1);
    opacity: 1;
  }

  .slide-leave-to {
    transform: translateY(-20px) scale(0.8);
    opacity: 0;
  }
</style>
