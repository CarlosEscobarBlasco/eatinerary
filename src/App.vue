<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'
import BottomNav from './components/BottomNav.vue'

const router = useRouter()
const route = useRoute()

const startX = ref(0)
const startY = ref(0)
const isSwiping = ref(false)
const direction = ref('')

function onTouchStart(e) {
  startX.value = e.touches[0].clientX
  startY.value = e.touches[0].clientY
  isSwiping.value = true
  direction.value = ''
}

function onTouchEnd(e) {
  if (!isSwiping.value) return
  const endX = e.changedTouches[0].clientX
  const endY = e.changedTouches[0].clientY
  
  const deltaX = endX - startX.value
  const deltaY = endY - startY.value
  
  if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
    direction.value = deltaX > 0 ? 'right' : 'left'
    
    if (deltaX > 0) {
      if (route.path === '/dishes') {
        router.push('/')
      }
    } else {
      if (route.path === '/') {
        router.push('/dishes')
      }
    }
  }
  
  isSwiping.value = false
}

function onMouseDown(e) {
  startX.value = e.clientX
  startY.value = e.clientY
  isSwiping.value = true
  direction.value = ''
}

function onMouseUp(e) {
  if (!isSwiping.value) return
  const deltaX = e.clientX - startX.value
  const deltaY = e.clientY - startY.value
  
  if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
    direction.value = deltaX > 0 ? 'right' : 'left'
    
    if (deltaX > 0) {
      if (route.path === '/dishes') {
        router.push('/')
      }
    } else {
      if (route.path === '/') {
        router.push('/dishes')
      }
    }
  }
  
  isSwiping.value = false
}
</script>

<template>
  <div 
    class="app-container"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  >
    <RouterView v-slot="{ Component }">
      <Transition :name="direction" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <BottomNav />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  overflow-x: hidden;
}

/* Fluid carousel transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>