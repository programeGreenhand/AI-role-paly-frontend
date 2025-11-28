<template>
  <div class="example-container">
    <h2>Guid.vue 使用示例</h2>
    
    <!-- 示例1：基本用法 -->
    <div class="example-section">
      <h3>1. 基本用法（显示触发按钮）</h3>
      <Guid />
      <div class="target-element" data-guide-target="control-trigger">
        控制触发器元素
      </div>
      <div class="target-element" data-guide-target="search-input">
        搜索输入框
      </div>
    </div>
    
    <!-- 示例2：自定义步骤 -->
    <div class="example-section">
      <h3>2. 自定义引导步骤</h3>
      <Guid 
        :steps="customSteps"
        position="top-right"
      />
      <div class="target-element custom-element-1">
        自定义元素1
      </div>
      <div class="target-element custom-element-2">
        自定义元素2
      </div>
    </div>
    
    <!-- 示例3：自动开始引导 -->
    <div class="example-section">
      <h3>3. 自动开始引导</h3>
      <Guid 
        :auto-start="autoStart"
        :show-trigger="false"
      />
      <el-button @click="autoStart = true">
        开始自动引导
      </el-button>
    </div>
    
    <!-- 示例4：通过ref调用方法 -->
    <div class="example-section">
      <h3>4. 通过ref调用方法</h3>
      <Guid 
        ref="guideRef"
        :show-trigger="false"
      />
      <el-button @click="startGuideProgrammatically">
        编程方式开始引导
      </el-button>
      <el-button @click="endGuideProgrammatically">
        结束引导
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Guid from './Guid.vue'

// 自定义引导步骤
const customSteps = ref([
  {
    target: '.custom-element-1',
    title: '自定义步骤1',
    description: '这是第一个自定义引导步骤',
    placement: 'right'
  },
  {
    target: '.custom-element-2',
    title: '自定义步骤2',
    description: '这是第二个自定义引导步骤',
    placement: 'bottom'
  }
])

// 自动开始控制
const autoStart = ref(false)

// 通过ref调用方法
const guideRef = ref()

const startGuideProgrammatically = () => {
  if (guideRef.value) {
    guideRef.value.startTour()
  }
}

const endGuideProgrammatically = () => {
  if (guideRef.value) {
    guideRef.value.endTour()
  }
}
</script>

<style scoped>
.example-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.target-element {
  padding: 10px;
  margin: 10px 0;
  background-color: #f5f5f5;
  border-radius: 4px;
  border: 1px dashed #ccc;
}

.custom-element-1 {
  background-color: #e3f2fd;
}

.custom-element-2 {
  background-color: #f3e5f5;
}
</style>