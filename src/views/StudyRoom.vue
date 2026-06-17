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

const { connect, disconnect, emit: socketEmit, on: onSocket } = useSocket()
const room = ref<Room | null>(null)
const members = ref<RoomMember[]>([])
const chatMessages = ref<ChatMessage[]>([])

// Deduplicate members by userId and update online count
const syncMembers = () => {
  const seen = new Map<number, RoomMember>()
  for (const m of members.value) {
    const existing = seen.get(m.userId)
    // Prefer online entry over offline, studying over idle
    if (!existing || (m.isOnline && !existing.isOnline)) {
      seen.set(m.userId, m)
    }
  }
  members.value = Array.from(seen.values())
  if (room.value) {
    room.value.onlineCount = members.value.filter(m => m.isOnline).length
  }
}

// Thread-safe upsert into members array
const upsertMember = (data: Partial<RoomMember> & { userId: number }) => {
  const exists = members.value.find(m => m.userId === data.userId)
  if (exists) {
    Object.assign(exists, data)
  } else {
    members.value.push(data as RoomMember)
  }
  syncMembers()
}

const handleLeave = async () => {
  socketEmit('room:leave', { roomId: props.roomId })
  try { await leaveRoom(props.roomId) } catch { /* non-critical */ }
  disconnect()
  emit('back')
}

const onStudyStart = () => {
  socketEmit('study:start')
}

const onStudyStop = () => {
  socketEmit('study:stop')
}

const sendMessage = (content: string) => {
  socketEmit('chat:send', { roomId: props.roomId, content })
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
    socketEmit('room:join', { roomId: props.roomId })
  }, 500)

  onSocket('room:members', (data: any[]) => {
    // Server list = currently connected users — mark everyone not in it as offline
    const serverUserIds = new Set(data.map((m: any) => m.userId))
    for (const m of members.value) {
      m.isOnline = serverUserIds.has(m.userId)
    }
    for (const m of data) {
      upsertMember({ ...m, isOnline: true })
    }
  })

  onSocket('room:member_joined', (data: any) => {
    upsertMember({ ...data, isOnline: true })
  })

  onSocket('room:member_left', ({ userId }: { userId: number }) => {
    upsertMember({ userId, isOnline: false })
  })

  onSocket('room:member_status', ({ userId, studyStatus }: { userId: number; studyStatus: string }) => {
    upsertMember({ userId, studyStatus: studyStatus as RoomMember['studyStatus'] })
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
  socketEmit('room:leave', { roomId: props.roomId })
  try { leaveRoom(props.roomId) } catch { /* non-critical */ }
  disconnect()
})
</script>

<style scoped>
.study-room-container {
  min-height: 100vh;
}
.room-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
