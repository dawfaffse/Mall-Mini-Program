<script setup lang="ts">
import { ref } from 'vue'
import OrderList from './components.vue/OrderList.vue'
import { getPayAPI, getPayWxOayMinPayAPI } from '@/pagersOrder/order/services/pay'
import type { OrderItem, OrderListParams } from '@/types/order'
import { deleteMemberOrderAPI, getMemberOrderAPI } from '@/pagersOrder/order/services/order'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useGuessList } from '@/composables'
import { useMemberStore } from '@/stores'

// tabs 数据
const orderTabs = ref([
  { orderState: 0, title: '全部' },
  { orderState: 1, title: '待付款' },
  { orderState: 2, title: '待发货' },
  { orderState: 3, title: '待收货' },
  { orderState: 4, title: '待评价' },
])

const query = defineProps<{
  type: string
}>()
const memberStore = useMemberStore()

const queryParams: any = {
  page: 1,
  pageSize: 5,
}
// 初始化一个长度为5的空数组
const orderList = ref<OrderItem[][]>([[], [], [], [], []])
const getMemberOrder = async (orderState: number) => {
  const queryParam = {
    ...queryParams,
    orderState,
  }
  const res = await getMemberOrderAPI(queryParam)
  orderList.value![orderState] = res.result.items
}

const activeIndex = ref(Number(query.type))
const getList = () => {
  getMemberOrder(0)
  getMemberOrder(1)
  getMemberOrder(2)
  getMemberOrder(3)
  getMemberOrder(4)
}

const onScro = async (state: number) => {
  if (finish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了' })
  } else {
    const queryParam = {
      ...queryParams,
      state,
    }
    const res = await getMemberOrderAPI(queryParam)
    console.log(res.result.pages)
    if (queryParams.page < res.result.pages) {
      queryParams.page++

      orderList.value![state].push(...res.result.items)
    } else if (queryParams.page >= res.result.pages) {
      finish.value = true
    }
  }
}

//删除订单的事件

const finish = ref(false)
const isLoading = ref(false)

onShow(() => {
  // 未登录
  if (!memberStore.profile) {
    isLoading.value = true
    uni.showLoading({
      title: '请先登录...',
      mask: true, // 禁止用户点击
    })

    // 销毁当前页并跳登录
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/login/login',
        success: () => {
          // 跳转成功后关闭 loading
          uni.hideLoading()
          isLoading.value = false
        },
        fail: () => {
          // 跳转失败也要关闭 loading，避免卡死
          uni.hideLoading()
          isLoading.value = false
          uni.showToast({
            title: '跳转失败，请重试',
            icon: 'none',
          })
        },
      })
    }, 500)

    return
  }

  // 已登录才加载数据
  getList()
})
</script>

<template>
  <view class="viewport">
    <!-- tabs -->
    <view class="tabs">
      <text
        class="item"
        v-for="(item, index) in orderTabs"
        :key="item.orderState"
        @tap="activeIndex = index"
      >
        {{ item.title }}
      </text>
      <!-- 游标 -->
      <view class="cursor" :style="{ left: activeIndex * 20 + '%' }"></view>
      <!-- //动态设置滑块的位置,0可以变成动态的数据,比如你选中的选项索引,因为每个占20% -->
    </view>
    <!-- 滑动容器 -->
    <swiper class="swiper" :current="activeIndex" @change="activeIndex = $event.detail.current">
      <!-- 滑动项 -->
      <swiper-item v-for="(item, index) in orderTabs" :key="item.orderState">
        <!-- 订单列表 -->
        <OrderList
          :orderState="[orderList![index],index]"
          @changeState="getList()"
          ref="guessRef"
          @onScrolltolower="onScro"
          :finish="finish"
        ></OrderList>
      </swiper-item>
    </swiper>
  </view>
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
  background-color: #fff;
}

// tabs
.tabs {
  display: flex;
  justify-content: space-around;
  line-height: 60rpx;
  margin: 0 10rpx;
  background-color: #fff;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);
  position: relative;
  z-index: 9;

  .item {
    flex: 1;
    text-align: center;
    padding: 20rpx;
    font-size: 28rpx;
    color: #262626;
  }

  .cursor {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 20%;
    height: 6rpx;
    padding: 0 50rpx;
    background-color: #27ba9b;
    /* 过渡效果 */
    transition: all 0.4s;
  }
}

// swiper
.swiper {
  background-color: #f7f7f8;
}
</style>
