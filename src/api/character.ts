import axios from "axios";
import type { Character } from "../types/character";
const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8081/'
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

export function createCharacter(data:Character, userId:string){
    return server.post(`/api/user/${userId}/characters`,data)
}

//修改为根据每个用户的id来获取所拥有的角色
export function getCharacterList(userId:string){
    return server.get<Character[]>(`/api/user/${userId}/characters`)
}

//导出这个server
export default server