// stores/tour.ts
import { defineStore } from 'pinia'
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import type { TourStep } from 'element-plus'

export interface GuideTourStep extends TourStep {
  route?: string
  beforeEnter?: () => Promise<void> | void
  onNext?: () => Promise<void> | void
  elementSelector?: string
  waitForElement?: boolean
  waitTimeout?: number
  scrollIntoView?: boolean
  needsDropdownOpen?: boolean // 标记是否需要保持下拉菜单打开
}

export const useTourStore = defineStore('tour', () => {
  const router = useRouter()
  
  const isActive = ref(false)
  const currentStepIndex = ref(0)
  const tourRef = ref<any>(null)
  const isInTour = ref(false) // 标记当前是否在引导中
  const shouldKeepDropdownOpen = ref(false) // 标记是否应保持下拉菜单打开
  
  // 等待元素出现的辅助函数
  const waitForElement = (selector: string, timeout = 8000): Promise<Element | null> => {
    return new Promise((resolve) => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        return
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector)
        if (element) {
          observer.disconnect()
          clearTimeout(timer)
          resolve(element)
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      const timer = setTimeout(() => {
        observer.disconnect()
        console.warn(`等待元素超时: ${selector}`)
        resolve(null)
      }, timeout)
    })
  }

  // 滚动元素到视图
  const scrollToElement = async (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // 防止下拉菜单关闭的处理
  const preventDropdownClose = () => {
    if (shouldKeepDropdownOpen.value) {
      // 阻止事件冒泡
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const dropdownMenu = document.querySelector('.el-dropdown-menu')
        
        // 如果点击在下拉菜单或其触发器上，不关闭
        if (dropdownMenu?.contains(target) || 
            target.closest('.user-info') ||
            target.closest('.el-dropdown')) {
          e.stopPropagation()
        }
      }, true)
    }
  }

  // 强制保持下拉菜单打开
  const keepDropdownOpen = async () => {
    shouldKeepDropdownOpen.value = true
    
    const dropdown = document.querySelector('.user-info') as HTMLElement
    const popper = document.querySelector('.el-popper') as HTMLElement
    
    if (dropdown) {
      dropdown.click()
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    // 监听点击事件，防止下拉菜单关闭
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const dropdownMenu = document.querySelector('.el-dropdown-menu')
      const userInfo = document.querySelector('.user-info')
      const tourContent = document.querySelector('.el-tour__content')
      
      // 如果点击在下拉菜单、用户信息、或 Tour 内容上，则不关闭
      if ((dropdownMenu?.contains(target)) || 
          (userInfo?.contains(target)) ||
          (tourContent?.contains(target))) {
        e.stopPropagation()
      }
    }

    document.addEventListener('click', handleDocumentClick, true)
    
    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
      shouldKeepDropdownOpen.value = false
    }
  }

  // 引导步骤配置
  const steps = ref<GuideTourStep[]>([
    {
      target: '.control-trigger',
      title: '欢迎使用',
      description: '点击这里打开侧边菜单，查看您的对话历史',
      route: '/hall',
      elementSelector: '.control-trigger',
      placement: 'right',
      scrollIntoView: true,
      needsDropdownOpen: false,
      onNext: async () => {
        const trigger = document.querySelector('.control-trigger') as HTMLElement
        if (trigger) {
          trigger.click()
          // 等待抽屉打开动画完成
          await new Promise(resolve => setTimeout(resolve, 600))
        }
      }
    },
    {
      target: '.drawer-content',
      title: '对话历史',
      description: '这里显示了您的所有对话历史记录，点击任何一条可以继续对话',
      route: '/hall',
      elementSelector: '.drawer-content',
      waitForElement: true,
      waitTimeout: 8000,
      placement: 'left',
      needsDropdownOpen: false,
      beforeEnter: async () => {
        // 确保抽屉已经打开
        const drawer = document.querySelector('.control-drawer')
        if (drawer) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
    },
    {
      target: '.drawer-footer',
      title: '用户菜单',
      description: '这里是用户菜单，点击可以访问个人中心、设置和智能体宇宙',
      route: '/hall',
      elementSelector: '.drawer-footer .user-info',
      waitForElement: true,
      waitTimeout: 8000,
      placement: 'top',
      scrollIntoView: true,
      needsDropdownOpen: false,
      onNext: async () => {
        const userInfo = document.querySelector('.drawer-footer .user-info') as HTMLElement
        if (userInfo) {
          userInfo.click()
          // 保持下拉菜单打开
          shouldKeepDropdownOpen.value = true
          await new Promise(resolve => setTimeout(resolve, 400))
        }
      }
    },
    {
      target: '.dropdown-menu .dropdown-item:nth-child(3)',
      title: '智能体宇宙',
      description: '点击这里进入智能体宇宙，探索更多AI角色',
      route: '/hall',
      elementSelector: '.el-dropdown-menu .el-dropdown-menu__item:nth-child(3)',
      waitForElement: true,
      waitTimeout: 8000,
      placement: 'right',
      needsDropdownOpen: true,
      beforeEnter: async () => {
        // 如果下拉菜单关闭了，重新打开它
        const dropdownMenu = document.querySelector('.el-dropdown-menu')
        if (!dropdownMenu) {
          const userInfo = document.querySelector('.drawer-footer .user-info') as HTMLElement
          if (userInfo) {
            userInfo.click()
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        }
      },
      onNext: async () => {
        // 在点击菜单项前，先禁用事件冒泡
        const menuItem = document.querySelector('.el-dropdown-menu .el-dropdown-menu__item:nth-child(3)') as HTMLElement
        if (menuItem) {
          // 清除下拉菜单打开标记
          shouldKeepDropdownOpen.value = false
          menuItem.click()
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    },
    {
      target: '.character-card:nth-child(3)',
      title: '选择角色',
      description: '这些是可用的AI角色，点击卡片可以开始对话',
      route: '/hall/shopping',
      elementSelector: '.character-card',
      waitForElement: true,
      waitTimeout: 8000,
      placement: 'bottom',
      scrollIntoView: true,
      needsDropdownOpen: false,
      onNext: async () => {
        const card = document.querySelector('.character-card') as HTMLElement
        if (card) {
          card.click()
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    },
    {
      target: '.message-composer',
      title: '开始对话',
      description: '在这里输入您想说的话，开始与AI角色的精彩对话吧！',
      route: '/chat',
      elementSelector: '.chat-input-area',
      waitForElement: true,
      waitTimeout: 8000,
      placement: 'top',
      scrollIntoView: true,
      needsDropdownOpen: false
    }
  ])

  // 开始引导
  const startTour = async () => {
    isActive.value = true
    isInTour.value = true
    currentStepIndex.value = 0
    shouldKeepDropdownOpen.value = false
    
    await nextTick()
    
    // 确保在正确的路由
    const firstStep = steps.value[0]
    if (firstStep.route && router.currentRoute.value.path !== firstStep.route) {
      await router.push(firstStep.route)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // 等待元素出现
    if (firstStep.elementSelector) {
      await waitForElement(firstStep.elementSelector, firstStep.waitTimeout || 8000)
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    // 执行第一步的beforeEnter
    if (firstStep.beforeEnter) {
      await firstStep.beforeEnter()
    }
  }

  // 下一步
  const nextStep = async () => {
    const currentStep = steps.value[currentStepIndex.value]
    
    // 执行当前步骤的onNext钩子
    if (currentStep.onNext) {
      await currentStep.onNext()
    }
    
    currentStepIndex.value++
    
    if (currentStepIndex.value >= steps.value.length) {
      endTour()
      return
    }
    
    await nextTick()
    
    const nextStepData = steps.value[currentStepIndex.value]
    
    // 重置下拉菜单标记
    shouldKeepDropdownOpen.value = nextStepData.needsDropdownOpen || false
    
    // 如果下一步在不同路由，先跳转
    if (nextStepData.route && router.currentRoute.value.path !== nextStepData.route) {
      await router.push(nextStepData.route)
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    
    // 等待元素出现
    if (nextStepData.elementSelector) {
      const element = await waitForElement(nextStepData.elementSelector, nextStepData.waitTimeout || 8000)
      if (element && nextStepData.scrollIntoView) {
        await scrollToElement(nextStepData.elementSelector)
      }
      await new Promise(resolve => setTimeout(resolve, 400))
    }
    
    // 执行下一步的beforeEnter
    if (nextStepData.beforeEnter) {
      await nextStepData.beforeEnter()
    }
    
    await nextTick()
  }

  // 上一步
  const prevStep = async () => {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--
      
      await nextTick()
      
      const prevStepData = steps.value[currentStepIndex.value]
      
      // 重置下拉菜单标记
      shouldKeepDropdownOpen.value = prevStepData.needsDropdownOpen || false
      
      // 如果上一步在不同路由，跳转回去
      if (prevStepData.route && router.currentRoute.value.path !== prevStepData.route) {
        await router.push(prevStepData.route)
        await new Promise(resolve => setTimeout(resolve, 800))
      }
      
      // 等待元素出现
      if (prevStepData.elementSelector) {
        await waitForElement(prevStepData.elementSelector, prevStepData.waitTimeout || 8000)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      await nextTick()
    }
  }

  // 结束引导
  const endTour = () => {
    isActive.value = false
    isInTour.value = false
    currentStepIndex.value = 0
    shouldKeepDropdownOpen.value = false
    localStorage.setItem('tourCompleted', 'true')
  }

  // 检查是否已完成引导
  const isTourCompleted = () => {
    return localStorage.getItem('tourCompleted') === 'true'
  }

  // 重置引导状态
  const resetTour = () => {
    localStorage.removeItem('tourCompleted')
  }

  return {
    isActive,
    currentStepIndex,
    steps,
    isInTour,
    shouldKeepDropdownOpen,
    startTour,
    nextStep,
    prevStep,
    endTour,
    isTourCompleted,
    resetTour,
    keepDropdownOpen
  }
})