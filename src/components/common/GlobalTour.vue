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
import { watch, onMounted, onUnmounted, nextTick, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const tourStore = useTourStore()
const route = useRoute()
const isNavigating = ref(false)

// 检测是否为移动设备
const isMobile = computed(() => {
  const match = window.matchMedia('(max-width: 480px)')
  return match.matches
})

// 移动端优化的导航延迟
const mobileNavDelay = computed(() => isMobile.value ? 200 : 0)

const handleNext = async () => {
  isNavigating.value = true
  try {
    // 移动端增加触摸反馈
    if (isMobile.value) {
      // 添加触摸反馈效果
      const activeStep = document.querySelector('.el-tour-step.is-active')
      if (activeStep) {
        activeStep.classList.add('mobile-touch-feedback')
        setTimeout(() => {
          activeStep.classList.remove('mobile-touch-feedback')
        }, 150)
      }
    }
    
    await tourStore.nextStep()
    // 移动端增加额外延迟以确保视图更新完成
    if (isMobile.value) {
      await new Promise(resolve => setTimeout(resolve, mobileNavDelay.value))
    }
  } finally {
    isNavigating.value = false
  }
}

const handlePrev = async () => {
  isNavigating.value = true
  try {
    // 移动端增加触摸反馈
    if (isMobile.value) {
      const activeStep = document.querySelector('.el-tour-step.is-active')
      if (activeStep) {
        activeStep.classList.add('mobile-touch-feedback')
        setTimeout(() => {
          activeStep.classList.remove('mobile-touch-feedback')
        }, 150)
      }
    }
    
    await tourStore.prevStep()
    // 移动端增加额外延迟以确保视图更新完成
    if (isMobile.value) {
      await new Promise(resolve => setTimeout(resolve, mobileNavDelay.value))
    }
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
    // 移动端增加更长的延迟以确保页面完全加载
    const delay = isMobile.value ? 800 : 600
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}, { immediate: true })

// 监听窗口大小变化，在移动端模式下调整步骤位置
const handleResize = async () => {
  if (tourStore.isActive && isMobile.value) {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}

// 处理动态元素
let observer: MutationObserver | null = null

onMounted(() => {
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
  
  observer = new MutationObserver(async (mutations) => {
    if (tourStore.isActive) {
      const hasRelevantChange = mutations.some(mutation => 
        mutation.type === 'childList' && mutation.addedNodes.length > 0
      )
      
      if (hasRelevantChange) {
        await nextTick()
        // 移动端增加更长的延迟
        const delay = isMobile.value ? 500 : 300
        await new Promise(resolve => setTimeout(resolve, delay))
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
  window.removeEventListener('resize', handleResize)
  
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

/* 响应式样式 - 平板设备 */
@media screen and (max-width: 768px) {
  :deep(.el-tour__content) {
    min-width: 260px;
    max-width: 90vw;
    padding: 12px;
  }
  
  .tour-title {
    font-size: 15px;
  }
  
  .tour-description {
    font-size: 14px;
    line-height: 1.5;
  }
  
  .tour-footer {
    margin-top: 10px;
  }
  
  .tour-actions {
    gap: 6px;
  }
  
  :deep(.el-button) {
    font-size: 13px;
    padding: 6px 12px;
  }
}

/* 响应式样式 - 移动设备 */
@media screen and (max-width: 480px) {
  :deep(.el-tour__content) {
    min-width: 240px;
    max-width: 95vw;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  
  .tour-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .tour-title {
    font-size: 14px;
  }
  
  .tour-progress {
    font-size: 12px;
  }
  
  .tour-description {
    font-size: 13px;
    line-height: 1.4;
    padding: 6px 0;
  }
  
  .tour-footer {
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }
  
  .tour-actions {
    width: 100%;
    gap: 8px;
  }
  
  :deep(.el-button) {
    flex: 1;
    font-size: 12px;
    padding: 8px 10px;
  }
  
  :deep(.el-tour__closebtn) {
    top: 8px;
    right: 8px;
    transform: scale(0.8);
  }
  
  /* 调整移动端定位，优先显示在屏幕中心 */
  :deep(.el-tour__popper.is-bottom),
  :deep(.el-tour__popper.is-top),
  :deep(.el-tour__popper.is-left),
  :deep(.el-tour__popper.is-right) {
    transform: none;
    position: fixed;
    top: 50% !important;
    left: 50% !important;
    right: auto !important;
    bottom: auto !important;
    margin: 0 !important;
    transform: translate(-50%, -50%) !important;
  }
  
  /* 隐藏移动端指引箭头，避免遮挡内容 */
  :deep(.el-tour__popper__arrow) {
    display: none;
  }
  
  /* 移动端触摸反馈效果 */
  .mobile-touch-feedback :deep(.el-tour__content) {
    animation: touchFeedback 0.15s ease-in-out;
  }
  
  @keyframes touchFeedback {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }
}
</style>