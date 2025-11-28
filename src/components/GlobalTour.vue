<template>
  <el-tour
    v-if="tourStore.isActive && !tourStore.isTransitioning"
    v-model="tourStore.isActive"
    :current="tourStore.currentStepIndex"
    @close="tourStore.endTour"
    mask
  >
    <el-tour-step
      v-for="(step, index) in tourStore.steps"
      :key="index"
      :target="step.target"
      :title="step.title"
      :description="step.description"
      :placement="step.placement || 'bottom'"
    >
      <template #header>
        <div class="tour-header">
          <span class="tour-title">{{ step.title }}</span>
          <span class="tour-progress">
            {{ tourStore.currentStepIndex + 1 }} / {{ tourStore.steps.length }}
          </span>
        </div>
      </template>
      
      <template #default>
        <div class="tour-content">
          {{ step.description }}
        </div>
      </template>
      
      <template #footer>
        <div class="tour-footer">
          <el-button 
            v-if="tourStore.currentStepIndex > 0"
            size="small" 
            @click="tourStore.prevStep"
          >
            上一步
          </el-button>
          <div v-else></div>
          
          <div class="tour-actions">
            <el-button size="small" @click="tourStore.endTour">
              跳过引导
            </el-button>
            <el-button 
              type="primary" 
              size="small" 
              @click="tourStore.nextStep"
            >
              {{ tourStore.currentStepIndex === tourStore.steps.length - 1 ? '完成' : '下一步' }}
            </el-button>
          </div>
        </div>
      </template>
    </el-tour-step>
  </el-tour>
</template>

<script setup lang="ts">
import { useTourStore } from '../stores/tour'
import { watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const tourStore = useTourStore()
const route = useRoute()

// 监听路由变化
watch(() => route.path, async () => {
  if (tourStore.isActive && !tourStore.isTransitioning) {
    await nextTick()
    // 给页面渲染留出时间
    await new Promise(resolve => setTimeout(resolve, 200))
  }
})
</script>

<style scoped>
.tour-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
}

.tour-title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.tour-progress {
  color: #909399;
  font-size: 14px;
}

.tour-content {
  padding: 12px 0;
  line-height: 1.6;
  color: #606266;
}

.tour-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #EBEEF5;
}

.tour-actions {
  display: flex;
  gap: 8px;
}

:deep(.el-tour__mask) {
  background-color: rgba(0, 0, 0, 0.6);
}

:deep(.el-tour__content) {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  min-width: 320px;
}
</style>