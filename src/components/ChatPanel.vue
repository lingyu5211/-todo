<template>
  <div class="chat-panel">
    <div class="message-list" ref="msgListRef">
      <div v-for="msg in messages" :key="msg.id" class="message" :class="{ 'is-system': msg.type === 'system' }">
        <template v-if="msg.type === 'system'">
          <span class="system-text">{{ msg.content }}</span>
        </template>
        <template v-else>
          <span class="msg-sender">{{ msg.name || msg.username }}: </span>
          <span class="msg-content">{{ msg.content }}</span>
        </template>
      </div>
      <div v-if="messages.length === 0" class="empty-chat">暂无消息，来打个招呼吧</div>
    </div>
    <div class="input-bar">
      <el-input
        v-model="inputText"
        placeholder="说点什么..."
        maxlength="500"
        show-word-limit
        @keyup.enter="send"
      >
        <template #append>
          <el-button :disabled="!inputText.trim()" @click="send">发送</el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { ChatMessage } from '@/types'

const props = defineProps<{ messages: ChatMessage[] }>()
const emit = defineEmits<{ (e: 'send', content: string): void }>()

const inputText = ref('')
const msgListRef = ref<HTMLElement | null>(null)

const send = () => {
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
}

watch(() => props.messages.length, async () => {
  await nextTick()
  if (msgListRef.value) {
    msgListRef.value.scrollTop = msgListRef.value.scrollHeight
  }
})
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}
.message-list {
  overflow-y: auto;
  padding: 12px;
  max-height: 300px;
}
.message {
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.5;
}
.message.is-system {
  text-align: center;
}
.system-text {
  color: #909399;
  font-size: 12px;
}
.msg-sender {
  color: #409EFF;
  font-weight: 500;
}
.msg-content {
  color: #303133;
}
.empty-chat {
  text-align: center;
  color: #C0C4CC;
  margin-top: 40px;
}
.input-bar {
  padding: 8px;
  border-top: 1px solid #eee;
}
</style>
