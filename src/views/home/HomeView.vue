<template>
  <div class="home">
    <header class="home-header">
      <div class="logo-icon">🍽️</div>
      <h1>Mealendar</h1>
      <p>Tu menú semanal</p>
    </header>

    <nav class="home-nav">
      <RouterLink to="/calendar" class="nav-card">
        <div class="nav-icon-wrapper">
          <span class="nav-icon">📅</span>
        </div>
        <div class="nav-text">
          <span class="nav-label">Calendario</span>
          <span class="nav-desc">Planifica tu semana</span>
        </div>
        <span class="nav-arrow">→</span>
      </RouterLink>

      <RouterLink to="/dishes" class="nav-card">
        <div class="nav-icon-wrapper">
          <span class="nav-icon">🍲</span>
        </div>
        <div class="nav-text">
          <span class="nav-label">Mis Platos</span>
          <span class="nav-desc">Gestiona tu repertorio</span>
        </div>
        <span class="nav-arrow">→</span>
      </RouterLink>
    </nav>

    <div class="home-footer">
      <p class="tip">💡 Consejo: Añade tus platos favoritos para planificar más rápido</p>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding: 32px 24px;
  background: linear-gradient(180deg, var(--surface-container-low) 0%, var(--surface) 100%);
  display: flex;
  flex-direction: column;
}

.home .content-wrapper {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.home-header {
  text-align: center;
  padding: 40px 0 48px;
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.home-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
  letter-spacing: -0.03em;
}

.home-header p {
  font-size: 1.125rem;
  color: var(--on-surface-variant);
  margin-top: 8px;
}

.home-nav {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nav-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--surface-container-lowest);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--on-surface);
  transition: all 0.2s;
  box-shadow: 0 2px 8px var(--shadow);
}

.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--shadow-lg);
}

.nav-card:active {
  transform: scale(0.98);
}

.nav-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-icon {
  font-size: 1.75rem;
}

.nav-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nav-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--on-surface);
}

.nav-desc {
  font-size: 0.875rem;
  color: var(--on-surface-variant);
  margin-top: 2px;
}

.nav-arrow {
  font-size: 1.25rem;
  color: var(--outline);
}

.home-footer {
  margin-top: auto;
  padding-top: 32px;
}

.tip {
  text-align: center;
  font-size: 0.875rem;
  color: var(--on-surface-variant);
  background: var(--surface-container);
  padding: 16px;
  border-radius: var(--radius-sm);
}

/* Wide content on medium+ screens */
@media (min-width: 768px) {
  .home .content-wrapper {
    max-width: 600px;
  }
}
</style>
