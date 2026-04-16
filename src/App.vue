<script setup>
import { RouterView, useRoute } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const showBottomNav = ref(true)

const isLargeScreen = ref(false)

onMounted(() => {
  window.addEventListener('hide-bottom-nav', () => {
    showBottomNav.value = false
  })
  window.addEventListener('show-bottom-nav', () => {
    showBottomNav.value = true
  })
  
  // Check screen size
  const checkScreenSize = () => {
    isLargeScreen.value = window.innerWidth >= 768
  }
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

const hasSidebar = computed(() => isLargeScreen.value)
</script>

<template>
  <div class="app-container" :class="{ 'with-sidebar': hasSidebar }">
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
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.app-container.with-sidebar {
  max-width: none;
  margin: 0;
  padding-left: 240px;
}

@media (min-width: 768px) {
  .app-container {
    max-width: none;
    margin: 0;
  }
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