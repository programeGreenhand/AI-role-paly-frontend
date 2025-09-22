<template>
  <el-select
    v-model="selectedSceneId"
    placeholder="选择场景"
    @change="handleSceneChange"
    class="scene-selector"
  >
    <el-option
      v-for="scene in availableScenes"
      :key="scene.id"
      :label="scene.name"
      :value="scene.id"
    >
      <div class="scene-option">
        <span class="scene-name">{{ scene.name }}</span>
        <span class="scene-theme">{{ scene.theme }}</span>
      </div>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSceneStore } from '../../stores/scene'

const props = defineProps<{
  characterId: string
}>()

const emit = defineEmits<{
  change: [scene: any]
}>()

const sceneStore = useSceneStore()
const selectedSceneId = ref('')

const availableScenes = computed(() => {
  return sceneStore.getScenesForCharacter(props.characterId)
})

const handleSceneChange = (sceneId: string) => {
  const scene = sceneStore.getSceneById(sceneId)
  if (scene) {
    emit('change', scene)
  }
}

watch(availableScenes, (scenes) => {
  if (scenes.length > 0 && !selectedSceneId.value) {
    selectedSceneId.value = scenes[0]?.id
    handleSceneChange(scenes[0].id)
  }
}, { immediate: true })


</script>

<style scoped>
.scene-selector {
  min-width: 150px;
}

.scene-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scene-name {
  font-weight: 500;
}

.scene-theme {
  font-size: 12px;
  color: #999;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 10px;
}
</style>