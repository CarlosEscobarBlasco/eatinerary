import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './lib/router'
import { useAuthStore } from './stores/auth'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth after pinia is installed
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')