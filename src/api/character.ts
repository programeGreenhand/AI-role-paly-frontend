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

export function createCharacter(data:Character, userId:string){
    return server.post(`/user/${userId}/characters`,data)
}

//修改为根据每个用户的id来获取所拥有的角色
export function getCharacterList(userId:string){
    return server.get<Character[]>(`/user/${userId}/characters`)
}

export function getPublicCharacterList(){
    return server.get<Character[]>(`/characters/public`)
}

//导出这个server
export default server