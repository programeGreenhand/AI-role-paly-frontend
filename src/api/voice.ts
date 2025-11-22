import axios from 'axios';
import type { VoiceItem } from '../types/voice'

const baseUrl = import.meta.env.VITE_BASE_URL || '/api'

// 创建axios实例（可选，但推荐）
const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 10000, // 设置请求超时时间
  
})

apiClient.interceptors.request.use(
    config=>{
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },

    //@ts-ignore
    error=>{
        Promise.reject()
    }
)

export class VoiceAPI {
  async getVoiceList(): Promise<VoiceItem[]> {
    try {
      const response = await apiClient.get('/voice/list');
     
      
      // axios会自动处理HTTP错误状态，但您也可以手动检查
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // axios将响应数据放在data属性中
      return response.data.data || [];
    } catch (error) {
      console.error('获取音色列表失败:', error);
      
      // 可以更详细地处理axios错误
      if (axios.isAxiosError(error)) {
        console.error('Ax错误详情:', error.response?.data);
      }
      
      throw error;
    }
  }
}

export const voiceAPI = new VoiceAPI();