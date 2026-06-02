<script setup lang="ts">
import { getMemberProfileAPI, putMemberProfileAPI } from './services/profile'
import { useMemberStore } from '@/stores'
import type { Gender, ProfileDetail } from '@/types/member'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

const profile = ref<ProfileDetail>({} as ProfileDetail)
const useMember = useMemberStore()
const getMemberProfile = async () => {
  const res = await getMemberProfileAPI()
  profile.value = res.result
  console.log(res.result)
}

//修改头像
const onAvaterChang = () => {
  uni.chooseMedia({
    count: 1,
    mediaType: ['image'],
    success: (res) => {
      const tempFilePath = res.tempFiles[0].tempFilePath

      uni.uploadFile({
        // ✅ 替换这里的 YOUR_API_KEY
        url: 'https://api.imgbb.com/1/upload?key=85e9b571a8ea3c155068a417ca77f9b0',
        name: 'image',
        filePath: tempFilePath,
        success: (uploadRes) => {
          if (uploadRes.statusCode === 200) {
            const data = JSON.parse(uploadRes.data)
            if (data.success) {
              const imageUrl = data.data.url
              console.log('图片上传成功，地址：', imageUrl)

              const result = {
                code: 200,
                message: '头像上传成功',
                result: {
                  avatar: imageUrl,
                },
              }
              console.log(result)
              profile.value!.avatar = result.result.avatar
              useMember.profile!.avatar = result.result.avatar
              uni.showToast({ icon: 'success', title: '更新成功' })
            }
          }
        },
        fail: (err) => {
          uni.showToast({ icon: 'error', title: '出现错误' })
        },
      })
    },
  })
}

const onGenderChange: UniHelper.RadioGroupOnChange = (ev) => {
  profile.value.gender = ev.detail.value as Gender
}

const onBirthdayChang: UniHelper.DatePickerOnChange = (ev) => {
  profile.value.birthday = ev.detail.value
}

let code: [string, string, string] = ['', '', '']
const onFullLocationChange = (ev: any) => {
  console.log(ev.detail)
  profile.value.fullLocation = ev.detail.value.join(' ')
  code = ev.detail.code!
}

const onSubmit = async () => {
  const { nickname, gender, birthday, profession } = profile.value
  const res = await putMemberProfileAPI({
    nickname,
    gender,
    birthday,
    profession,
    provinceCode: code[0],
    cityCode: code[1],
    countyCode: code[2],
  })
  useMember.profile!.nickname = res.result.nickname
  uni.showToast({ icon: 'success', title: '修改成功' })
  setTimeout(() => {
    uni.navigateBack()
  }, 500)
}

onLoad(() => {
  getMemberProfile()
})
</script>

<template>
  <view class="viewport">
    <!-- 导航栏 -->
    <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
      <navigator open-type="navigateBack" class="back icon-left" hover-class="none"></navigator>
      <view class="title">个人信息</view>
    </view>
    <!-- 头像 -->
    <view class="avatar">
      <view class="avatar-content" @tap="onAvaterChang">
        <image class="image" :src="useMember.profile?.avatar" mode="aspectFill" />
        <text class="text">点击修改头像</text>
      </view>
    </view>
    <!-- 表单 -->
    <view class="form">
      <!-- 表单内容 -->
      <view class="form-content">
        <view class="form-item">
          <text class="label">账号</text>
          <text class="account">{{ profile?.account }}</text>
        </view>
        <view class="form-item">
          <text class="label">昵称</text>
          <input class="input" type="text" placeholder="请填写昵称" v-model="profile!.nickname" />
        </view>
        <view class="form-item">
          <text class="label">性别</text>
          <radio-group @change="onGenderChange">
            <label class="radio">
              <radio value="男" color="#27ba9b" :checked="profile?.gender === '男'" />
              男
            </label>
            <label class="radio">
              <radio value="女" color="#27ba9b" :checked="profile?.gender === '女'" />
              女
            </label>
          </radio-group>
        </view>
        <view class="form-item">
          <text class="label">生日</text>
          <picker
            class="picker"
            mode="date"
            start="1900-01-01"
            :end="new Date()"
            :value="profile?.birthday"
            @change="onBirthdayChang"
          >
            <view v-if="profile?.birthday">{{ profile?.birthday }}</view>
            <view class="placeholder" v-else>请选择日期</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">城市</text>
          <picker
            class="picker"
            mode="region"
            :value="profile?.fullLocation?.split(' ')"
            @change="onFullLocationChange"
          >
            <view v-if="profile?.fullLocation">{{ profile?.fullLocation }}</view>
            <view class="placeholder" v-else>请选择城市</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">职业</text>
          <input class="input" type="text" placeholder="请填写职业" v-model="profile.profession" />
        </view>
      </view>
      <!-- 提交按钮 -->
      <button class="form-button" @tap="onSubmit">保 存</button>
    </view>
  </view>
</template>

<style lang="scss">
page {
  background-color: #f4f4f4;
}

.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/order_bg.png);
  background-size: auto 420rpx;
  background-repeat: no-repeat;
}

// 导航栏
.navbar {
  position: relative;

  .title {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
  }

  .back {
    position: absolute;
    height: 40px;
    width: 40px;
    left: 0;
    font-size: 20px;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

// 头像
.avatar {
  text-align: center;
  width: 100%;
  height: 260rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background-color: #eee;
  }

  .text {
    display: block;
    padding-top: 20rpx;
    line-height: 1;
    font-size: 26rpx;
    color: #fff;
  }
}

// 表单
.form {
  background-color: #f4f4f4;

  &-content {
    margin: 20rpx 20rpx 0;
    padding: 0 20rpx;
    border-radius: 10rpx;
    background-color: #fff;
  }

  &-item {
    display: flex;
    height: 96rpx;
    line-height: 46rpx;
    padding: 25rpx 10rpx;
    background-color: #fff;
    font-size: 28rpx;
    border-bottom: 1rpx solid #ddd;

    &:last-child {
      border: none;
    }

    .label {
      width: 180rpx;
      color: #333;
    }

    .account {
      color: #666;
    }

    .input {
      flex: 1;
      display: block;
      height: 46rpx;
    }

    .radio {
      margin-right: 20rpx;
    }

    .picker {
      flex: 1;
    }
    .placeholder {
      color: #808080;
    }
  }

  &-button {
    height: 80rpx;
    text-align: center;
    line-height: 80rpx;
    margin: 30rpx 20rpx;
    color: #fff;
    border-radius: 80rpx;
    font-size: 30rpx;
    background-color: #27ba9b;
  }
}
</style>
