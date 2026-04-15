<script setup>
import { RouterView, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const showBottomNav = ref(true)

onMounted(() => {
  window.addEventListener('hide-bottom-nav', () => {
    showBottomNav.value = false
  })
  window.addEventListener('show-bottom-nav', () => {
    showBottomNav.value = true
  })
})
</script>

<template>
  <div class="app-container">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
    <BottomNav v-if="showBottomNav" />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  overflow-x: hidden;
  touch-action: pan-y;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>