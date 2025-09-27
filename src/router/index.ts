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
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    
  },
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// router.beforeEach((to,from,next)=>{
//   if(!localStorage.getItem('islogin')){
//     next('/login')
//   }else{
//     next()
//   }
//   next()
// })

export default router