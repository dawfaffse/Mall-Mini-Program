import type {
  OrderCreateParams,
  OrderCreateResult,
  OrderListParams,
  OrderListResult,
  OrderLogisticResult,
  OrderPreResult,
  OrderResult,
  OrderSkuItem,
} from '@/types/order'
import http from '@/utils/http'

export const getMerberOrderAPI = () => {
  return http<OrderPreResult>({
    method: 'GET',
    url: '/member/order/pre',
  })
}

export const getNewOrderAPI = (data: { skuId: string; count: string; addressId?: string }) => {
  return http<OrderPreResult>({
    method: 'GET',
    url: '/member/order/pre/now',
    data,
  })
}

export const pustMerberOrderAPI = (data: OrderCreateParams) => {
  return http<OrderCreateResult>({
    method: 'POST',
    url: '/member/order',
    data,
  })
}

export const getOrderAPI = (id: string) => {
  return http<OrderResult>({
    method: 'GET',
    url: `/member/order/${id}`,
  })
}

//获取再次购买订单

export const getAgainOrderAPI = (id: string) => {
  return http<OrderPreResult>({
    method: 'GET',
    url: `/member/order/repurchase/${id}`,
  })
}

//取消订单
export const putOrderAPI = (id: string, data: { cancelReason: string }) => {
  return http<OrderResult>({
    method: 'PUT',
    url: `/member/order/${id}/cancel`,
    data,
  })
}

/**
 * 模拟发货-内测版
 * @description 在DEV环境下使用，仅在订单状态为待发货时，可模拟发货，调用后订单状态修改为待收货，包含模拟物流。
 * @param id 订单id
 */
export const getMemberOrderConsignmentByIdAPI = (id: string) => {
  return http({
    method: 'GET',
    url: `/member/order/consignment/${id}`,
  })
}

/**
 * 确认收货
 * @description 仅在订单状态为待收货时，可确认收货。
 * @param id 订单id
 */
export const putMemberOrderReceiptByIdAPI = (id: string) => {
  return http<OrderResult>({
    method: 'PUT',
    url: `/member/order/${id}/receipt`,
  })
}

/**
 * 获取订单物流
 * @description 仅在订单状态为待收货，待评价，已完成时，可获取物流信息。
 * @param id 订单id
 */
export const getMemberOrderLogisticsByIdAPI = (id: string) => {
  return http<OrderLogisticResult>({
    method: 'GET',
    url: `/member/order/${id}/logistics`,
  })
}

/**
 * 删除订单
 * @description 仅在订单状态为待评价，已完成，已取消时，可删除订单。
 * @param data ids 订单集合
 */
export const deleteMemberOrderAPI = (data: { ids: string[] }) => {
  return http({
    method: 'DELETE',
    url: `/member/order`,
    data,
  })
}

/**
 * 获取订单列表
 * @param data orderState 订单状态
 */
export const getMemberOrderAPI = (data: OrderListParams) => {
  return http<OrderListResult>({
    method: 'GET',
    url: `/member/order`,
    data,
  })
}
