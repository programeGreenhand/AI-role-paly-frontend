<template>
  <!-- 优化后的悬浮操作按钮 -->
  <div class="floating-control-panel">
    <el-button 
      class="control-trigger" 
      type="primary" 
      :icon="drawer ? 'Close' : 'Menu'"
      circle
      @click="drawer = !drawer"
    />
  </div>

  <!-- <el-button @click="clickme">展示场景列表</el-button>
  <el-button @click="clickme1">展示广场</el-button>
  <el-button @click="clickme3">个人对话历史</el-button>
  <el-button @click="clickme4">获取收藏AI</el-button>
  <el-button @click="clickme5">获取自建AI</el-button>
  <el-button @click="clickme6">自建AI广场</el-button>
  <el-button @click="clickme7">收藏智能体</el-button>
  <el-button @click="clickme8">收藏智能体</el-button>
  <el-button @click="clickme9">取消收藏</el-button>
  <el-button @click="clickme10">创建对话会话</el-button>
  <el-button @click="clickme11">获取会话消息</el-button>
  <el-button @click="clickme12">获取角色信息</el-button> -->

  <el-drawer  
    v-model="drawer"   
    :append-to-body="true" 
    :with-header="false" 
    direction="ltr" 
    :size="drawerSize"
    class="control-drawer"
  > 
    <div class="drawer-content">
      <!-- 头部区域 -->
      <div class="drawer-header">
        <h3>操作台</h3>
        <el-button text @click="drawer = false" icon="Close" />
      </div>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索历史记录..." 
          prefix-icon="Search"
          clearable
        />
      </div>

      <!-- 内容列表 -->
      <div class="content-list" >
        <div v-for="item in session" :key="item.id" class="list-item" @click="gotoRoleChat(item)">
          <el-avatar 
            :size="40"
            :src="getroleImage(item.id)"
            
          />
          <div class="item-info">
            <span class="item-name">{{ item.title}}</span>
            <span class="item-time">{{ diffTime(item.last_message_at) }}小时前</span>
          </div>


          <el-dropdown placement="bottom-start">
          <el-button text icon="MoreFilled" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @clikc.stop="deletRole">删除</el-dropdown-item>
              <el-dropdown-item @clikc.stop="modifyRole">编辑</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
           
        </div>
      </div>

      <!-- 底部用户信息 -->
      <div class="drawer-footer">
        <el-dropdown placement="top" trigger="click">
          <div class="user-info">
            <el-avatar icon="User" />
            <span>三块给买麻薯</span>
            <el-icon><ArrowUp /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToSettings" icon="Setting">设置</el-dropdown-item>
              <el-dropdown-item @click="goToUserProfile" icon="User">个人中心</el-dropdown-item>
              <!-- 选一个合适的图标 -->
              <el-dropdown-item @click="goShoppingTrolley" icon="ShoppingTrolley">智能体宇宙</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-drawer>

  <RouterView />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/character'
import axios from 'axios'
import server from '../api/session'
import type { Character } from '../types/character'
import { useChatStore } from '../stores/chat'
const character = useCharacterStore()  
const current_character = ref<Character>()
//获取会话列表
const session = ref(null);

const router = useRouter()
const searchQuery = ref('')
const drawer = ref(false)

const getroleImage = (id:string) => {
  return new URL(`../assets/charactor/${id}/role/avatar.jpg`, import.meta.url).href;
};

//这里进入的是历史会话，历史会话不需要进入就创建session，而是直接读取session
const gotoRoleChat = async function(item){
  //这里进去就不创建会话！！！！
//   const characterId = "0fdb0471-0d0c-49ed-9164-4631426a2379";
// // 使用模板字符串将变量直接嵌入URL路径
//   const response = await axios.get(`http://localhost:8081/api/characters/${characterId}`);
//   console.log(response.data)
  console.log(`角色信息: ${item.character_id}`)
  console.log(`信息: ${item.title}`)
  const response = await server.get(`/characters/${item.character_id}`);
  console.log("这个是响应结果 角色：",response.data)
  current_character.value = response.data
  console.log(current_character.value.name)
  // console.log(`进入该角色聊天:${current_character.name}`)
  character.setCurrentCharacter(current_character.value)
  //进入会话前，先设置currentSessionid:
  const chatStore = useChatStore();
  chatStore.currentSession = item.id
  router.push(`/chat`)
}

const diffTime = function(lastModify){
  const now = new Date().getTime()
  let last = new  Date(lastModify).getTime()
  return Math.ceil((now - last)/(1000*60*60))
}

////测试按钮
const clickme = async ()=>{
  const response = await server.get('/scenes');
  console.log(response.data)
}

const clickme1 = async ()=>{
  const response = await server.get('/characters/public');
  console.log(response.data)
}

const clickme3 = async ()=>{
  const userId = localStorage.getItem('userId');
// 使用模板字符串将变量直接嵌入URL路径 /api/user/:userId/sessions
  const response = await server.get(`/user/${userId}/sessions`);
  console.log(response.data)
}

const clickme4 = async ()=>{
  const userId = localStorage.getItem('userId');
// 使用模板字符串将变量直接嵌入URL路径
  const response = await server.get(`/user/${userId}/favorites`);
  console.log(response.data)
}

const clickme5 = async ()=>{
  const userId = localStorage.getItem('userId');
// 使用模板字符串将变量直接嵌入URL路径
  const response = await server.get(`/user/${userId}/characters`);
  console.log(response.data)
}

const clickme6 = async ()=>{
  const response = await server.get('/characters/public');
  console.log(response.data)
}

const clickme7 = async ()=>{
  const response = await server.get('/characters/custom');  //有问题
  console.log(response.data)
}

const clickme8 = async ()=>{
  const userId = localStorage.getItem('userId');
  const characterId = '1cc32b86-8802-43a0-b16e-ae80ecd19074';
// 使用模板字符串将变量直接嵌入URL路径
  const response = await server.post(`/user/${userId}/favorites/${characterId}`);
  console.log(response.data)
}


const clickme9 = async ()=>{
  const userId = localStorage.getItem('userId');
   const characterId = '1cc32b86-8802-43a0-b16e-ae80ecd19074'
// 使用模板字符串将变量直接嵌入URL路径
  const response = await server.delete(`/user/${userId}/favorites/${characterId}`);
  console.log(response.data)
}

const clickme10 = async ()=>{
  const userId = localStorage.getItem('userId');
  console.log(userId)
// 使用模板字符串将变量直接嵌入URL路径 characterId, sceneId, title 创建对话会话
  const response = await server.post(`/user/${userId}/sessions`,{
    "characterId": "1cc32b86-8802-43a0-b16e-ae80ecd19074",
    "sceneId": "0a6d74a4-5687-477b-b2bc-57b08642e5a2",
    'title':'hello world ni hao ya'
  });
  console.log(response.data)
}


const clickme11 = async ()=>{
  const sessionId = "0a6d74a4-5687-477b-b2bc-57b08642e5a2";
// 使用模板字符串将变量直接嵌入URL路径
  const response = await server.get(`/sessions/${sessionId}/messages`);
  console.log(response.data)
}


const clickme12 = async ()=>{
  const characterId = "1cc32b86-8802-43a0-b16e-ae80ecd19074";
// 使用模板字符串将变量直接嵌入URL路径
  const response = await server.get(`/characters/${characterId}`);
  console.log(response.data)
}


// <el-button @click="clickme">展示场景列表</el-button>
//   <el-button @click="clickme1">展示广场</el-button>
//   <el-button @click="clickme3">个人对话历史</el-button>
//   <el-button @click="clickme4">获取收藏AI</el-button>
//   <el-button @click="clickme5">获取自建AI</el-button>
//   <el-button @click="clickme6">自建AI广场</el-button>
//   <el-button @click="clickme7">收藏智能体</el-button>
//   <el-button @click="clickme8">收藏智能体</el-button>
//   <el-button @click="clickme9">取消收藏</el-button>
//   <el-button @click="clickme10">创建对话会话</el-button>
//   <el-button @click="clickme11">获取会话消息</el-button>








const deletRole = ()=>{
  console.log('delete')
}

const modifyRole = ()=>{
  
}

// 响应式抽屉宽度
const drawerSize = computed(() => {
  if (window.innerWidth < 768) return '80%'
  if (window.innerWidth < 1024) return '40%'
  return '320px'
})

// 模拟数据和过滤
const mockData = Array.from({length: 15}, (_, i) => i + 1)
const filteredList = computed(() => {
  if (!searchQuery.value) return mockData
  return mockData.filter(item => 
    `哈利波特${item}`.includes(searchQuery.value)
  )
})

const goToSettings = () => {
  router.push('/hall/settings')
  drawer.value = false
}

const goToUserProfile = () => {
  router.push('/hall/user/profile')
  drawer.value = false
}

const goShoppingTrolley = () => {
  router.push('/hall/shopping')
  drawer.value = false
}

//进入该页面就读取当前用户的历史会话
onMounted(async ()=>{
  const userId = localStorage.getItem('userId');
 
  //使用模板字符串将变量直接嵌入URL路径 /api/user/:userId/sessions   查询用户的对话历史
  const response = await server.get(`/user/${userId}/sessions`);
  session.value = response.data
  //通过session中得characterId 来获取角色信息:/api/characters/:characterId
  
})

</script>

<style scoped>
.floating-control-panel {
  position: fixed;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  z-index: 1000;
}

.control-trigger {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.control-trigger:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.search-section {
  padding: 16px;
}

.content-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s;
}

.list-item:hover {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding-left: 8px;
  padding-right: 8px;
}

.item-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 500;
  color: #333;
}

.item-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.drawer-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f5f5f5;
}
</style>