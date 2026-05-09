<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUdpStore } from '@/stores/udpStore'

const udpStore = useUdpStore()

const localAddress = ref(udpStore.config.address)
const localTargetPort = ref(udpStore.config.targetPort)
const localLocalPort = ref(udpStore.config.localPort)

watch([localAddress, localTargetPort, localLocalPort], () => {
  udpStore.updateConfig({
    address: localAddress.value,
    targetPort: localTargetPort.value,
    localPort: localLocalPort.value
  })
})

const handleReconnect = async () => {
  await udpStore.closeUdp()
  await udpStore.initUdp()
}
</script>

<template>
  <div class="card">
    <h3 class="card-title">📡 连接配置</h3>
    
    <div class="config-grid">
      <div class="config-item">
        <label>目标 IP 地址</label>
        <input 
          v-model="localAddress"
          type="text"
          placeholder="例如: 127.0.0.1"
        />
      </div>
      
      <div class="config-item">
        <label>目标端口</label>
        <input 
          v-model.number="localTargetPort"
          type="number"
          placeholder="例如: 8080"
          min="1"
          max="65535"
        />
      </div>
      
      <div class="config-item">
        <label>本地端口</label>
        <input 
          v-model.number="localLocalPort"
          type="number"
          placeholder="0 (随机)"
          min="0"
          max="65535"
        />
      </div>
      
      <div class="config-actions">
        <button class="btn btn-secondary" @click="handleReconnect">
          🔄 重新连接
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

.config-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
</style>
