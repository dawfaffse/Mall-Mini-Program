<script setup lang="ts">
import type { BannerItem } from '@/types/home'
import { nextTick, onMounted, ref } from 'vue'

const activeIndex = ref(0)
//在 <script setup> + TS 模式下，Vue 会自动把泛型变成校验规则，不需要你手动写一遍！
const props = defineProps<{
  list: BannerItem[]
}>()

// 当 swiper 下标发生变化时触发
const onChange: UniHelper.SwiperOnChange = (ev) => {
  activeIndex.value = ev.detail.current
  console.log('当前', ev.detail.current)
}
</script>

<template>
  <view class="carousel">
    <swiper :circular="true" :autoplay="true" :interval="3000" @change="onChange">
      <swiper-item v-for="item in list" :key="item.id">
        <navigator url="/pages/goods/goods?id=3465081" hover-class="none" class="navigator">
          <image
            mode="aspectFill"
            class="image"
            :src="item.imgUrl.replace('http://', 'https://')"
          ></image>
        </navigator>
      </swiper-item>
    </swiper>
    <!-- 指示点 -->
    <view class="indicator">
      <text
        v-for="(item, index) in list"
        :key="item.id"
        class="dot"
        :class="{ active: activeIndex === index }"
      ></text>
    </view>
  </view>
</template>

<style lang="scss">
/* 轮播图 */
.carousel {
  height: 280rpx;
  position: relative;
  overflow: hidden;
  transform: translateY(0);
  background-color: #efefef;
  .indicator {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 16rpx;
    display: flex;
    justify-content: center;
    .dot {
      width: 30rpx;
      height: 6rpx;
      margin: 0 8rpx;
      border-radius: 6rpx;
      background-color: rgba(255, 255, 255, 0.4);
    }
    .active {
      background-color: #fff;
    }
  }
  .navigator,
  .image {
    width: 100%;
    height: 100%;
  }
}
</style>
