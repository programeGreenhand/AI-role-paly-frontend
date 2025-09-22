<template>
  <!-- 书签样式的历史记录按钮 -->
  <div class="bookmark-history-btn" @click="drawer = true">
    <ElButton type="warning">操作台</ElButton>
  </div>

  <el-drawer  v-model="drawer"   :append-to-body="true" :with-header="true" direction="ltr" size="14%" class="history" :show-close="false"> 
    <template #header>
      <ElInput v-model="searchQuery" placeholder="搜索历史记录..."></ElInput>
    </template>

    <template #footer>
      <div class="footer-container">
        <el-dropdown placement="top-start">
          <el-button class="personal-center-footer" type="text" icon="user" size="large">航海王开发组</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToSettings">设置</el-dropdown-item>
              <el-dropdown-item @click="goToUserProfile">个人中心</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <!-- <el-button type="error" @click="drawer=false" icon="close">
          
        </el-button> -->
      </div>
    </template>
    <div class="history-list">
      <div v-for="item in [1,2,3,4,5,7,8,9,1,,5,5,5,5,5,5]" :key="item" class="character-item">
        <el-image
          style="width: 30px; height: 30px"
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        />
        <div class="character-info">
          <span class="character-name">哈利波特{{ item }}</span>
        </div>
      </div>
    </div>
  </el-drawer>

  <RouterView></RouterView>
</template>

<script setup lang="ts">
import { ref} from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const drawer = ref(false)



const goToSettings = () => {
  router.push('/hall/settings')
}

const goToUserProfile = () => {
  router.push('/hall/user/profile')
}
</script>

<style >


.main-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-section {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 40px;
}

.search-input {
  max-width: 500px;
  margin: 0 auto;
}

.characters-section,
.features-section {
  margin-bottom: 40px;
}

.characters-section h2,
.features-section h2 {
  color: black;
  text-align: center;
  margin-bottom: 20px;
  font-size: 2rem;
}

.feature-card {
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  margin: 15px 0 10px;
  color: black;
}

.feature-card p {
  color: black;
  line-height: 1.6;
}

/* 书签样式历史按钮 */
.bookmark-history-btn {
  position: fixed;
  top: 50vh;
  left: 0;
  transform: translateY(-50%);
  z-index: 1000;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.bookmark-history-btn:hover {
  transform: translateY(-50%) scale(1.1);
}

.bookmark-shape {
  width: 40px;
  height: 120px;
  background: linear-gradient(45deg, #e67e22, #f39c12);
  border-radius: 0 8px 8px 0;
  position: relative;
  box-shadow: 3px 3px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.bookmark-shape::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 15px solid #d35400;
}

.bookmark-history-btn:hover .bookmark-shape {
  background: linear-gradient(45deg, #f39c12, #e67e22);
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.3);
}

.bookmark-label {
  margin-top: 10px;
  color: #e67e22;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

/* 历史记录列表样式 */
.history-list {
  padding: 10px;
}

.character-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.character-item:hover {
  background-color: #f5f5f5;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateX(5px);
}

.character-info {
  margin-left: 12px;
}

.character-name {
  font-weight: bold;
  color: #333;
}

/* 如何是的el-drawer内容过多时候不出现滚动条 */
:deep(.el-drawer__body) {
  overflow: hidden;
}

.footer-container
{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.personal-center-footer{
  border:1px solid #eee;
  width: 85%;
  border-radius: 10px;
  height: 100%;
}

.personal-center-footer:hover{
  border:1px solid #409EFF;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

:deep(.el-overlay) {
  /* 将遮罩层的宽度设置为0，或者透明度设置为0，使其不可见且不阻挡点击 */
  width: 0 !important;
  /* 或者 */
  /* opacity: 0 !important; */
}
</style>