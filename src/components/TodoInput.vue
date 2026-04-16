<template>
  <div class="todo-input-container">
    <el-input
      v-model="inputText"
      @keyup.enter="handleAdd"
      placeholder="添加新的待办事项..."
      class="todo-input"
      prefix-icon="Search"
    >
      <template #append>
        <el-input-number 
          v-model="targetMinutes" 
          :min="1" 
          :max="480" 
          :step="15"
          label="目标时间（分钟）"
          size="small"
          style="width: 150px"
        />
        <el-button type="primary" @click="handleAdd" icon="Plus">
          添加
        </el-button>
      </template>
    </el-input>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'TodoInput',
  emits: ['add-todo'],
  setup(props, { emit }) {
    const inputText = ref('')
    const targetMinutes = ref(60) // 默认目标时间为60分钟

    const handleAdd = () => {
      if (inputText.value.trim()) {
        emit('add-todo', inputText.value, targetMinutes.value)
        inputText.value = ''
        targetMinutes.value = 60 // 重置目标时间为默认值
      }
    }

    return {
      inputText,
      targetMinutes,
      handleAdd
    }
  }
}
</script>

<style scoped>
.todo-input-container {
  margin-bottom: 20px;
}

.todo-input {
  width: 100%;
}
</style>