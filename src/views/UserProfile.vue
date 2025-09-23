<template>
  <div class="user-profile-container">
    <!-- 头部区域 -->
    <div class="header-section">
      <div class="title-area">
        <h1 class="page-title">用户资料管理</h1>
        <p class="page-subtitle">管理和查看用户信息</p>
      </div>
    </div>

    <!-- 工具栏区域 -->
    <div class="toolbar-section">
      <div class="tabs-container">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="文件管理" name="files">
            <template #label>
              <span class="tab-label">
                <i class="el-icon-folder"></i>
                文件管理
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="内容写作" name="writing">
            <template #label>
              <span class="tab-label">
                <i class="el-icon-edit"></i>
                内容写作
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户资料..."
          class="search-input"
          clearable
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-section">
      <div class="cards-grid">
        <el-card 
          v-for="user in filteredUsers" 
          :key="user.id"
          class="user-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <div class="user-avatar">
                {{ user.name.charAt(0) }}
              </div>
              <div class="user-basic-info">
                <h3 class="user-name">{{ user.name }}</h3>
                <span class="user-id">ID: {{ user.id }}</span>
              </div>
            </div>
          </template>
          
          <div class="card-content">
            <div class="info-item">
              <i class="el-icon-message"></i>
              <span class="info-label">邮箱:</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-phone"></i>
              <span class="info-label">电话:</span>
              <span class="info-value">{{ user.phone }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-location"></i>
              <span class="info-label">部门:</span>
              <span class="info-value">{{ user.department }}</span>
            </div>
          </div>
          
          <template #footer>
            <div class="card-actions">
              <el-button type="primary" size="small">编辑</el-button>
              <el-button type="info" size="small">查看</el-button>
              <el-button type="danger" size="small">删除</el-button>
            </div>
          </template>
        </el-card>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredUsers.length === 0" class="empty-state">
        <i class="el-icon-search"></i>
        <h3>没有找到匹配的用户</h3>
        <p>尝试调整搜索条件</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const searchQuery = ref('');
const activeTab = ref('files');

// 扩展的用户数据
const source = ref([
  { 
    id: 1, 
    name: '张三', 
    email: 'zhangsan@example.com',
    phone: '138-0000-0001',
    department: '技术部'
  },
  { 
    id: 2, 
    name: '李四', 
    email: 'lisi@example.com',
    phone: '138-0000-0002',
    department: '产品部'
  },
  { 
    id: 3, 
    name: '王五', 
    email: 'wangwu@example.com',
    phone: '138-0000-0003',
    department: '设计部'
  },
  { 
    id: 4, 
    name: '赵六', 
    email: 'zhaoliu@example.com',
    phone: '138-0000-0004',
    department: '运营部'
  },
  { 
    id: 5, 
    name: '孙七', 
    email: 'sunqi@example.com',
    phone: '138-0000-0005',
    department: '市场部'
  },
  { 
    id: 6, 
    name: '周八', 
    email: 'zhouba@example.com',
    phone: '138-0000-0006',
    department: '人事部'
  }
]);

// 搜索过滤
const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return source.value;
  }
  return source.value.filter(user => 
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>

<style scoped>
.user-profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  box-sizing: border-box;
}

/* 头部区域 */
.header-section {
  margin-bottom: 2rem;
}

.title-area {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

/* 工具栏区域 */
.toolbar-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.tabs-container {
  flex: 1;
  min-width: 300px;
}

.custom-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.search-container {
  flex-shrink: 0;
}

.search-input {
  width: 300px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 内容区域 */
.content-section {
  min-height: 400px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.user-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.user-card :deep(.el-card__header) {

  color: white;
  padding: 1rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
}

.user-basic-info {
  flex: 1;
}

.user-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.user-id {
  font-size: 0.9rem;
  opacity: 0.8;
}

.card-content {
  padding: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: #f8f9fa;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item i {
  color: #667eea;
  width: 16px;
}

.info-label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 40px;
}

.info-value {
  color: #34495e;
  flex: 1;
}

.user-card :deep(.el-card__footer) {
  background: #f8f9fa;
  padding: 1rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #7f8c8d;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #bdc3c7;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .user-profile-container {
    padding: 1.5rem;
  }
  
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .user-profile-container {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .toolbar-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .card-actions .el-button {
    width: 100%;
    margin: 0 0 0.5rem 0;
  }
  
  .card-actions .el-button:last-child {
    margin-bottom: 0;
  }
}

@media (max-width: 480px) {
  .user-profile-container {
    padding: 0.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .toolbar-section {
    padding: 1rem;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .info-label {
    min-width: auto;
  }
}
</style>