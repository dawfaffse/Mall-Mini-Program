<script setup lang="ts">
import { getHomeCategoryTopAPI } from '@/services/category'
import { getHomeBannerAPI } from '@/services/home'
import type { CategorysItem, CategoryTopItem } from '@/types/category'
import type { BannerItem } from '@/types/home'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import pageSkeleton from './components/pageSkeleton.vue'

const categoryList: CategorysItem[] = [
  { id: 0, name: '居家' },
  { id: 1, name: '锦鲤' },
  { id: 2, name: '服饰' },
  { id: 3, name: '母婴' },
  { id: 4, name: '个护' },
  { id: 5, name: '严选' },
  { id: 6, name: '数码' },
  { id: 7, name: '运动' },
  { id: 8, name: '杂项' },
  { id: 8, name: '品牌' },
]
const BannerDataList = ref<BannerItem[]>([])
const getBannerData = async () => {
  const res = await getHomeBannerAPI(2)
  BannerDataList.value = res.result
  console.log(res.result)
}
const HomeCategoryTop = ref<CategoryTopItem[]>([])
const getHomeCategoryTop = async () => {
  const res = await getHomeCategoryTopAPI()
  HomeCategoryTop.value = res.result
}
const activeIndex = ref(0)

let isFromEmit = false

const subCategoryTopList = computed(() => {
  return HomeCategoryTop.value[activeIndex.value]?.children || []
})

const isFinish = ref(false)
onLoad(() => {
  isFinish.value = false
  Promise.all([getBannerData(), getHomeCategoryTop()])
  isFinish.value = true
})

// 接收数据
uni.$on('categoryType', (name) => {
  if (name) {
    isFromEmit = true
    console.log('收到类型：', name)
    const cate = categoryList.find((item) => item.name === name)
    activeIndex.value = cate!.id
  } else {
    activeIndex.value = 0
  }
})

onShow(() => {
  // 如果不是首页跳转过来的，说明是手动点 tabBar 进来
  if (!isFromEmit) {
    activeIndex.value = 0
  }
  // 每次执行完重置标记，下次正常判断
  isFromEmit = false
})
</script>

<template>
  <view class="viewport" v-if="isFinish === true">
    <!-- 搜索框 -->
    <view class="search">
      <view class="input">
        <text class="icon-search">女靴</text>
      </view>
    </view>
    <!-- 分类 -->
    <view class="categories">
      <!-- 左侧：一级分类 -->
      <scroll-view class="primary" scroll-y>
        <view
          v-for="(item, index) in HomeCategoryTop"
          :key="item.id"
          class="item"
          @tap="activeIndex = index"
          :class="{ active: index === activeIndex }"
        >
          <text class="name"> {{ item.name }} </text>
        </view>
      </scroll-view>
      <!-- 右侧：二级分类 -->
      <scroll-view class="secondary" scroll-y>
        <!-- 焦点图 -->
        <Xtx-Swiper class="banner" :list="BannerDataList" />
        <!-- 内容区域 -->
        <view class="panel" v-for="item in subCategoryTopList" :key="item.id">
          <view class="title">
            <text class="name">{{ item.name }}</text>
            <navigator class="more" hover-class="none">全部</navigator>
          </view>
          <view class="section">
            <navigator
              v-for="goods in item.goods"
              :key="goods.id"
              class="goods"
              hover-class="none"
              :url="`/pages/goods/goods?id=${goods.id}`"
            >
              <image class="image" :src="goods.picture"></image>
              <view class="name ellipsis">{{ goods.name }}</view>
              <view class="price">
                <text class="symbol">¥</text>
                <text class="number">{{ goods.price }}</text>
              </view>
            </navigator>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
  <pageSkeleton v-else></pageSkeleton>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
}
.viewport {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.search {
  padding: 0 30rpx 20rpx;
  background-color: #fff;
  .input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64rpx;
    padding-left: 26rpx;
    color: #8b8b8b;
    font-size: 28rpx;
    border-radius: 32rpx;
    background-color: #f3f4f4;
  }
}
.icon-search {
  &::before {
    margin-right: 10rpx;
  }
}
/* 分类 */
.categories {
  flex: 1;
  min-height: 400rpx;
  display: flex;
}
/* 一级分类 */
.primary {
  overflow: hidden;
  width: 180rpx;
  flex: none;
  background-color: #f6f6f6;
  .item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 96rpx;
    font-size: 26rpx;
    color: #595c63;
    position: relative;
    &::after {
      content: '';
      position: absolute;
      left: 42rpx;
      bottom: 0;
      width: 96rpx;
      border-top: 1rpx solid #e3e4e7;
    }
  }
  .active {
    background-color: #fff;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 8rpx;
      height: 100%;
      background-color: #27ba9b;
    }
  }
}
.primary .item:last-child::after,
.primary .active::after {
  display: none;
}
/* 二级分类 */
.secondary {
  background-color: #fff;
  .carousel {
    height: 200rpx;
    margin: 0 30rpx 20rpx;
    border-radius: 4rpx;
    overflow: hidden;
  }
  .panel {
    margin: 0 30rpx 0rpx;
  }
  .title {
    height: 60rpx;
    line-height: 60rpx;
    color: #333;
    font-size: 28rpx;
    border-bottom: 1rpx solid #f7f7f8;
    .more {
      float: right;
      padding-left: 20rpx;
      font-size: 24rpx;
      color: #999;
    }
  }
  .more {
    &::after {
      font-family: 'erabbit' !important;
      content: '\e6c2';
    }
  }
  .section {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    padding: 20rpx 0;
    .goods {
      width: 150rpx;
      margin: 0rpx 30rpx 20rpx 0;
      &:nth-child(3n) {
        margin-right: 0;
      }
      image {
        width: 150rpx;
        height: 150rpx;
      }
      .name {
        padding: 5rpx;
        font-size: 22rpx;
        color: #333;
      }
      .price {
        padding: 5rpx;
        font-size: 18rpx;
        color: #cf4444;
      }
      .number {
        font-size: 24rpx;
        margin-left: 2rpx;
      }
    }
  }
}
</style>
