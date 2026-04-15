<template>
  <div class="login-view">
    <div class="login-header">
      <img src="/logo.png" alt="Mealendar" class="login-logo" />
      <p>Mealendar</p>
    </div>

    <form @submit.prevent="handleSubmit" class="login-form">
      <div class="form-group">
        <label>Email</label>
        <input 
          v-model="email" 
          type="email" 
          required 
          placeholder="tu@email.com"
          class="input-field"
          autocomplete="email"
        />
      </div>

      <div class="form-group">
        <label>Contraseña</label>
        <input 
          v-model="password" 
          type="password" 
          required 
          placeholder="Contraseña"
          class="input-field"
          autocomplete="current-password"
        />
      </div>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

      <button 
        type="submit" 
        class="submit-btn" 
        :disabled="authStore.loading"
      >
        Entrar
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMsg = ref('')

onMounted(async () => {
  window.dispatchEvent(new CustomEvent('hide-bottom-nav'))
  
  // Check if already logged in
  const { data: { session } } = await authStore.getSession()
  if (session) {
    router.push('/')
  }
})

onUnmounted(() => {
  window.dispatchEvent(new CustomEvent('show-bottom-nav'))
})

async function handleSubmit() {
  errorMsg.value = ''
  
  const result = await authStore.signIn(email.value, password.value)
  
  if (authStore.error) {
    errorMsg.value = authStore.error
  } else if (result?.session) {
    router.push('/')
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
}

.login-header {
  text-align: center;
  margin-bottom: 48px;
}

.login-logo {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  margin-bottom: 8px;
}

.login-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 8px;
}

.login-header p {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary);
  margin: 0;
  letter-spacing: 0.5px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--on-surface);
}

.input-field {
  width: 100%;
  padding: 16px;
  background: var(--surface-container);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  color: var(--on-surface);
}

.input-field:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--primary);
}

.input-field::placeholder {
  color: var(--on-surface-variant);
}

.error-msg {
  color: var(--error);
  font-size: 0.875rem;
  text-align: center;
  margin: 0;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.toggle-btn {
  width: 100%;
  padding: 12px;
  background: none;
  color: var(--primary);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}
</style>