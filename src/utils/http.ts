import { useMemberStore } from '@/stores/modules/member'

const baseURl = 'https://pcapi-xiaotuxian-front-devtest.itheima.net'

/**
 * 为uni-app的respuest方法添加拦截器
 * 拦截器可以统一处理HTTP请求的响应，例如处理错误信息、统一处理返回数据等
 * @param httpInterceptor - 自定义的拦截器函数，用于处理响应数据
 */

const httpInterceptor = {
  invoke(options: UniApp.RequestOptions) {
    if (!options.url.startsWith('http')) {
      options.url = baseURl + options.url
    }
    options.timeout = 50000
    options.header = {
      ...options.header,
      'source-client': 'miniapp',
    }
    const MemberStore = useMemberStore()
    const token = MemberStore.profile?.token
    if (token) {
      options.header.Authorization = token
    }
    console.log(options)
  },
}

uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

interface Date<T> {
  code: string
  msg: string
  result: T
}

//重写了一个axios，也是uni.request,监听原本的axios的返回值，得到返回的结果,来给他设置响应拦截器,options就是原本的axios
const http = <T>(options: UniApp.RequestOptions) => {
  return new Promise<Date<T>>((resolve, reject) => {
    uni.request({
      ...options,
      success(res) {
        //成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          //浏览器返回的状态码，判断网络的
          resolve(res.data as Date<T>)
          //登录过期的错误
        } else if (res.statusCode === 401) {
          const MemberStore = useMemberStore()
          MemberStore.clearProfile()
          uni.navigateTo({ url: '/page/lohin/login' })
          reject(res)
        } else {
          //其他错误,抛出轻提示
          uni.showToast({
            title: (res.data as Date<T>).msg || '请求错误',
            icon: 'none',
          })
        }
      },
      fail(err) {
        //响应失败,无返回值
        uni.showToast({
          icon: 'none',
          title: '网络错误,换个网络',
        })
        reject(err)
      },
    })
  })
}

export default http
