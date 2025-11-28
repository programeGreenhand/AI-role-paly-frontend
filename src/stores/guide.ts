import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface GuideStep {
  target: string | (() => HTMLElement | null)
  title: string
  description: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  route?: string // 该步骤所在的路由
  beforeShow?: () => Promise<void> | void // 显示前的钩子
  afterShow?: () => Promise<void> | void // 显示后的钩子
  trigger?: string // 需要触发的事件，如 'click', 'drawer-open'
}

export const useGuideStore = defineStore('guide', () => {
  const isGuideActive = ref(false)
  const currentStepIndex = ref(0)
  const guideSteps = ref<GuideStep[]>([])
  const tourRef = ref<any>(null)
  
  // 等待元素出现
  const waitForElement = (selector: string, timeout = 5000): Promise<HTMLElement> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const checkElement = () => {
        const element = document.querySelector(selector) as HTMLElement
        if (element) {
          resolve(element)
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element ${selector} not found within ${timeout}ms`))
        } else {
          requestAnimationFrame(checkElement)
        }
      }
      
      checkElement()
    })
  }

  // 开始引导
  const startGuide = (steps: GuideStep[]) => {
    guideSteps.value = steps
    currentStepIndex.value = 0
    isGuideActive.value = true
  }

  // 下一步
  const nextStep = () => {
    if (currentStepIndex.value < guideSteps.value.length - 1) {
      currentStepIndex.value++
    }
  }

  // 上一步
  const prevStep = () => {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--
    }
  }

  // 结束引导
  const endGuide = () => {
    isGuideActive.value = false
    currentStepIndex.value = 0
    guideSteps.value = []
  }

  // 跳到指定步骤
  const goToStep = (index: number) => {
    if (index >= 0 && index < guideSteps.value.length) {
      currentStepIndex.value = index
    }
  }

  // 设置 Tour 引用
  const setTourRef = (ref: any) => {
    tourRef.value = ref
  }

  return {
    isGuideActive,
    currentStepIndex,
    guideSteps,
    tourRef,
    waitForElement,
    startGuide,
    nextStep,
    prevStep,
    endGuide,
    goToStep,
    setTourRef
  }
})