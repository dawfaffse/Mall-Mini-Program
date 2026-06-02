import type { CartItem } from '@/types/cart'
import http from '@/utils/http'

export const postNemberCartAPI = (data: { skuId: string; count: number }) => {
  return http({
    method: 'POST',
    url: '/member/cart',
    data,
  })
}

export const getNemberCartAPI = () => {
  return http<CartItem[]>({
    method: 'GET',
    url: '/member/cart',
  })
}

export const deleteNemberCartAPI = (data: { ids: string[] }) => {
  return http({
    method: 'DELETE',
    url: '/member/cart',
    data,
  })
}

export const putNemberCartAPI = (skuId: string, data: { selected?: Boolean; count?: number }) => {
  return http({
    method: 'PUT',
    url: `/member/cart/${skuId}`,
    data,
  })
}
