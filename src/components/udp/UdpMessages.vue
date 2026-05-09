<script setup lang="ts">
import { computed } from 'vue'
import { useUdpStore } from '@/stores/udpStore'

const udpStore = useUdpStore()

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  })
}

const formatHex = (hex: string) => {
  const result: string[] = []
  for (let i = 0; i < hex.length; i += 2) {
    result.push(hex.substring(i, i + 2))
  }
  return result.join(' ')
}

const messages = computed(() => udpStore.messages)

const handleClear = () => {
  udpStore.clearMessages()
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">📋 消息记录</h3>
      <button class="btn btn-secondary btn-sm" @click="handleClear">
        清空
      </button>
    </div>
    
    <div class="messages-container">
      <div v-if="messages.length === 0" class="empty-state">
        <p>暂无消息记录</p>
        <p class="hint">发送数据后将显示在这里</p>
      </div>
      
      <div v-else class="messages-list">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="[msg.type, { error: !msg.success }]"
        >
          <div class="message-header">
            <span class="message-type">
              {{ msg.type === 'send' ? '↑ 发送' : '↓ 接收' }}
            </span>
            <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            <span v-if="msg.address" class="message-address">
              {{ msg.address }}:{{ msg.port }}
            </span>
          </div>
          
          <div class="message-content">
            <div v-if="msg.data.length > 100" class="hex-display">
              <code>{{ formatHex(msg.data.substring(0, 100)) }}...</code>
            </div>
            <code v-else>{{ msg.data }}</code>
          </div>
          
          <div v-if="msg.size" class="message-meta">
            长度: {{ msg.size }} bytes
          </div>
          
          <div v-if="msg.error" class="message-error">
            错误: {{ msg.error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.messages-container {
  background-color: var(--bg-card);
  border-radius: 8px;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-secondary);
}

.empty-state .hint {
  font-size: 13px;
  margin-top: 8px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid var(--primary);
  animation: fadeIn 0.3s ease;
}

.message-item.send {
  border-left-color: var(--primary);
}

.message-item.receive {
  border-left-color: var(--success);
}

.message-item.error {
  border-left-color: var(--error);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.message-type {
  font-weight: 600;
  color: var(--primary);
}

.message-item.receive .message-type {
  color: var(--success);
}

.message-time {
  color: var(--text-secondary);
}

.message-address {
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.message-content {
  background-color: var(--bg-primary);
  border-radius: 4px;
  padding: 8px 12px;
  overflow-x: auto;
}

.message-content code {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
}

.hex-display code {
  color: var(--warning);
}

.message-meta {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.message-error {
  margin-top: 8px;
  font-size: 12px;
  color: var(--error);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}
</style>
