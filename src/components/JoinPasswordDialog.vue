<template>
  <el-dialog
    :model-value="visible"
    title="加入房间"
    width="90%"
    @close="handleClose"
  >
    <div class="password-dialog">
      <div class="password-icon">🔒</div>
      <p class="password-label">{{ roomName }}</p>
      <p class="password-hint">此房间需要密码才能加入</p>
      <el-input
        v-model="password"
        type="password"
        show-password
        placeholder="请输入房间密码"
        maxlength="16"
        @keyup.enter="handleSubmit"
      />
      <p v-if="errorMsg" class="password-error">{{ errorMsg }}</p>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :disabled="!password" :loading="submitting" @click="handleSubmit">
        加入房间
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { joinRoom as apiJoinRoom } from '@/utils/api'

const props = defineProps<{
  visible: boolean
  roomName: string
  roomId: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'joined', roomId: number): void
}>()

const password = ref('')
const errorMsg = ref('')
const submitting = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    password.value = ''
    errorMsg.value = ''
  }
})

const handleClose = () => {
  password.value = ''
  errorMsg.value = ''
  emit('close')
}

const handleSubmit = async () => {
  if (!password.value) return
  submitting.value = true
  errorMsg.value = ''
  try {
    await apiJoinRoom(props.roomId, password.value)
    emit('joined', props.roomId)
  } catch (e: any) {
    errorMsg.value = '密码错误，请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.password-dialog {
  text-align: center;
  padding: 8px 0;
}
.password-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.password-label {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}
.password-hint {
  font-size: 13px;
  color: #909399;
  margin: 0 0 20px 0;
}
.password-error {
  color: #f56c6c;
  font-size: 12px;
  margin: 8px 0 0 0;
}
</style>
