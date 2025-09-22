import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Chat from '../views/Chat.vue'
import Settings from '../views/Settings.vue'



const routes = [
  {
    path:'/',
    component:()=>import('../views/Presentation.vue'),
    redirect:'/login',
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

  {
    path: '/hall',
    name: 'Home',
    component: Home,
    children:[
      {
        path: '',
        name: 'MainContent',
        component: ()=>import('../components/common/MainContent.vue')
      },
      {
        path: 'user/profile',
        name: 'UserProfile',
        component: ()=>import('@/views/UserProfile.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings
      }
    ]
  },
  {
    path: '/chat/:characterId?',
    name: 'Chat',
    component: Chat
  },
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router