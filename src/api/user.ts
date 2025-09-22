// src/apis/user.ts
import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    const res = response.data
    
    // 根据实际API返回结构处理
    if (res.code !== 200) {
      // 处理各种错误情况
      if (res.code === 401) {
        // 未授权
        localStorage.removeItem('token')
        // 可以在这里添加跳转到登录页的逻辑
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res.data
  },
  error => {
    return Promise.reject(error)
  }
)

// 登录接口
export function loginUser(data: { username: string; password: string; remember?: boolean }) {
  return api.post('/user/login', data)
}

// 注册接口
export function registerUser(data: { 
  username: string; 
  email: string;
  password: string;
  confirmPassword?: string; 
}) {
  const { confirmPassword, ...registerData } = data
  return api.post('/user/register', registerData)
}

// 获取用户信息
export function getUserInfo() {
  return api.get('/user/info')
}

// 退出登录
export function logout() {
  return api.post('/user/logout')
}