import axios from 'axios';
import type { VoiceItem } from '../types/voice'

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8081/api'

// 创建axios实例（可选，但推荐）
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 设置请求超时时间
  
})

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