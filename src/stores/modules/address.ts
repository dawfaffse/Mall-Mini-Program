import type { AddressItem } from '@/types/adderss'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const addressStore = defineStore('address', () => {
  const selectAddress = ref<AddressItem>()

  const changeAddressStore = (val: AddressItem) => {
    selectAddress.value = val
  }

  return {
    selectAddress,
    changeAddressStore,
  }
})
