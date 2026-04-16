<script setup>
import { RouterView, useRoute } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const showBottomNav = ref(true)

const isLargeScreen = ref(false)
const sidebarCollapsed = ref(true)

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
  
  // Listen for sidebar collapse
  window.addEventListener('sidebar-collapse', (e) => {
    sidebarCollapsed.value = e.detail.collapsed
  })
})

const hasSidebar = computed(() => isLargeScreen.value)

const sidebarWidth = computed(() => {
  if (!isLargeScreen.value) return '0px'
  return sidebarCollapsed.value ? '72px' : '240px'
})
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
  padding-left: v-bind(sidebarWidth);
  transition: padding-left 0.3s ease;
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