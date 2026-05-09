<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTcpStore } from '@/stores/tcpStore'

const tcpStore = useTcpStore()

const message = ref('')
const isHex = ref(false)
const selectedClientId = ref<string | null>(null)

const isConnected = computed(() => tcpStore.status === 'connected')
const isListening = computed(() => tcpStore.status === 'listening')
const isServerMode = computed(() => tcpStore.mode === 'server')
const canSend = computed(() => {
  if (isServerMode.value) {
    return isListening.value && tcpStore.connectedClients.length > 0
  }
  return isConnected.value
})

const handleSend = () => {
  if (message.value.trim() && canSend.value) {
    if (isServerMode.value) {
      // Server mode - use broadcast or specific client
      tcpStore.serverSend(message.value, isHex.value, selectedClientId.value || undefined)
    } else {
      // Client mode
      tcpStore.sendMessage(message.value, isHex.value)
    }
    message.value = ''
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'Enter') {
    handleSend()
  }
}

const handleBroadcast = () => {
  if (message.value.trim() && canSend.value) {
    tcpStore.serverSend(message.value, isHex.value, undefined) // undefined means broadcast
    message.value = ''
  }
}
</script>

<template>
  <div class="card">
    <h3 class="card-title">✉️ 发送数据</h3>
    
    <div class="sender-content">
      <!-- Mode Toggle -->
      <div class="mode-toggle">
        <button 
          class="mode-btn"
          :class="{ active: !isHex }"
          @click="isHex = false"
          :disabled="!canSend"
        >
          文本模式
        </button>
        <button 
          class="mode-btn"
          :class="{ active: isHex }"
          @click="isHex = true"
          :disabled="!canSend"
        >
          Hex 模式
        </button>
      </div>
      
      <!-- Server Mode: Client Selection -->
      <div v-if="isServerMode && tcpStore.connectedClients.length > 0" class="client-selector">
        <label>发送到:</label>
        <select v-model="selectedClientId">
          <option :value="null">广播到所有客户端</option>
          <option 
            v-for="client in tcpStore.connectedClients" 
            :key="client.id"
            :value="client.id"
          >
            {{ client.id }}
          </option>
        </select>
      </div>
      
      <!-- Message Input -->
      <textarea
        v-model="message"
        class="message-input"
        :placeholder="canSend 
          ? (isHex ? '输入十六进制数据 (例如: 48656C6C6F20576F726C64)' : '输入要发送的文本数据')
          : (isServerMode ? '请先启动服务器并等待客户端连接' : '请先建立 TCP 连接')"
        rows="6"
        @keydown="handleKeyDown"
        :disabled="!canSend"
      ></textarea>
      
      <div class="sender-actions">
        <span class="hint">Ctrl + Enter 快捷发送</span>
        <div class="action-buttons">
          <button 
            v-if="isServerMode && tcpStore.connectedClients.length > 0"
            class="btn btn-secondary"
            @click="handleBroadcast"
            :disabled="!message.trim() || !canSend"
          >
            📢 广播
          </button>
          <button 
            class="btn btn-primary"
            @click="handleSend"
            :disabled="!message.trim() || !canSend"
          >
            🚀 发送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sender-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mode-toggle {
  display: flex;
  gap: 8px;
}

.mode-btn {
  padding: 8px 16px;
  border-radius: 6px;
  background-color: var(--bg-card);
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s ease;
}

.mode-btn:hover:not(:disabled) {
  color: var(--text-primary);
}

.mode-btn.active {
  background-color: var(--primary);
  color: var(--bg-primary);
}

.mode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.client-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.client-selector label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}

.client-selector select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background-color: var(--bg-card);
  color: var(--text-primary);
  font-size: 13px;
}

.client-selector select:focus {
  outline: none;
  border-color: var(--primary);
}

.message-input {
  width: 100%;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 14px;
  resize: vertical;
  min-height: 120px;
}

.message-input::placeholder {
  font-family: 'Inter', sans-serif;
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sender-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hint {
  font-size: 12px;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
