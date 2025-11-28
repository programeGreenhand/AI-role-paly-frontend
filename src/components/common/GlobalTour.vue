<!-- components/common/GlobalTour.vue -->
<template>
  <ClientOnly>
    <el-tour
      v-if="tourStore.isActive"
      v-model="tourStore.isActive"
      :current="tourStore.currentStepIndex"
      @update:current="handleCurrentChange"
      @close="tourStore.endTour"
      :mask="{ style: { backgroundColor: 'rgba(0, 0, 0, 0.4)' } }"
      :z-index="9999"
      :padding="{ top: 0, bottom: 0, right: 0, left: 0 }"
      scroll-into-view-options="{ behavior: 'smooth', block: 'center' }"
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
          <div class="tour-description">
            {{ step.description }}
          </div>
        </template>
        
        <template #footer>
          <div class="tour-footer">
            <el-button 
              v-if="tourStore.currentStepIndex > 0"
              size="small" 
              @click="handlePrev"
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
                @click="handleNext"
                :loading="isNavigating"
              >
                {{ tourStore.currentStepIndex === tourStore.steps.length - 1 ? '完成引导' : '下一步' }}
              </el-button>
            </div>
          </div>
        </template>
      </el-tour-step>
    </el-tour>

    <!-- 隐藏的遮罩层，用于阻止下拉菜单关闭 -->
    <div
      v-if="tourStore.isActive && tourStore.shouldKeepDropdownOpen"
      class="dropdown-protect-overlay"
      @click="preventDropdownClose"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { useTourStore } from '../../stores/tour'
import { watch, onMounted, onUnmounted, nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'

const tourStore = useTourStore()
const route = useRoute()
const isNavigating = ref(false)

const handleNext = async () => {
  isNavigating.value = true
  try {
    await tourStore.nextStep()
  } finally {
    isNavigating.value = false
  }
}

const handlePrev = async () => {
  isNavigating.value = true
  try {
    await tourStore.prevStep()
  } finally {
    isNavigating.value = false
  }
}

const handleCurrentChange = (current: number) => {
  tourStore.currentStepIndex = current
}

const preventDropdownClose = (e: MouseEvent) => {
  e.stopPropagation()
}

// 监听路由变化
watch(() => route.path, async () => {
  if (tourStore.isActive) {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 600))
  }
}, { immediate: true })

// 处理动态元素
let observer: MutationObserver | null = null

onMounted(() => {
  observer = new MutationObserver(async (mutations) => {
    if (tourStore.isActive) {
      const hasRelevantChange = mutations.some(mutation => 
        mutation.type === 'childList' && mutation.addedNodes.length > 0
      )
      
      if (hasRelevantChange) {
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped>
.tour-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

.tour-description {
  padding: 8px 0;
  color: #606266;
  line-height: 1.6;
}

.tour-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  width: 100%;
}

.tour-actions {
  display: flex;
  gap: 8px;
}

:deep(.el-tour__mask) {
  background-color: rgba(0, 0, 0, 0.4) !important;
}

:deep(.el-tour__content) {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  min-width: 300px;
  max-width: 420px;
  background: #fff;
  padding: 16px;
  z-index: 9999;
}

:deep(.el-tour__closebtn) {
  top: 12px;
  right: 12px;
  color: #909399;
}

:deep(.el-tour__mask-shape) {
  z-index: 9998;
}

/* 下拉菜单保护层 */
.dropdown-protect-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  pointer-events: none;
}

.dropdown-protect-overlay:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 2001;
}
</style>