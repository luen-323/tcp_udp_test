<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTcpStore } from '@/stores/tcpStore'

const tcpStore = useTcpStore()

const localMode = ref(tcpStore.mode)
const localAddress = ref(tcpStore.config.address)
const localPort = ref(tcpStore.config.port)

watch([localMode, localAddress, localPort], () => {
  tcpStore.updateConfig({
    mode: localMode.value,
    address: localAddress.value,
    port: localPort.value
  })
})

const handleModeChange = (newMode: 'client' | 'server') => {
  if (newMode !== localMode.value) {
    // 如果正在监听或连接，先停止/断开
    if (tcpStore.status === 'listening') {
      tcpStore.stopServer()
    } else if (tcpStore.status === 'connected') {
      tcpStore.disconnect()
    }
    localMode.value = newMode
  }
}

const handleConnect = async () => {
  await tcpStore.connect()
}

const handleDisconnect = async () => {
  await tcpStore.disconnect()
}

const handleStartServer = async () => {
  await tcpStore.startServer()
}

const handleStopServer = async () => {
  await tcpStore.stopServer()
}
</script>

<template>
  <div class="card">
    <h3 class="card-title">🔌 连接配置</h3>
    
    <!-- Mode Selection -->
    <div class="mode-selector">
      <button 
        class="mode-btn"
        :class="{ active: localMode === 'client' }"
        @click="handleModeChange('client')"
      >
        客户端模式
      </button>
      <button 
        class="mode-btn"
        :class="{ active: localMode === 'server' }"
        @click="handleModeChange('server')"
      >
        服务端模式
      </button>
    </div>
    
    <!-- Client Mode Config -->
    <div v-if="localMode === 'client'" class="config-section">
      <div class="config-grid">
        <div class="config-item">
          <label>目标服务器地址</label>
          <input 
            v-model="localAddress"
            type="text"
            placeholder="例如: 127.0.0.1"
            :disabled="tcpStore.status === 'connected'"
          />
        </div>
        
        <div class="config-item">
          <label>端口</label>
          <input 
            v-model.number="localPort"
            type="number"
            placeholder="例如: 8080"
            min="1"
            max="65535"
            :disabled="tcpStore.status === 'connected'"
          />
        </div>
        
        <div class="config-actions">
          <button 
            v-if="tcpStore.status !== 'connected'"
            class="btn btn-success"
            @click="handleConnect"
            :disabled="tcpStore.isLoading"
          >
            {{ tcpStore.isLoading ? '连接中...' : '连接' }}
          </button>
          <button 
            v-else
            class="btn btn-danger"
            @click="handleDisconnect"
          >
            断开
          </button>
        </div>
      </div>
    </div>
    
    <!-- Server Mode Config -->
    <div v-else class="config-section">
      <div class="config-grid">
        <div class="config-item">
          <label>监听端口</label>
          <input 
            v-model.number="localPort"
            type="number"
            placeholder="例如: 8080"
            min="1"
            max="65535"
            :disabled="tcpStore.status === 'listening'"
          />
        </div>
        
        <div class="config-actions">
          <button 
            v-if="tcpStore.status !== 'listening'"
            class="btn btn-success"
            @click="handleStartServer"
            :disabled="tcpStore.isLoading"
          >
            {{ tcpStore.isLoading ? '启动中...' : '启动服务器' }}
          </button>
          <button 
            v-else
            class="btn btn-danger"
            @click="handleStopServer"
          >
            停止服务器
          </button>
        </div>
      </div>
      
      <!-- Connected Clients -->
      <div v-if="tcpStore.connectedClients.length > 0" class="clients-section">
        <h4>已连接的客户端</h4>
        <div class="clients-list">
          <div 
            v-for="client in tcpStore.connectedClients" 
            :key="client.id"
            class="client-item"
          >
            <div class="client-info">
              <span class="client-id">{{ client.id }}</span>
              <span class="client-status">🟢 在线</span>
            </div>
            <button 
              class="btn btn-sm btn-danger"
              @click="tcpStore.disconnectClient(client.id)"
            >
              断开
            </button>
          </div>
        </div>
      </div>
      <div v-else-if="tcpStore.status === 'listening'" class="clients-section">
        <div class="waiting-message">
          <p>等待客户端连接...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mode-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.mode-btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  background-color: var(--bg-card);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.mode-btn.active {
  background-color: var(--primary);
  color: var(--bg-primary);
  box-shadow: 0 4px 12px var(--glow-primary);
}

.config-section {
  margin-top: 8px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.config-item input {
  width: 100%;
}

.config-item input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.config-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.clients-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.clients-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.clients-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.client-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.client-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.client-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--text-primary);
}

.client-status {
  font-size: 12px;
  color: var(--success);
}

.waiting-message {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary);
  font-size: 14px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}
</style>
