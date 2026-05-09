<script setup lang="ts">
import { computed } from 'vue'
import { useTcpStore } from '@/stores/tcpStore'

const tcpStore = useTcpStore()

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

const hexToText = (hex: string): string => {
  try {
    const hexClean = hex.replace(/\s/g, '')
    let text = ''
    for (let i = 0; i < hexClean.length; i += 2) {
      const charCode = parseInt(hexClean.substr(i, 2), 16)
      if (charCode >= 32 && charCode <= 126) {
        text += String.fromCharCode(charCode)
      } else {
        text += '.'
      }
    }
    return text
  } catch {
    return ''
  }
}

const receivedData = computed(() => tcpStore.receivedData)

const handleClear = () => {
  tcpStore.clearMessages()
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">📥 接收数据</h3>
      <div class="header-actions">
        <span class="data-count">{{ receivedData.length }} 条</span>
        <button class="btn btn-secondary btn-sm" @click="handleClear">
          清空
        </button>
      </div>
    </div>
    
    <div class="received-container">
      <div v-if="receivedData.length === 0" class="empty-state">
        <p>暂无接收数据</p>
        <p class="hint">等待客户端发送数据...</p>
      </div>
      
      <div v-else class="received-list">
        <div
          v-for="item in receivedData"
          :key="item.id"
          class="received-item"
        >
          <div class="item-header">
            <span class="item-source">
              📩 来自: {{ item.clientId }}
            </span>
            <span class="item-time">{{ formatTime(item.timestamp) }}</span>
            <span class="item-size">{{ item.size }} bytes</span>
          </div>
          
          <div class="item-content">
            <div class="data-section">
              <div class="data-label">Hex:</div>
              <code class="hex-data">{{ formatHex(item.data) }}</code>
            </div>
            
            <div class="data-section">
              <div class="data-label">文本:</div>
              <code class="text-data">{{ hexToText(item.data) }}</code>
            </div>
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.data-count {
  font-size: 13px;
  color: var(--text-secondary);
  background-color: var(--bg-card);
  padding: 4px 12px;
  border-radius: 12px;
}

.received-container {
  background-color: var(--bg-card);
  border-radius: 8px;
  min-height: 250px;
  max-height: 400px;
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

.received-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.received-item {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid var(--success);
  animation: fadeIn 0.3s ease;
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

.item-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
}

.item-source {
  font-weight: 600;
  color: var(--success);
}

.item-time {
  color: var(--text-secondary);
}

.item-size {
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.item-content {
  background-color: var(--bg-primary);
  border-radius: 6px;
  padding: 12px;
}

.data-section {
  margin-bottom: 8px;
}

.data-section:last-child {
  margin-bottom: 0;
}

.data-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
  text-transform: uppercase;
}

.hex-data {
  display: block;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 12px;
  color: var(--warning);
  word-break: break-all;
  line-height: 1.5;
}

.text-data {
  display: block;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 13px;
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.5;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}
</style>
