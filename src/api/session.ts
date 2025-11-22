import axios from "axios";
import type { Character } from "../types/character";
const baseUrl = import.meta.env.VITE_BASE_URL || '/api'
const server = axios.create({
    baseURL:baseUrl,
    timeout:30000
})

server.interceptors.request.use(
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

server.interceptors.response.use(
    response=>{
        if(response.status === 200){
            return response.data
        }
    },
    
    _error=>{
        Promise.reject()
    }
)



//导出这个server
export default server