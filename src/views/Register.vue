<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
//@ts-ignore
import { registerUser } from '@/api/user'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

//@ts-ignore
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (registerForm.confirmPassword !== '') {
      if (formRef.value) {
        formRef.value.validateField('confirmPassword')
      }
    }
    callback()
  }
}

//@ts-ignore
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ],
  agreeTerms: [
    { 
      //@ts-ignore
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请同意用户协议和隐私政策'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ]
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 实际项目中应调用API注册
        const res = await registerUser(registerForm)
        console.log('注册成功:', registerForm)
        // 注册成功后跳转到登录页
        router.push('/login')
      } catch (error) {
        console.error('注册失败:', error)
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
    :model="registerForm" 
    :rules="rules" 
    label-position="top"
  >
    <el-form-item label="用户名" prop="username">
      <el-input 
        v-model="registerForm.username" 
        placeholder="请输入用户名"
        prefix-icon="el-icon-user"
      />
    </el-form-item>
    
    <el-form-item label="邮箱" prop="email">
      <el-input 
        v-model="registerForm.email" 
        placeholder="请输入邮箱"
        prefix-icon="el-icon-message"
      />
    </el-form-item>
    
    <el-form-item label="密码" prop="password">
      <el-input 
        v-model="registerForm.password" 
        type="password" 
        placeholder="请输入密码"
        prefix-icon="el-icon-lock"
        show-password
      />
    </el-form-item>
    
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input 
        v-model="registerForm.confirmPassword" 
        type="password" 
        placeholder="请再次输入密码"
        prefix-icon="el-icon-lock"
        show-password
      />
    </el-form-item>
    
    <el-form-item prop="agreeTerms">
      <el-checkbox v-model="registerForm.agreeTerms">
        我已阅读并同意<el-link type="primary" :underline="false">用户协议</el-link>和<el-link type="primary" :underline="false">隐私政策</el-link>
      </el-checkbox>
    </el-form-item>
    
    <el-form-item>
      <el-button 
        type="primary" 
        :loading="loading" 
        @click="submitForm(formRef)" 
        class="submit-btn"
      >
        注册
      </el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.submit-btn {
  width: 100%;
  margin-top: 10px;
  padding: 12px 0;
}
</style>