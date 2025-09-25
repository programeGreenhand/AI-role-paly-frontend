<!-- SearchBar.vue -->
<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8"/>
        <path d="21 21l-4.35-4.35"/>
      </svg>
      <input
        v-model="searchValue"
        type="text"
        placeholder="搜索角色名称、类型或标签..."
        class="search-input"
        @input="onSearch"
      />
      <button
        v-if="searchValue"
        @click="clearSearch"
        class="clear-button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  search: [query: string]
}>()

const searchValue = ref('')

const onSearch = () => {
  emit('search', searchValue.value)
}

const clearSearch = () => {
  searchValue.value = ''
  emit('search', '')
}
</script>

<style scoped>
.search-bar {
  max-width: 500px;
  margin: 0 auto;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 25px;
  padding: 0 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: #666;
  margin-right: 12px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 15px 0;
  font-size: 16px;
  background: transparent;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

.clear-button {
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
  transition: color 0.2s ease;
}

.clear-button:hover {
  color: #333;
}

.clear-button svg {
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .search-input {
    font-size: 16px; /* 防止iOS缩放 */
  }
}
</style>