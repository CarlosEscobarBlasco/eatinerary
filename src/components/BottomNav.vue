<template>
  <!-- Sidebar Navigation for medium+ screens -->
  <nav class="sidebar-nav">
    <div class="sidebar-brand">
      <img src="/logo.png" alt="Mealendar" class="brand-logo" />
    </div>
    <div class="sidebar-menu">
      <RouterLink to="/" class="sidebar-item" :class="{ active: $route.path === '/' }">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span class="sidebar-label">Calendario</span>
      </RouterLink>
      
      <RouterLink to="/dishes" class="sidebar-item" :class="{ active: $route.path === '/dishes' }">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
          <path d="M7 2v20"></path>
          <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
        </svg>
        <span class="sidebar-label">Platos</span>
      </RouterLink>
    </div>
  </nav>

  <!-- Bottom Navigation for mobile -->
  <nav class="bottom-nav">
    <RouterLink to="/" class="nav-item" :class="{ active: $route.path === '/' }">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <span>Calendario</span>
    </RouterLink>
    
    <RouterLink to="/dishes" class="nav-item" :class="{ active: $route.path === '/dishes' }">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
        <path d="M7 2v20"></path>
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
      </svg>
      <span>Platos</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
/* Bottom Navigation for mobile */
.bottom-nav {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 440px;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  background: #e0d8c8;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 50;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 16px;
  color: var(--on-surface-variant);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  background: none;
  border: none;
  cursor: pointer;
}

.nav-item.active {
  background: var(--surface-container-low);
  color: var(--primary);
}

.nav-item svg {
  flex-shrink: 0;
}

/* Sidebar Navigation for medium+ screens */
.sidebar-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: var(--surface-container);
  display: flex;
  flex-direction: column;
  z-index: 100;
  padding: 24px 16px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

.brand-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: contain;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  color: var(--on-surface-variant);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
  background: none;
  border: none;
  cursor: pointer;
}

.sidebar-item.active {
  background: var(--primary);
  color: var(--on-primary);
}

.sidebar-item svg {
  flex-shrink: 0;
}

/* Hide sidebar on mobile, show on medium+ */
@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
  
  .sidebar-nav {
    display: flex;
  }
}

/* Hide sidebar on mobile */
@media (max-width: 767px) {
  .sidebar-nav {
    display: none;
  }
  
  .bottom-nav {
    display: flex;
  }
}
</style>