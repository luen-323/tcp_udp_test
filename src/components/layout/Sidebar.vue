<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/udp', label: 'UDP 测试', icon: '📡' },
  { path: '/tcp', label: 'TCP 测试', icon: '🔌' },
  { path: '/settings', label: '设置', icon: '⚙️' }
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1 class="logo">🌐 NetTester</h1>
      <p class="subtitle">网络协议测试工具</p>
    </div>
    
    <nav class="nav-menu">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: route.path === item.path }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
    
    <div class="sidebar-footer">
      <p class="version">v1.0.0</p>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid var(--border);
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.subtitle {
  font-size: 12px;
  color: var(--text-secondary);
}

.nav-menu {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-item:hover {
  background-color: var(--bg-card);
  color: var(--text-primary);
}

.nav-item.active {
  background-color: var(--primary);
  color: var(--bg-primary);
  box-shadow: 0 4px 12px var(--glow-primary);
}

.nav-icon {
  font-size: 20px;
}

.nav-label {
  font-size: 14px;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.version {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}
</style>
