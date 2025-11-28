import type { GuideStep } from '@/stores/guide'

/**
 * 完整的引导流程配置
 * Home.vue → 左侧菜单 → 智能体宇宙 → Shopping.vue → 角色卡片
 */
export const guideSteps: GuideStep[] = [
  // 步骤1：Home.vue页面 - 点击菜单按钮
  {
    target: '.menu-button, .el-button[aria-label*="menu"], [class*="menu"], [class*="hamburger"]',
    title: '打开菜单栏',
    description: '点击这里打开左侧菜单栏，探索更多功能',
    placement: 'right',
    content: '这是您进入应用功能的第一步，菜单栏包含了所有主要功能入口。',
    beforeAction: async () => {
      // 确保在Home页面
      if (window.location.pathname !== '/') {
        window.location.href = '/'
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // 尝试打开菜单（如果菜单是折叠状态）
      const menuButton = document.querySelector('.menu-button, .el-button[aria-label*="menu"], [class*="menu"]') as HTMLElement
      if (menuButton) {
        const isCollapsed = document.body.classList.contains('menu-collapsed') || 
                          document.querySelector('.el-menu')?.classList.contains('el-menu--collapse')
        if (isCollapsed) {
          menuButton.click()
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
    }
  },

  // 步骤2：菜单栏 - 点击智能体宇宙按钮
  {
    target: '.menu-item[href*="shopping"], .menu-item:contains("智能体宇宙"), [class*="shopping"], [class*="agent-universe"]',
    title: '进入智能体宇宙',
    description: '点击"智能体宇宙"按钮，探索丰富的角色和对话体验',
    placement: 'right',
    route: '/shopping',
    content: '智能体宇宙是您与各种AI角色互动的地方，这里有丰富的角色供您选择。',
    beforeAction: async () => {
      // 确保菜单已打开
      const menuButton = document.querySelector('.menu-button, .el-button[aria-label*="menu"]') as HTMLElement
      if (menuButton) {
        const isCollapsed = document.body.classList.contains('menu-collapsed')
        if (isCollapsed) {
          menuButton.click()
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
    }
  },

  // 步骤3：Shopping.vue页面 - 介绍页面布局
  {
    target: '.shopping-container, .agent-universe, [class*="shopping"], [class*="character"], .character-grid',
    title: '智能体宇宙',
    description: '欢迎来到智能体宇宙！这里展示了所有可用的AI角色',
    placement: 'bottom',
    content: '每个角色都有独特的个性和能力，您可以选择感兴趣的角色开始对话。',
    beforeAction: async () => {
      // 确保在Shopping页面
      if (!window.location.pathname.includes('shopping')) {
        window.location.href = '/shopping'
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  },

  // 步骤4：Shopping.vue页面 - 第一张角色卡片
  {
    target: '.character-card:first-child, .el-card:first-child, [class*="character"]:first-child',
    title: '选择角色',
    description: '这是第一个AI角色卡片，点击可以查看详细信息',
    placement: 'top',
    content: '每个角色卡片都包含了角色的基本信息和使用场景介绍。',
    beforeAction: async () => {
      // 滚动到第一个角色卡片
      const firstCard = document.querySelector('.character-card:first-child, .el-card:first-child')
      if (firstCard) {
        firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  },

  // 步骤5：角色卡片 - 点击对话按钮
  {
    target: '.character-card:first-child .chat-button, .el-card:first-child .el-button--primary, [class*="chat"]:first-child',
    title: '开始对话',
    description: '点击"对话"按钮，与这个AI角色开始有趣的交流',
    placement: 'top',
    content: '点击后您将进入对话界面，可以体验与AI角色的互动。',
    needUserAction: true,
    beforeAction: async () => {
      // 确保第一个角色卡片可见
      const firstCard = document.querySelector('.character-card:first-child, .el-card:first-child')
      if (firstCard) {
        firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  },

  // 步骤6：完成引导
  {
    target: 'body',
    title: '引导完成！',
    description: '恭喜您完成了应用的基本使用引导！现在您可以自由探索所有功能了。',
    placement: 'center',
    content: '如果您需要重新查看引导，可以在设置中重置引导状态。祝您使用愉快！',
    beforeAction: async () => {
      // 引导完成后的处理
      console.log('引导流程完成')
    }
  }
]

/**
 * 获取特定页面的引导步骤
 */
export function getPageGuideSteps(page: string): GuideStep[] {
  const pageSteps: Record<string, GuideStep[]> = {
    'home': guideSteps.slice(0, 2), // Home页面的前2步
    'shopping': guideSteps.slice(2, 5), // Shopping页面的3步
    'all': guideSteps // 完整流程
  }
  
  return pageSteps[page] || []
}

/**
 * 检查是否需要显示引导
 */
export function shouldShowGuide(): boolean {
  const guideCompleted = localStorage.getItem('guide_completed')
  return guideCompleted !== 'true'
}

/**
 * 重置引导状态
 */
export function resetGuideState(): void {
  localStorage.removeItem('guide_completed')
}