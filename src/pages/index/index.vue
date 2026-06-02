<script setup lang="ts">
import CustomNavbar from './components/CustomNavbar.vue'
import { onLoad } from '@dcloudio/uni-app'
import { getHomeBannerAPI, getHomeCategoryAPI, getHomeHotPanelAPI } from '@/services/home'
import { nextTick, ref } from 'vue'
import type { BannerItem, CategoryItem, HotItem } from '@/types/home'
import CategoryPanel from './components/CategoryPanel.vue'
import HotPanel from './components/HotPanel.vue'

import type { XtxGuessInstance, XtxSwiperInstance } from '@/types/components'
import PageSkeleton from './components/PageSkeleton.vue'
import { useGuessList } from '@/composables'

const imgsList = ref<BannerItem[]>([])

const isTrigger = ref<boolean>(false)
const getHomeBannerData = async () => {
  const res = await getHomeBannerAPI(1)
  console.log('轮播图', res)
  imgsList.value = res.result
}
const categoryList = ref<CategoryItem[]>([])

const getHomeCategory = async () => {
  const res = await getHomeCategoryAPI()
  categoryList.value = res.result
}

const HomeHotPanelList = ref<HotItem[]>([])
const getHomeHotPanel = async () => {
  const res = await getHomeHotPanelAPI()
  HomeHotPanelList.value = res.result
}

const { onScrolltolower, guessRef } = useGuessList()
const isShow = ref<boolean>(true)
//监听下拉刷新事件
const onRefresherrefresh = async () => {
  isShow.value = true

  isTrigger.value = true
  // await getHomeBannerData()
  // await getHomeCategory()
  // await getHomeHotPanel()
  //让这三个可以一起执行,不用一个一个等
  guessRef.value?.resetData()

  await Promise.all([getHomeBannerData(), getHomeCategory(), getHomeHotPanel()])

  guessRef.value?.getMore()
  isTrigger.value = false
  isShow.value = false
}
//要给这个组件的实例也创建一个类型

onLoad(() => {
  isShow.value = true
  Promise.all([getHomeBannerData(), getHomeCategory(), getHomeHotPanel()])
  isShow.value = false
})
</script>

<template>
  <CustomNavbar></CustomNavbar>
  <scroll-view
    refresher-enabled
    @refresherrefresh="onRefresherrefresh"
    :refresher-triggered="isTrigger"
    scroll-y
    @scrolltolower="onScrolltolower"
    class="scroll"
  >
    <PageSkeleton v-if="isShow"></PageSkeleton>
    <template v-else>
      <Xtx-Swiper :list="imgsList"></Xtx-Swiper>
      <CategoryPanel :list="categoryList"></CategoryPanel>
      <HotPanel :list="HomeHotPanelList"></HotPanel>
      <Xtx-Guess ref="guessRef"></Xtx-Guess>
    </template>
  </scroll-view>
</template>

<style lang="scss">
page {
  background-color: #f7f7f7;
  height: 100%;
  display: flex;
  flex-direction: column;
}
//必须让滚动的页面占据剩余的所以高度,才会触发触底效果
.scroll {
  flex: 1;
  height: 0;
}
</style>
