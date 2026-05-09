<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTcpStore } from '@/stores/tcpStore'

const tcpStore = useTcpStore()

const message = ref('')
const isHex = ref(false)

const emit = defineEmits<{
  send: [message: string, isHex: boolean]
}>()

const isConnected = computed(() => tcpStore.status === 'connected')

const handleSend = () => {
  if (message.value.trim() && isConnected.value) {
    emit('send', message.value, isHex.value)
    message.value = ''
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'Enter') {
    handleSend()
  }
}
</script>

<template>
  <div class="card">
    <h3 class="card-title">✉️ 发送数据</h3>
    
    <div class="sender-content">
      <div class="mode-toggle">
        <button 
          class="mode-btn"
          :class="{ active: !isHex }"
          @click="isHex = false"
          :disabled="!isConnected"
        >
          文本模式
        </button>
        <button 
          class="mode-btn"
          :class="{ active: isHex }"
          @click="isHex = true"
          :disabled="!isConnected"
        >
          Hex 模式
        </button>
      </div>
      
      <textarea
        v-model="message"
        class="message-input"
        :placeholder="isConnected 
          ? (isHex ? '输入十六进制数据 (例如: 48656C6C6F20576F726C64)' : '输入要发送的文本数据')
          : '请先建立 TCP 连接'"
        rows="6"
        @keydown="handleKeyDown"
        :disabled="!isConnected"
      ></textarea>
      
      <div class="sender-actions">
        <span class="hint">Ctrl + Enter 快捷发送</span>
        <button 
          class="btn btn-primary"
          @click="handleSend"
          :disabled="!message.trim() || !isConnected"
        >
          🚀 发送
        </button>
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
