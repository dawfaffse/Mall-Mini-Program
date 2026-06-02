import type { AddressItem, AddressParams } from '@/types/adderss'
import http from '@/utils/http'

export const postMemberAddressAPI = (data: AddressParams) => {
  return http({
    method: 'POST',
    url: '/member/address',
    data,
  })
}

export const getMemberAddressAPI = () => {
  return http<AddressItem[]>({
    method: 'GET',
    url: '/member/address',
  })
}

export const getMemberAddressByIdAPI = (id: string) => {
  return http<AddressItem>({
    method: 'GET',
    url: `/member/address/${id}`,
  })
}

export const putMemberAddressByIdAPI = (id: string, data: AddressParams) => {
  return http<AddressItem>({
    method: 'PUT',
    url: `/member/address/${id}`,
    data,
  })
}

export const deleteAddressByIdAPI = (id: string) => {
  return http<AddressItem>({
    method: 'DELETE',
    url: `/member/address/${id}`,
  })
}
