<script setup lang="ts">
import { useGuessList } from '@/composables'
import { OrderState, orderStateList } from '@/pagersOrder/order/services/constants'
import {
  deleteMemberOrderAPI,
  getAgainOrderAPI,
  getMemberOrderConsignmentByIdAPI,
  getMemberOrderLogisticsByIdAPI,
  getOrderAPI,
  putMemberOrderReceiptByIdAPI,
  putOrderAPI,
} from '@/pagersOrder/order/services/order'
import type { LogisticItem, OrderLogisticResult, OrderResult, OrderSkuItem } from '@/types/order'
import { onLoad, onReady } from '@dcloudio/uni-app'

import { ref } from 'vue'
import PageSkeletons from './components/PageSkeletons.vue'
import { getPayAPI, getPayWxOayMinPayAPI } from '@/pagersOrder/order/services/pay'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 猜你喜欢
const { guessRef, onScrolltolower } = useGuessList()
// 弹出层组件
const popup = ref<UniHelper.UniPopupInstance>()
// 取消原因列表
const reasonList = ref([
  '商品无货',
  '不想要了',
  '商品信息填错了',
  '地址信息填写错误',
  '商品降价',
  '其它',
])
// 订单取消原因
const reason = ref('')
// 复制内容
const onCopy = (id: string) => {
  // 设置系统剪贴板的内容
  uni.setClipboardData({ data: id })
}
// 获取页面参数
const query = defineProps<{
  id: string
}>()

//获取页面栈(即页面之前的页面历史记录)
const pages = getCurrentPages()
//获取当前页面实例(最后一项)
const pageInstance = pages.at(-1) as any

//取消订单
// 取消订单 【修复参数】
const putOrder = async (id: string) => {
  // 必传参数校验
  if (!id) return
  // 传入 订单id + 取消原因
  await putOrderAPI(id, { cancelReason: reason.value })
  // 关闭弹窗 + 提示 + 刷新页面
  popup.value?.close()
  uni.showToast({ title: '订单已取消' })
  getOrder()
}

//动画效果要等页面渲染完成
onReady(() => {
  // 滚动时导航栏渐变：透明 → 灰色
  pageInstance.animate(
    '.navbar',
    [
      { backgroundColor: 'transparent' }, // 开始：透明
      { backgroundColor: '#f8f8f8' }, // 结束：灰色
    ],
    1000, // 过渡时间
    {
      scrollSource: '#scroller', // 滚动的 scroll-view ID
      timeRange: 1000, // 动画时间范围
      startScrollOffset: 0, // 从 120px 开始渐变
      endScrollOffset: 50, // 到 252px 结束渐变（✅ 修复拼写）
    },
  )
  // 动画效果,导航栏标题
  pageInstance.animate('.navbar .title', [{ color: 'transparent' }, { color: '#000' }], 1000, {
    scrollSource: '#scroller',
    timeRange: 1000,
    startScrollOffset: 0,
    endScrollOffset: 50,
  })
  // 动画效果,导航栏返回按钮
  pageInstance.animate('.navbar .back', [{ color: '#fff' }, { color: '#000' }], 1000, {
    scrollSource: '#scroller',
    timeRange: 1000,
    startScrollOffset: 0,
    endScrollOffset: 50,
  })
})

const Order = ref<OrderResult>()
const getOrder = async () => {
  console.log(query.id)
  const res = await getOrderAPI(query.id)
  Order.value = res.result
  console.log('数据', res.result)
  if (
    [OrderState.DaiShouHuo, OrderState.DaiPingJia, OrderState.YiWanCheng].includes(
      Order.value!.orderState,
    )
  ) {
    getMemberOrderLogisticsByIz()
  }
}
//倒计时结束事件
const onTimeUp = () => {
  //修改订单状态
  Order.value!.orderState = OrderState.YiQuXiao
}

const onOrderPay = async () => {
  try {
    if (import.meta.env.DEV) {
      // 开发环境：模拟支付
      await getPayAPI({ orderId: query.id })

      // ✅ 支付成功 → 关闭当前页，跳支付结果页（无法返回）
      uni.redirectTo({
        url: `/pagersOrder/payment/payment?id=${query.id}`,
      })
    } else {
      // 真实微信支付
      const res = await getPayWxOayMinPayAPI({ orderId: query.id })

      // 调用微信支付
      //#ifdef Mp-WEIXIN
      wx.requestPayment({
        ...res.result,

        // 支付成功
        success: () => {
          console.log('支付成功')
          // ✅ 关闭当前页 → 跳支付结果页
          uni.redirectTo({
            url: `/pagersOrder/payment/payment?id=${query.id}`,
          })
        },

        // 支付取消/失败
        fail: () => {
          uni.showToast({
            title: '支付取消',
            icon: 'none',
          })
        },
      })
      //#endif
    }
  } catch (err) {
    console.error('支付异常', err)
    uni.showToast({ title: '支付失败', icon: 'none' })
  }
}

const onOrederConfirm = () => {
  uni.showModal({
    content: '为保障您的权益，请收到货并确认无误后，再确认收货',
    showCancel: true, //false为只显示确定按钮
    success: async (res) => {
      if (res.confirm) {
        await putMemberOrderReceiptByIdAPI(query.id)
        getOrder()
      }
    },
  })
}

const LogisticsById = ref<LogisticItem[]>([])

const getMemberOrderLogisticsByIz = async () => {
  const res = await getMemberOrderLogisticsByIdAPI(query.id)
  if (
    [OrderState.DaiShouHuo, OrderState.DaiPingJia, OrderState.YiWanCheng].includes(
      Order.value!.orderState,
    )
  ) {
    LogisticsById.value = res.result.list
    console.log('物理', res.result)
  }
}
//是否为开发环境
const isDev = import.meta.env.DEV

const onOrederSend = async () => {
  if (isDev) {
    //非开发环境这些代码不会生成就不会自动报错
    await getMemberOrderConsignmentByIdAPI(query.id)
    //主动更新订单状态
    uni.showToast({ icon: 'success', title: '模拟发货完成' })
    getOrder()
  }
}
//控制折叠层展开闭合的响应式数据
const op = ref(false)

//删除订单的事件
const onOrderDelect = async () => {
  uni.showModal({
    title: '确定要删除订单吗?',
    success: async (res) => {
      if (res.confirm) {
        await deleteMemberOrderAPI({ ids: [query.id] })
        uni.redirectTo({ url: '/pagersOrder/list/list?type=0' })
      }
    },
  })
}
onLoad(() => {
  getOrder()
})
</script>

<template>
  <!-- 自定义导航栏: 默认透明不可见, scroll-view 滚动到 50 时展示 -->
  <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
    <view class="wrap">
      <navigator
        v-if="pages.length > 1"
        open-type="navigateBack"
        class="back icon-left"
      ></navigator>
      <navigator v-else url="/pages/index/index" open-type="switchTab" class="back icon-home">
      </navigator>
      <view class="title">订单详情</view>
    </view>
  </view>
  <scroll-view scroll-y class="viewport" id="scroller" @scrolltolower="onScrolltolower">
    <template v-if="Order">
      <!-- 订单状态 -->
      <view class="overview" :style="{ paddingTop: safeAreaInsets!.top + 20 + 'px' }">
        <!-- 待付款状态:展示去支付按钮和倒计时 -->
        <template v-if="Order?.orderState === OrderState.DaiFuKuan">
          <view class="status icon-clock">等待付款</view>
          <view class="tips">
            <text class="money">应付金额: ¥ {{ Order.payMoney }}</text>
            <text class="time">支付剩余</text>
            <uni-countdown
              color="#fff"
              :show-day="false"
              splitor-color="#fff"
              :second="Order.countdown"
              @timeup="onTimeUp"
            ></uni-countdown>
          </view>
          <view class="button" @tap="onOrderPay">去支付</view>
        </template>
        <!-- 其他订单状态:展示再次购买按钮 -->
        <template v-else>
          <!-- 订单状态文字 -->
          <view class="status"> {{ orderStateList[Order.orderState].text }} </view>
          <view class="button-group">
            <navigator
              class="button"
              :url="`/pagersOrder/creste/creste?orderId=${query.id}`"
              hover-class="none"
            >
              再次购买
            </navigator>
            <!-- 待发货状态：模拟发货,开发期间使用,用于修改订单状态为已发货 -->
            <view
              v-if="isDev && Order.orderState === OrderState.DaiFaHuo"
              @tap="onOrederSend"
              class="button"
            >
              模拟发货
            </view>
            <view
              v-if="Order.orderState === OrderState.DaiShouHuo"
              @tap="onOrederConfirm"
              class="button"
            >
              确认收货
            </view>
          </view>
        </template>
      </view>
      <!-- 配送状态 -->
      <view class="shipment">
        <uni-collapse v-model="op">
          <uni-collapse-item title="物流信息">
            <!-- 订单物流信息 -->
            <view v-for="item in LogisticsById" :key="item.id" class="item">
              <view class="message">
                {{ item.text }}
              </view>
              <view class="date"> {{ item.time }} </view>
            </view>
          </uni-collapse-item>
        </uni-collapse>
        <!-- 用户收货地址 -->
        <view class="locate">
          <view class="user">{{ Order?.receiverContact }}</view>
          <view class="address">{{ Order?.receiverAddress }}</view>
        </view>
      </view>

      <!-- 商品信息 -->
      <view class="goods">
        <view class="item">
          <navigator
            class="navigator"
            v-for="item in Order.skus"
            :key="item.id"
            :url="`/pages/goods/goods?id=${item.id}`"
            hover-class="none"
          >
            <image class="cover" :src="item.image"></image>
            <view class="meta">
              <view class="name ellipsis">{{ item.name }}</view>
              <view class="type">{{ item.attrsText }}</view>
              <view class="price">
                <view class="actual">
                  <text class="symbol">¥</text>
                  <text>{{ item.curPrice }}</text>
                </view>
              </view>
              <view class="quantity">x{{ item.quantity }}</view>
            </view>
          </navigator>
          <!-- 待评价状态:展示按钮 -->
          <view class="action" v-if="Order.orderState === OrderState.DaiPingJia">
            <view class="button primary">申请售后</view>
            <navigator url="" class="button"> 去评价 </navigator>
          </view>
        </view>
        <!-- 合计 -->
        <view class="total">
          <view class="row">
            <view class="text">商品总价: </view>
            <view class="symbol">{{ Order.totalMoney }}</view>
          </view>
          <view class="row">
            <view class="text">运费: </view>
            <view class="symbol">{{ Order.postFee }}</view>
          </view>
          <view class="row">
            <view class="text">应付金额: </view>
            <view class="symbol primary">{{ Order.payMoney }}</view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="detail">
        <view class="title">订单信息</view>
        <view class="row">
          <view class="item">
            订单编号: {{ query.id }} <text class="copy" @tap="onCopy(query.id)">复制</text>
          </view>
          <view class="item">下单时间: {{ Order.createTime }}</view>
        </view>
      </view>

      <!-- 猜你喜欢 -->
      <Xtx-Guess ref="guessRef" />

      <!-- 底部操作栏 -->
      <view class="toolbar-height" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }"></view>
      <view class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
        <!-- 待付款状态:展示支付按钮 -->
        <template v-if="Order.orderState === OrderState.DaiFuKuan">
          <view class="button primary" @tap="onOrderPay"> 去支付 </view>
          <view class="button" @tap="popup?.open?.()"> 取消订单 </view>
        </template>
        <!-- 其他订单状态:按需展示按钮 -->
        <template v-else>
          <navigator
            class="button secondary"
            :url="`/pagersOrder/creste/creste?orderId=${query.id}`"
            hover-class="none"
          >
            再次购买
          </navigator>
          <!-- 待收货状态: 展示确认收货 -->
          <view class="button primary" v-if="Order.orderState === OrderState.DaiShouHuo">
            确认收货
          </view>
          <!-- 待评价状态: 展示去评价 -->
          <view class="button" v-if="Order.orderState === OrderState.DaiPingJia"> 去评价 </view>
          <!-- 待评价/已完成/已取消 状态: 展示删除订单 -->
          <view
            class="button delete"
            v-if="
              Order.orderState === OrderState.DaiPingJia ||
              OrderState.YiQuXiao ||
              OrderState.YiWanCheng
            "
            @tap="onOrderDelect"
          >
            删除订单
          </view>
        </template>
      </view>
    </template>
    <template v-else>
      <!-- 骨架屏组件 -->
      <PageSkeletons />
    </template>
  </scroll-view>
  <!-- 取消订单弹窗 -->
  <uni-popup ref="popup" type="bottom" background-color="#fff">
    <view class="popup-root">
      <view class="title">订单取消</view>
      <view class="description">
        <view class="tips">请选择取消订单的原因：</view>
        <view class="cell" v-for="item in reasonList" :key="item" @tap="reason = item">
          <text class="text">{{ item }}</text>
          <text class="icon" :class="{ checked: item === reason }"></text>
        </view>
      </view>
      <view class="footer">
        <view class="button" @tap="popup?.close?.()">取消</view>
        <view class="button primary" @tap="putOrder(query.id)">确认</view>
      </view>
    </view>
  </uni-popup>
</template>

<style lang="scss">
page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.navbar {
  width: 750rpx;
  color: #000;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
  /* background-color: #f8f8f8; */
  background-color: transparent;

  .wrap {
    position: relative;

    .title {
      height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 32rpx;
      /* color: #000; */
      color: transparent;
    }

    .back {
      position: absolute;
      left: 0;
      height: 44px;
      width: 44px;
      font-size: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      /* color: #000; */
      color: #fff;
    }
  }
}

.viewport {
  background-color: #f7f7f8;
}

.overview {
  display: flex;
  flex-direction: column;
  align-items: center;

  line-height: 1;
  padding-bottom: 30rpx;
  color: #fff;
  background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/order_bg.png);
  background-size: cover;

  .status {
    font-size: 36rpx;
  }

  .status::before {
    margin-right: 6rpx;
    font-weight: 500;
  }

  .tips {
    margin: 30rpx 0;
    display: flex;
    font-size: 14px;
    align-items: center;

    .money {
      margin-right: 30rpx;
    }
  }

  .button-group {
    margin-top: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button {
    width: 260rpx;
    height: 64rpx;
    margin: 0 10rpx;
    text-align: center;
    line-height: 64rpx;
    font-size: 28rpx;
    color: #27ba9b;
    border-radius: 68rpx;
    background-color: #fff;
  }
}

.shipment {
  line-height: 1.4;
  padding: 0 20rpx;
  margin: 20rpx 20rpx 0;
  border-radius: 10rpx;
  background-color: #fff;

  .locate,
  .item {
    min-height: 120rpx;
    padding: 30rpx 30rpx 25rpx 75rpx;
    background-size: 50rpx;
    background-repeat: no-repeat;
    background-position: 6rpx center;
  }

  .locate {
    background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/locate.png);

    .user {
      font-size: 26rpx;
      color: #444;
    }

    .address {
      font-size: 24rpx;
      color: #666;
    }
  }

  .item {
    background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/car.png);
    border-bottom: 1rpx solid #eee;
    position: relative;

    .message {
      font-size: 26rpx;
      color: #444;
    }

    .date {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.goods {
  margin: 20rpx 20rpx 0;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .item {
    padding: 30rpx 0;
    border-bottom: 1rpx solid #eee;

    .navigator {
      display: flex;
      margin: 20rpx 0;
    }

    .cover {
      width: 170rpx;
      height: 170rpx;
      border-radius: 10rpx;
      margin-right: 20rpx;
    }

    .meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    }

    .name {
      height: 80rpx;
      font-size: 26rpx;
      color: #444;
    }

    .type {
      line-height: 1.8;
      padding: 0 15rpx;
      margin-top: 6rpx;
      font-size: 24rpx;
      align-self: flex-start;
      border-radius: 4rpx;
      color: #888;
      background-color: #f7f7f8;
    }

    .price {
      display: flex;
      margin-top: 6rpx;
      font-size: 24rpx;
    }

    .symbol {
      font-size: 20rpx;
    }

    .original {
      color: #999;
      text-decoration: line-through;
    }

    .actual {
      margin-left: 10rpx;
      color: #444;
    }

    .text {
      font-size: 22rpx;
    }

    .quantity {
      position: absolute;
      bottom: 0;
      right: 0;
      font-size: 24rpx;
      color: #444;
    }

    .action {
      display: flex;
      flex-direction: row-reverse;
      justify-content: flex-start;
      padding: 30rpx 0 0;

      .button {
        width: 200rpx;
        height: 60rpx;
        text-align: center;
        justify-content: center;
        line-height: 60rpx;
        margin-left: 20rpx;
        border-radius: 60rpx;
        border: 1rpx solid #ccc;
        font-size: 26rpx;
        color: #444;
      }

      .primary {
        color: #27ba9b;
        border-color: #27ba9b;
      }
    }
  }

  .total {
    line-height: 1;
    font-size: 26rpx;
    padding: 20rpx 0;
    color: #666;

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10rpx 0;
    }

    .symbol::before {
      content: '¥';
      font-size: 80%;
      margin-right: 3rpx;
    }

    .primary {
      color: #cf4444;
      font-size: 36rpx;
    }
  }
}

.detail {
  line-height: 1;
  padding: 30rpx 20rpx 0;
  margin: 20rpx 20rpx 0;
  font-size: 26rpx;
  color: #666;
  border-radius: 10rpx;
  background-color: #fff;

  .title {
    font-size: 30rpx;
    color: #444;
  }

  .row {
    padding: 20rpx 0;

    .item {
      padding: 10rpx 0;
      display: flex;
      align-items: center;
    }

    .copy {
      border-radius: 20rpx;
      font-size: 20rpx;
      border: 1px solid #ccc;
      padding: 5rpx 10rpx;
      margin-left: 10rpx;
    }
  }
}

.toolbar-height {
  height: 100rpx;
  box-sizing: content-box;
}

.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(var(--window-bottom));
  z-index: 1;

  height: 100rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  border-top: 1rpx solid #ededed;
  border-bottom: 1rpx solid #ededed;
  background-color: #fff;
  box-sizing: content-box;

  .button {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 200rpx;
    height: 72rpx;
    margin-left: 15rpx;
    font-size: 26rpx;
    border-radius: 72rpx;
    border: 1rpx solid #ccc;
    color: #444;
  }

  .delete {
    order: 4;
  }

  .button {
    order: 3;
  }

  .secondary {
    order: 2;
    color: #27ba9b;
    border-color: #27ba9b;
  }

  .primary {
    order: 1;
    color: #fff;
    background-color: #27ba9b;
  }
}

.popup-root {
  padding: 30rpx 30rpx 0;
  border-radius: 10rpx 10rpx 0 0;
  overflow: hidden;

  .title {
    font-size: 30rpx;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .description {
    font-size: 28rpx;
    padding: 0 20rpx;

    .tips {
      color: #444;
      margin-bottom: 12rpx;
    }

    .cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15rpx 0;
      color: #666;
    }

    .icon::before {
      content: '\e6cd';
      font-family: 'erabbit' !important;
      font-size: 38rpx;
      color: #999;
    }

    .icon.checked::before {
      content: '\e6cc';
      font-size: 38rpx;
      color: #27ba9b;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    padding: 30rpx 0 40rpx;
    font-size: 28rpx;
    color: #444;

    .button {
      flex: 1;
      height: 72rpx;
      text-align: center;
      line-height: 72rpx;
      margin: 0 20rpx;
      color: #444;
      border-radius: 72rpx;
      border: 1rpx solid #ccc;
    }

    .primary {
      color: #fff;
      background-color: #27ba9b;
      border: none;
    }
  }
}
</style>
