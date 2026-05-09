import { createRouter, createWebHistory } from 'vue-router'
import UdpView from '@/views/UdpView.vue'
import TcpView from '@/views/TcpView.vue'
import SettingsView from '@/views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/udp'
    },
    {
      path: '/udp',
      name: 'udp',
      component: UdpView
    },
    {
      path: '/tcp',
      name: 'tcp',
      component: TcpView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    }
  ]
})

export default router
