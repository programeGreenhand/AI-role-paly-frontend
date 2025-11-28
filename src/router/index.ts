import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Chat from '../views/Chat.vue'
import Settings from '../views/Settings.vue'




const routes = [
  // 首页入口
  {
    path: '/',
    name: 'Landing',
    component: ()=>import('../views/LandingPage.vue'),
  },

  {
    path:'/login',
    //重定向
    redirect:'/'
  },
  
  // 登录/注册页面
  {
    path:'/presentation',
    component:()=>import('../views/Presentation.vue'),
    children:[
      {
        path:'login',
        name:'Login',
        component:()=>import('../views/Login.vue')
        
      },
      {
        path:'register',
        name:'Register',
        component:()=>import('../views/Register.vue')
      }
    ]
  },

  // 主应用页面
  {
    path: '/hall',
    name: 'Home',
    component: Home,
    children:[
      {
        path: '',
        name: 'MainContent',
        component: ()=>import('../components/common/MainContent.vue'),
        meta:{authRequire:true}
      },
      {
        path: 'user/profile',
        name: 'UserProfile',
        component: ()=>import('../views/UserProfile.vue'),
        meta:{authRequire:true}
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta:{authRequire:true}
      },
      {
        path: 'shopping',
        name: 'Shopping',
        component: ()=>import('../views/Shopping.vue'),
        meta:{authRequire:true}
      }
    ]
  },
  
  // 聊天页面
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    
  },
  
  // 记忆卡片游戏页面
  {
    path: '/memory-game',
    name: 'MemoryGame',
    component: () => import('../views/MemoryGame.vue'),
    meta: { authRequire: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：保护需要认证的路由
// router.beforeEach((to, from, next) => {
//   // 检查用户是否登录
//   const isLoggedIn = localStorage.getItem('userId')
  
  
//   // 如果未登录且尝试访问需要认证的页面（/hall），重定向到首页
//   if (!isLoggedIn && to.meta.authRequire) {
//     next('/')
//   }
//   // 其他情况正常继续
//   else {
//     next()
//   }
// })

export default router