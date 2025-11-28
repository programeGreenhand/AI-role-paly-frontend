<template>
  <div class="guid-container">
    <!-- 引导触发按钮 -->
    <el-button 
      v-if="showTrigger"
      type="primary" 
      @click="startTour" 
      circle 
      icon="Guide" 
      class="guid-trigger"
      :style="triggerStyle"
    />

    <!-- Element Plus Tour 组件 -->
    <el-tour 
      v-model="tourVisible" 
      v-model:current-step="currentStep"
      :steps="tourSteps"
      :show-close="false"
    >
      <template #indicators>
        <div class="custom-indicators">
          <span 
            v-for="(step, index) in tourSteps" 
            :key="index"
            :class="['indicator', { active: currentStep === index }]"
            @click="goToStep(index)"
          ></span>
        </div>
      </template>
      
      <template #footer="{ currentStep: stepIndex, totalSteps, next, prev, close, skip }">
        <div class="custom-footer">
          <el-button size="small" @click="skipTour">跳过</el-button>
          <div class="footer-actions">
            <el-button 
              v-if="stepIndex > 0" 
              size="small" 
              @click="prev"
            >
              上一步
            </el-button>
            <el-button 
              v-if="stepIndex < totalSteps - 1" 
              type="primary" 
              size="small" 
              @click="next"
            >
              下一步
            </el-button>
            <el-button 
              v-else 
              type="primary" 
              size="small" 
              @click="finishTour"
            >
              完成
            </el-button>
          </div>
        </div>
      </template>
    </el-tour>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 定义props
interface TourStep {
  target: string
  title: string
  description: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

interface Props {
  // 自定义引导步骤
  steps?: TourStep[]
  // 引导触发按钮位置
  position?: 'bottom-right' | 'top-left' | 'top-right' | 'bottom-left'
  // 是否显示触发按钮
  showTrigger?: boolean
  // 自动开始引导
  autoStart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  steps: () => [],
  position: 'bottom-right',
  showTrigger: true,
  autoStart: false
})

// 引导状态
const tourVisible = ref(false)
const currentStep = ref(0)

// 引导触发按钮位置
const triggerPosition = ref(props.position)

// 计算触发按钮样式
const triggerStyle = computed(() => {
  const positions = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' }
  }
  return positions[triggerPosition.value]
})

// 引导步骤配置
const tourSteps = computed(() => {
  // 如果传入了自定义步骤，优先使用自定义步骤
  if (props.steps && props.steps.length > 0) {
    return props.steps
  }
  
  // 默认引导步骤
  return [
    {
      target: '.control-trigger',
      title: '核心功能区',
      description: '这里是侧边抽屉按钮，点击可以展开或收起功能面板',
      placement: 'right'
    },
    {
      target: '.search-input',
      title: '搜索功能',
      description: '在这里可以搜索历史记录和对话内容',
      placement: 'bottom'
    },
    {
      target: '.session-list',
      title: '对话历史',
      description: '这里显示您的所有对话会话，点击可以快速切换',
      placement: 'left'
    },
    {
      target: '.user-info',
      title: '用户设置',
      description: '点击这里可以查看和修改您的个人信息',
      placement: 'bottom'
    },
    {
      target: '.shopping-trolley',
      title: '智能体宇宙',
      description: '探索更多AI角色，发现新的对话体验',
      placement: 'top'
    }
  ]
})

// 开始引导
const startTour = () => {
  tourVisible.value = true
  currentStep.value = 0
  
  // 确保目标元素可见
  setTimeout(() => {
    const firstTarget = document.querySelector(tourSteps.value[0].target)
    if (firstTarget) {
      firstTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

// 结束引导
const endTour = () => {
  tourVisible.value = false
  currentStep.value = 0
}

// 暴露方法给父组件
const expose = {
  startTour,
  endTour,
  tourVisible,
  currentStep
}

defineExpose(expose)

// 监听autoStart属性变化
watch(() => props.autoStart, (newVal) => {
  if (newVal) {
    startTour()
  }
})

// 跳转到指定步骤
const goToStep = (index: number) => {
  currentStep.value = index
  
  // 滚动到目标元素
  const target = document.querySelector(tourSteps.value[index].target)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// 跳过引导
const skipTour = () => {
  tourVisible.value = false
  // 可以在这里添加跳过引导的逻辑，比如记录用户偏好
  console.log('用户跳过了引导')
}

// 完成引导
const finishTour = () => {
  tourVisible.value = false
  // 可以在这里添加完成引导的逻辑，比如记录引导完成状态
  console.log('用户完成了引导')
}

// 监听路由变化，自动调整引导位置
const handleRouteChange = () => {
  // 根据当前页面调整引导触发按钮位置
  const currentPath = router.currentRoute.value.path
  
  if (currentPath.includes('/hall')) {
    triggerPosition.value = 'bottom-right'
  } else if (currentPath.includes('/chat')) {
    triggerPosition.value = 'top-right'
  } else {
    triggerPosition.value = 'bottom-right'
  }
}

// 组件挂载时设置监听
onMounted(() => {
  handleRouteChange()
  
  // 如果设置了自动开始，则启动引导
  if (props.autoStart) {
    setTimeout(() => {
      startTour()
    }, 500)
  }
  
  router.afterEach(handleRouteChange)
})

// 组件卸载时清理监听
onUnmounted(() => {
  // 清理路由监听（如果需要）
})

// 检查元素是否存在
const checkElementExistence = (selector: string): boolean => {
  return !!document.querySelector(selector)
}

// 动态更新引导步骤
const updateTourSteps = () => {
  // 可以根据当前页面动态调整引导步骤
  const currentPath = router.currentRoute.value.path
  
  if (currentPath.includes('/chat')) {
    // 聊天页面的引导步骤
    tourSteps.value = [
      {
        target: '.message-input',
        title: '消息输入',
        description: '在这里输入您想要说的话，与AI角色进行对话',
        placement: 'top'
      },
      {
        target: '.voice-btn',
        title: '语音输入',
        description: '点击这里可以使用语音输入功能',
        placement: 'top'
      },
      {
        target: '.scene-selector',
        title: '场景选择',
        description: '切换不同的对话场景，体验多样化的对话内容',
        placement: 'bottom'
      }
    ]
  }
}
</script>

<style scoped>
.guid-container {
  position: relative;
}

.guid-trigger {
  position: fixed;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.guid-trigger:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.custom-indicators {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #dcdfe6;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background-color: #409eff;
  transform: scale(1.2);
}

.custom-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .guid-trigger {
    bottom: 10px !important;
    right: 10px !important;
  }
  
  .custom-footer {
    flex-direction: column;
    gap: 12px;
  }
  
  .footer-actions {
    width: 100%;
    justify-content: space-between;
  }
}

/* 引导步骤样式优化 */
:deep(.el-tour) {
  --el-tour-width: 320px;
}

:deep(.el-tour__content) {
  padding: 16px;
}

:deep(.el-tour__title) {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

:deep(.el-tour__description) {
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
}
</style>