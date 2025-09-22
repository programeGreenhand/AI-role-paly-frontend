import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Chat from '../views/Chat.vue'
import Settings from '../views/Settings.vue'
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs'


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
    component: Home
  },
  {
    path: '/chat/:characterId?',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router