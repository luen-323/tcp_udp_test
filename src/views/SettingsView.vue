<script setup lang="ts">
import { ref } from 'vue'

const encoding = ref('utf-8')
const displayMode = ref('hex')
const timeout = ref(5000)
</script>

<template>
  <div class="settings-view">
    <header class="view-header">
      <h2>⚙️ 设置</h2>
    </header>
    
    <div class="settings-content">
      <div class="card">
        <h3 class="card-title">📝 通用设置</h3>
        
        <div class="settings-grid">
          <div class="setting-item">
            <label>字符编码</label>
            <select v-model="encoding">
              <option value="utf-8">UTF-8</option>
              <option value="gbk">GBK</option>
              <option value="ascii">ASCII</option>
            </select>
            <p class="setting-hint">数据发送和接收时使用的字符编码</p>
          </div>
          
          <div class="setting-item">
            <label>默认显示模式</label>
            <select v-model="displayMode">
              <option value="text">文本模式</option>
              <option value="hex">Hex 模式</option>
            </select>
            <p class="setting-hint">消息列表中的数据显示格式</p>
          </div>
          
          <div class="setting-item">
            <label>连接超时 (毫秒)</label>
            <input 
              v-model.number="timeout"
              type="number"
              min="1000"
              max="30000"
              step="1000"
            />
            <p class="setting-hint">TCP 连接建立的最大等待时间</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h3 class="card-title">ℹ️ 关于</h3>
        <div class="about-content">
          <p><strong>UDP/TCP 协议测试工具</strong></p>
          <p>版本: 1.0.0</p>
          <p class="about-desc">
            一款面向网络工程师、开发者和运维人员的桌面应用程序，
            用于测试和调试 UDP 和 TCP 协议通信。
          </p>
          <div class="tech-stack">
            <span class="tech-badge">Electron</span>
            <span class="tech-badge">Vue 3</span>
            <span class="tech-badge">TypeScript</span>
            <span class="tech-badge">Pinia</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 800px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.view-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.setting-item select,
.setting-item input {
  width: 100%;
  max-width: 300px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
}

.setting-hint {
  font-size: 12px;
  color: var(--text-secondary);
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-content p {
  color: var(--text-secondary);
  font-size: 14px;
}

.about-content strong {
  color: var(--primary);
  font-size: 16px;
}

.about-desc {
  margin-top: 8px;
  line-height: 1.6;
}

.tech-stack {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.tech-badge {
  padding: 4px 12px;
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
