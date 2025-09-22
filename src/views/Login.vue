<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
//@ts-ignore
import { loginUser } from '../api/user'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ]
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 实际项目中应调用API登录
        // const res = await loginUser(loginForm)
        console.log('登录成功:', loginForm)
        // 登录成功后跳转
        router.push('/detection')
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <el-form 
    ref="formRef" 
    :model="loginForm" 
    :rules="rules" 
    label-position="top"
  >
    <el-form-item label="用户名" prop="username">
      <el-input 
        v-model="loginForm.username" 
        placeholder="请输入用户名"
        prefix-icon="el-icon-user"
      />
    </el-form-item>
    
    <el-form-item label="密码" prop="password">
      <el-input 
        v-model="loginForm.password" 
        type="password" 
        placeholder="请输入密码"
        prefix-icon="el-icon-lock"
        show-password
      />
    </el-form-item>
    
    <el-form-item>
      <div class="remember-forgot">
        <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
        <el-link type="primary" :underline="false">忘记密码?</el-link>
      </div>
    </el-form-item>
    
    <el-form-item>
      <el-button 
        type="primary" 
        :loading="loading" 
        @click="submitForm(formRef)" 
        class="submit-btn"
      >
        登录
      </el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
  padding: 12px 0;
}
</style>