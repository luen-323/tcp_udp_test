<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTcpStore } from '@/stores/tcpStore'

const tcpStore = useTcpStore()

const localAddress = ref(tcpStore.config.address)
const localPort = ref(tcpStore.config.port)

watch([localAddress, localPort], () => {
  tcpStore.updateConfig({
    address: localAddress.value,
    port: localPort.value
  })
})

const handleConnect = async () => {
  await tcpStore.connect()
}

const handleDisconnect = async () => {
  await tcpStore.disconnect()
}
</script>

<template>
  <div class="card">
    <h3 class="card-title">🔌 连接配置</h3>
    
    <div class="config-grid">
      <div class="config-item">
        <label>目标 IP 地址</label>
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
</template>

<style scoped>
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
</style>
