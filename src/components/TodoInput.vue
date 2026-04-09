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

    const handleAdd = () => {
      if (inputText.value.trim()) {
        emit('add-todo', inputText.value)
        inputText.value = ''
      }
    }

    return {
      inputText,
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