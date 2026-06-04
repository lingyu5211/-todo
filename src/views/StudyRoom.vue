<template>
  <div class="study-room-container">
    <RoomHeader :room="room" @leave="handleLeave" />
    <div class="room-body">
      <MemberPanel :members="members" />
      <StudyTimer @study-start="onStudyStart" @study-stop="onStudyStop" />
      <ChatPanel :messages="chatMessages" @send="sendMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import RoomHeader from '@/components/RoomHeader.vue'
import MemberPanel from '@/components/MemberPanel.vue'
import ChatPanel from '@/components/ChatPanel.vue'
import StudyTimer from '@/components/StudyTimer.vue'
import { useSocket } from '@/composables/useSocket'
import { getRoomDetail, joinRoom, leaveRoom, getRoomMessages } from '@/utils/api'
import type { Room, RoomMember, ChatMessage } from '@/types'

const props = defineProps<{ roomId: number }>()
const emit = defineEmits<{ (e: 'back'): void }>()

const { connect, disconnect, emit, on: onSocket } = useSocket()
const room = ref<Room | null>(null)
const members = ref<RoomMember[]>([])
const chatMessages = ref<ChatMessage[]>([])

const handleLeave = async () => {
  emit('room:leave', { roomId: props.roomId })
  try { await leaveRoom(props.roomId) } catch { /* non-critical */ }
  disconnect()
  emit('back')
}

const onStudyStart = () => {
  emit('study:start')
}

const onStudyStop = () => {
  emit('study:stop')
}

const sendMessage = (content: string) => {
  emit('chat:send', { roomId: props.roomId, content })
}

const loadRoom = async () => {
  try {
    const detail = await getRoomDetail(props.roomId)
    room.value = detail
    members.value = detail.members || []
  } catch {
    ElMessage.error('加载房间信息失败')
  }
  try {
    const msgs = await getRoomMessages(props.roomId, 1)
    chatMessages.value = msgs
  } catch { /* non-critical */ }
}

const setupSocket = () => {
  connect()
  setTimeout(() => {
    emit('room:join', { roomId: props.roomId })
  }, 500)

  onSocket('room:members', (data: any[]) => {
    members.value = data
  })

  onSocket('room:member_joined', (data: any) => {
    const exists = members.value.find(m => m.userId === data.userId)
    if (!exists) {
      members.value.push({ ...data, isOnline: true })
    } else {
      exists.isOnline = true
      exists.studyStatus = data.studyStatus
    }
  })

  onSocket('room:member_left', ({ userId }: { userId: number }) => {
    const m = members.value.find(x => x.userId === userId)
    if (m) m.isOnline = false
  })

  onSocket('room:member_status', ({ userId, studyStatus }: { userId: number; studyStatus: string }) => {
    const m = members.value.find(x => x.userId === userId)
    if (m) m.studyStatus = studyStatus as any
  })

  onSocket('chat:message', (msg: ChatMessage) => {
    chatMessages.value.push(msg)
  })
}

onMounted(async () => {
  try { await joinRoom(props.roomId) } catch { /* non-critical */ }
  await loadRoom()
  setupSocket()
})

onUnmounted(() => {
  emit('room:leave', { roomId: props.roomId })
  try { leaveRoom(props.roomId) } catch { /* non-critical */ }
  disconnect()
})
</script>

<style scoped>
.study-room-container {
  min-height: 100vh;
  background: #f5f5f5;
}
.room-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
