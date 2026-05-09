<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useTcpStore } from '@/stores/tcpStore'
import TcpConfig from '@/components/tcp/TcpConfig.vue'
import TcpSender from '@/components/tcp/TcpSender.vue'
import TcpMessages from '@/components/tcp/TcpMessages.vue'
import TcpReceivedData from '@/components/tcp/TcpReceivedData.vue'

const tcpStore = useTcpStore()
const isInitialized = ref(false)

const currentMode = computed(() => tcpStore.mode)

onMounted(() => {
  if (window.electronAPI) {
    // TCP Client event listeners
    window.electronAPI.tcp.onData((data) => {
      tcpStore.addReceivedData(data.data, data.size)
    })
    
    window.electronAPI.tcp.onStatus((statusData) => {
      const statusMap: Record<string, any> = {
        'connected': 'connected',
        'disconnected': 'disconnected',
        'error': 'error',
        'connecting': 'connecting'
      }
      tcpStore.setStatus(statusMap[statusData.status] || 'disconnected')
    })

    // TCP Server event listeners
    window.electronAPI.tcpServer.onStatus((statusData) => {
      if (statusData.status === 'listening') {
        tcpStore.setStatus('listening')
      } else if (statusData.status === 'stopped') {
        tcpStore.setStatus('stopped')
      } else if (statusData.status === 'error') {
        tcpStore.setStatus('error')
      }
    })

    window.electronAPI.tcpServer.onClientConnect((client) => {
      tcpStore.addClient(client.address, client.port, client.id)
    })

    window.electronAPI.tcpServer.onClientDisconnect((client) => {
      tcpStore.removeClient(client.id)
    })

    window.electronAPI.tcpServer.onData((data) => {
      tcpStore.addServerReceivedData(data.data, data.size, data.address, data.port, data.id)
    })

    window.electronAPI.tcpServer.onError((errorData) => {
      console.error('TCP Server error:', errorData.error)
    })
  }
  
  isInitialized.value = true
})

onUnmounted(() => {
  if (tcpStore.mode === 'server' && tcpStore.status === 'listening') {
    tcpStore.stopServer()
  } else if (tcpStore.mode === 'client' && tcpStore.status === 'connected') {
    tcpStore.disconnect()
  }
})
</script>

<template>
  <div class="tcp-view">
    <header class="view-header">
      <h2>TCP 协议测试</h2>
      <div class="status">
        <span class="status-indicator" :class="{
          'status-connected': tcpStore.status === 'connected' || tcpStore.status === 'listening',
          'status-disconnected': tcpStore.status === 'disconnected' || tcpStore.status === 'stopped',
          'status-connecting': tcpStore.status === 'connecting',
          'status-error': tcpStore.status === 'error'
        }"></span>
        <span>{{ {
          'disconnected': '未连接',
          'connecting': '连接中...',
          'connected': '已连接',
          'listening': '监听中',
          'stopped': '已停止',
          'error': '连接错误'
        }[tcpStore.status] }}</span>
      </div>
    </header>
    
    <div class="view-content">
      <TcpConfig />
      <TcpSender v-if="isInitialized" />
      <div class="data-panels" v-if="currentMode === 'server'">
        <TcpReceivedData />
      </div>
      <TcpMessages />
    </div>
  </div>
</template>

<style scoped>
.tcp-view {
  max-width: 1400px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.view-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.view-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-panels {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
</style>
