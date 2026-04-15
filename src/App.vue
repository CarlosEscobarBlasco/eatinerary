<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BottomNav from './components/BottomNav.vue'

const router = useRouter()
const route = useRoute()

// Carousel state
const startX = ref(0)
const currentX = ref(0)
const isDragging = ref(false)
const containerRef = ref(null)

// Views in order
const views = ['/', '/dishes']
const currentIndex = computed(() => views.indexOf(route.path))

function getDirection(offsetX) {
  if (Math.abs(offsetX) < 30) return null
  
  const currentIdx = currentIndex.value
  if (offsetX > 0 && currentIdx > 0) {
    return 'right' // Going to previous view
  } else if (offsetX < 0 && currentIdx < views.length - 1) {
    return 'left' // Going to next view
  }
  return null
}

function onTouchStart(e) {
  // Don't capture swipe on buttons or interactive elements
  if (e.target.closest('button') || e.target.closest('a')) return
  startX.value = e.touches[0].clientX
  isDragging.value = true
}

function onTouchMove(e) {
  if (!isDragging.value) return
  const currentPosition = e.touches[0].clientX
  currentX.value = currentPosition - startX.value
  
  const direction = getDirection(currentX.value)
  if (direction) {
    e.preventDefault()
  }
}

function onTouchEnd(e) {
  if (!isDragging.value) return
  const deltaX = currentX.value
  
  const direction = getDirection(deltaX)
  if (direction === 'left' && currentIndex.value < views.length - 1) {
    router.push(views[currentIndex.value + 1])
  } else if (direction === 'right' && currentIndex.value > 0) {
    router.push(views[currentIndex.value - 1])
  }
  
  isDragging.value = false
  currentX.value = 0
}

function onMouseDown(e) {
  // Don't capture swipe on buttons or interactive elements
  if (e.target.closest('button') || e.target.closest('a')) return
  startX.value = e.clientX
  isDragging.value = true
}

function onMouseMove(e) {
  if (!isDragging.value) return
  currentX.value = e.clientX - startX.value
  
  const direction = getDirection(currentX.value)
  if (direction) {
    document.body.style.overflow = 'hidden'
  }
}

function onMouseUp(e) {
  if (!isDragging.value) return
  const deltaX = currentX.value
  
  const direction = getDirection(deltaX)
  if (direction === 'left' && currentIndex.value < views.length - 1) {
    router.push(views[currentIndex.value + 1])
  } else if (direction === 'right' && currentIndex.value > 0) {
    router.push(views[currentIndex.value - 1])
  }
  
  document.body.style.overflow = ''
  isDragging.value = false
  currentX.value = 0
}

// Transition direction
const transitionName = computed(() => {
  if (currentX.value > 30) return 'slide-back'
  if (currentX.value < -30) return 'slide-forward'
  return ''
})
</script>

<template>
  <div 
    class="app-container"
    @touchstart.passive="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <RouterView v-slot="{ Component }">
      <Transition :name="transitionName" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
    <BottomNav />
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  overflow-x: hidden;
  touch-action: pan-y;
}

/* Fluid carousel transitions */
.slide-forward-enter-active,
.slide-forward-leave-active,
.slide-back-enter-active,
.slide-back-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.slide-forward-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-forward-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-back-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-back-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>