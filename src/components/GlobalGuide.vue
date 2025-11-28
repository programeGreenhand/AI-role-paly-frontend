<template>
  <el-tour
    v-if="isGuideActive && currentStep"
    v-model="showTour"
    :mask="{ color: 'rgba(0, 0, 0, 0.5)' }"
    @close="handleClose"
    @finish="handleFinish"
  >
    <el-tour-step
      :target="currentTarget"
      :title="currentStep.title"
      :description="currentStep.description"
      :placement="currentStep.placement || 'bottom'"
    >
      <template #header>
        <div class="guide-header">
          <span>{{ currentStep.title }}</span>
          <span class="guide-progress">{{ currentStepIndex + 1 }}/{{ guideSteps.length }}</span>
        </div>
      </template>
      
      <template #default>
        <div class="guide-content">
          <p>{{ currentStep.description }}</p>
        </div>
      </template>

      <template #footer>
        <div class="guide-footer">
          <el-button 
            v-if="currentStepIndex > 0" 
            size="small" 
            @click="handlePrev"
          >
            上一步
          </el-button>
          <el-button 
            type="primary" 
            size="small" 
            @click="handleNext"
          >
            {{ currentStepIndex < guideSteps.length - 1 ? '下一步' : '完成' }}
          </el-button>
          <el-button 
            text 
            size="small" 
            @click="handleSkip"
          >
            跳过引导
          </el-button>
        </div>
      </template>
    </el-tour-step>
  </el-tour>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGuideStore } from '../stores/guide'
import type { GuideStep } from '../stores/guide'

const router = useRouter()
const route = useRoute()
const guideStore = useGuideStore()

const showTour = ref(true)
const currentTarget = ref<HTMLElement | string>('')

const { 
  isGuideActive, 
  currentStepIndex, 
  guideSteps,
  nextStep,
  prevStep,
  endGuide,
  waitForElement 
} = guideStore

const currentStep = computed<GuideStep | null>(() => {
  return guideSteps[currentStepIndex] || null
})

// 监听当前步骤变化
watch(currentStepIndex, async (newIndex) => {
  if (!isGuideActive || !currentStep.value) return
  
  const step = currentStep.value
  
  // 如果需要跳转路由
  if (step.route && route.path !== step.route) {
    await router.push(step.route)
    // 等待路由渲染
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  // 执行前置钩子
  if (step.beforeShow) {
    await step.beforeShow()
  }
  
  // 等待目标元素
  await updateTarget()
  
  // 执行后置钩子
  if (step.afterShow) {
    await step.afterShow()
  }
}, { immediate: true })

// 更新目标元素
const updateTarget = async () => {
  if (!currentStep.value) return
  
  const step = currentStep.value
  
  if (typeof step.target === 'function') {
    const element = step.target()
    if (element) {
      currentTarget.value = element
    }
  } else if (typeof step.target === 'string') {
    try {
      const element = await waitForElement(step.target)
      currentTarget.value = element
      showTour.value = true
    } catch (error) {
      console.error('Failed to find target element:', error)
      // 如果找不到元素，跳过该步骤
      handleNext()
    }
  }
}

// 下一步
const handleNext = async () => {
  if (currentStepIndex < guideSteps.length - 1) {
    // 如果当前步骤需要触发某个动作
    if (currentStep.value?.trigger) {
      // 触发动作后等待
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    nextStep()
  } else {
    handleFinish()
  }
}

// 上一步
const handlePrev = () => {
  prevStep()
}

// 跳过引导
const handleSkip = () => {
  endGuide()
  showTour.value = false
}

// 关闭引导
const handleClose = () => {
  endGuide()
  showTour.value = false
}

// 完成引导
const handleFinish = () => {
  endGuide()
  showTour.value = false
  // 可以在这里保存用户已完成引导的状态
  localStorage.setItem('guide_completed', 'true')
}
</script>

<style scoped>
.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.guide-progress {
  font-size: 12px;
  color: #909399;
}

.guide-content {
  padding: 12px 0;
  line-height: 1.6;
}

.guide-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>