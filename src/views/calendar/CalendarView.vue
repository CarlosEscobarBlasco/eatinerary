<template>
  <div class="calendar-view">
    <!-- Header -->
    <header class="calendar-header">
      <!-- Title row -->
      <h1 class="title">{{ monthNames[currentMonth] + ' ' + currentYear }}</h1>
      
      <!-- Navigation row between content and header -->
      <div class="nav-row">
        <button class="nav-btn" @click="prevMonth">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <button class="today-btn" @click="goToToday">Hoy</button>
        
        <button class="nav-btn" @click="nextMonth">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      
      <!-- List/Grid Toggle -->
      <div class="view-toggle">
        <button class="toggle-btn" :class="{ active: isListView }" @click="isListView = true">
          Listado
        </button>
        <button class="toggle-btn" :class="{ active: !isListView }" @click="isListView = false">
          Cuadrícula
        </button>
      </div>

      <!-- Weekend toggle (only in list view) -->
      <div v-if="isListView" class="weekend-toggle">
        <span class="weekend-label" @click="showWeekend = !showWeekend">Mostrar fin de semana</span>
        <div class="toggle-switch" :class="{ on: showWeekend }" @click="showWeekend = !showWeekend">
          <div class="toggle-thumb"></div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="calendar-content">
      <!-- List View - All days of month with week separators -->
      <div v-if="isListView" class="month-list">
<div v-for="week in monthWeeks" :key="week.start" class="week-group">
          <div class="week-header">
            {{ getWeekLabel(week.days) }}
          </div>
          
          <template v-for="day in (showWeekend ? week.days : week.days.filter(d => d && !d.isWeekend))" :key="day?.date">
          <div 
            v-if="day"
            class="day-row"
            :class="{ 'today': day.isToday, 'weekend': day.isWeekend }"
            :ref="el => { if (day?.isToday) todayRow = el }"
            @click="selectDate(day)"
          >
            <div class="day-info">
              <span class="day-name">{{ day.dayName }}</span>
              <span class="day-number">{{ day.day }}</span>
            </div>
            
            <div class="day-meals">
              <div v-if="day.hasLunch" class="meal-item">
                <span class="meal-name">{{ day.lunchName }}</span>
              </div>
              <div v-else class="meal-item empty">
                <span class="meal-empty">Sin planificar</span>
              </div>
              
              <div v-if="day.hasDinner" class="meal-item">
                <span class="meal-name">{{ day.dinnerName }}</span>
              </div>
              <div v-else class="meal-item empty">
                <span class="meal-empty">Sin planificar</span>
              </div>
            </div>
            
            <div class="day-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
          </template>
        </div>

        <!-- Copy Month Button -->
        <button class="copy-month-btn" @click="showCopyModal = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copiar mes anterior</span>
        </button>
      </div>

      <!-- Grid View - Monthly calendar -->
      <div v-else class="month-grid">
        <div class="weekdays-header">
          <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
        </div>
        
        <div class="calendar-days">
          <div 
            v-for="day in calendarDays" 
            :key="day.date"
            class="calendar-day"
            :class="{ 'other-month': !day.currentMonth, 'today': day.isToday, 'has-meals': day.hasLunch || day.hasDinner }"
            @click="selectDate(day)"
          >
            <span class="day-number">{{ day.day }}</span>
            <span v-if="day.hasLunch || day.hasDinner" class="meal-indicator">
              {{ day.hasLunch && day.hasDinner ? 'A+C' : day.hasLunch ? 'A' : 'C' }}
            </span>
          </div>
        </div>

        <!-- Copy Month Button in Grid -->
        <button class="copy-month-btn" @click="showCopyModal = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copiar mes anterior</span>
        </button>
      </div>
    </main>

    <!-- Day Detail Modal -->
    <div v-if="selectedDate" class="modal-overlay" @click.self="closeDayDetail">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ formatSelectedDate }}</h2>
          <button class="modal-close" @click="closeDayDetail">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="modal-meal">
          <div class="modal-meal-header">
            <span>Almuerzo</span>
          </div>
          <div v-if="dayMenu.lunch" class="modal-dish" @click="selectDish('lunch')">
            <span>{{ dayMenu.lunch.name }}</span>
            <span class="change-btn">Cambiar</span>
          </div>
          <button v-else class="modal-add-btn" @click="selectDish('lunch')">+ Añadir</button>
        </div>

        <div class="modal-meal">
          <div class="modal-meal-header">
            <span>Cena</span>
          </div>
          <div v-if="dayMenu.dinner" class="modal-dish" @click="selectDish('dinner')">
            <span>{{ dayMenu.dinner.name }}</span>
            <span class="change-btn">Cambiar</span>
          </div>
          <button v-else class="modal-add-btn" @click="selectDish('dinner')">+ Añadir</button>
        </div>

        <button class="modal-done-btn" @click="closeDayDetail">Listo</button>
      </div>
    </div>

    <!-- Dish Selector Modal -->
    <div v-if="dishSelector.show" class="modal-overlay" @click.self="closeDishSelector">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ dishSelector.mealType === 'lunch' ? 'Elige Almuerzo' : 'Elige Cena' }}</h2>
          <button class="modal-close" @click="closeDishSelector">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="dish-list">
          <div v-for="dish in availableDishes" :key="dish.id" class="dish-option" @click="assignDish(dish.id)">
            <span>{{ dish.name }}</span>
          </div>
        </div>

        <button v-if="currentDishForMeal" class="modal-remove-btn" @click="removeDish">Quitar plato</button>
        <button class="modal-cancel-btn" @click="closeDishSelector">Cancelar</button>
      </div>
    </div>

    <!-- Copy Month Modal -->
    <div v-if="showCopyModal" class="modal-overlay" @click.self="showCopyModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Copiar mes anterior</h2>
          <button class="modal-close" @click="showCopyModal = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <p class="modal-text">¿Copiar las comidas del mes anterior?</p>
        <button class="modal-confirm-btn" @click="copyFromPreviousMonth">Sí, copiar</button>
        <button class="modal-cancel-btn" @click="showCopyModal = false">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDailyMenuStore } from '../../stores/dailyMenu'
import { useDishStore } from '../../stores/dishes'

const dailyMenuStore = useDailyMenuStore()
const dishStore = useDishStore()

// View state
const isListView = ref(true)
const showWeekend = ref(false)

// Date state
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

// Selection state
const selectedDate = ref(null)
const dayMenu = ref({ lunch: null, dinner: null })
const monthMenus = ref({})
const showCopyModal = ref(false)
const dishSelector = ref({ show: false, mealType: null })

// Constants
const weekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  return new Date(d.setDate(d.getDate() - day + (day === 0 ? -6 : 1)))
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Computed
const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDay = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const prevLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevLastDay - i
    const date = new Date(currentYear.value, currentMonth.value - 1, day)
    const dateStr = formatDate(date)
    const menu = monthMenus.value[dateStr] || {}
    days.push({ day, date: dateStr, currentMonth: false, isToday: false, hasLunch: !!menu.lunch, hasDinner: !!menu.dinner })
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(currentYear.value, currentMonth.value, day)
    const dateStr = formatDate(date)
    const isToday = day === today.getDate() && currentMonth.value === today.getMonth() && currentYear.value === today.getFullYear()
    const menu = monthMenus.value[dateStr] || {}
    days.push({ day, date: dateStr, currentMonth: true, isToday, hasLunch: !!menu.lunch, hasDinner: !!menu.dinner })
  }

  const remaining = 42 - days.length
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, day)
    const dateStr = formatDate(date)
    const menu = monthMenus.value[dateStr] || {}
    days.push({ day, date: dateStr, currentMonth: false, isToday: false, hasLunch: !!menu.lunch, hasDinner: !!menu.dinner })
  }

  return days
})

const monthWeeks = computed(() => {
  const weeks = []
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  
  // Nombres de días cortos - siempre de lunes a domingo
  const dayNamesShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  
  // Get all current month days
  const currentMonthDays = []
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentYear.value, currentMonth.value, day)
    const dateStr = formatDate(date)
    const isToday = day === today.getDate() && currentMonth.value === today.getMonth() && currentYear.value === today.getFullYear()
    const menu = monthMenus.value[dateStr] || {}
    const dow = date.getDay() // 0 = domingo, 1 = lunes, ..., 6 = sábado
    const idx = dow === 0 ? 6 : dow - 1 // Convertir: 0->6, 1->0, 2->1, ..., 6->5
    currentMonthDays.push({
      day,
      date: dateStr,
      currentMonth: true,
      isToday,
      hasLunch: !!menu.lunch,
      hasDinner: !!menu.dinner,
      lunchName: menu.lunch?.name || null,
      dinnerName: menu.dinner?.name || null,
      dayName: dayNamesShort[idx],
      isWeekend: dow === 0 || dow === 6,
      dayOfWeek: dow
    })
  }
  
  // Group into weeks starting from Monday (siempre 7 dias por semana)
  let currentWeek = []
  
  // Add empty slots for days before the 1st of month (para iniciar en lunes)
  const firstDayOfWeek = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysToSkip = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
  for (let i = 0; i < daysToSkip; i++) {
    currentWeek.push(null)
  }
  
  // Add all days of the month
  for (const d of currentMonthDays) {
    currentWeek.push(d)
    if (currentWeek.length === 7) {
      // Solo añadir semanas que tengan dias del mes actual
      const validDays = currentWeek.filter(d => d !== null && d.currentMonth)
      if (validDays.length > 0) {
        weeks.push({ days: [...currentWeek] })
      }
      currentWeek = []
    }
  }
  
  // Add remaining days to complete last week
  if (currentWeek.length > 0 && currentWeek.some(d => d !== null)) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    const validDays = currentWeek.filter(d => d !== null && d.currentMonth)
    if (validDays.length > 0) {
      weeks.push({ days: currentWeek })
    }
  }
  
  return weeks
})

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value + 'T00:00:00')
  return `${dayNamesFull[date.getDay()]} ${date.getDate()}`
})

const availableDishes = computed(() => {
  const mealType = dishSelector.value.mealType
  if (!mealType) return []
  return [...dishStore.dishes].sort((a, b) => {
    const aPriority = a.meal_type === mealType ? 0 : a.meal_type === 'both' ? 1 : 2
    const bPriority = b.meal_type === mealType ? 0 : b.meal_type === 'both' ? 1 : 2
    return aPriority - bPriority
  })
})

const currentDishForMeal = computed(() => {
  if (!selectedDate.value || !dishSelector.value.mealType) return null
  return dayMenu.value[dishSelector.value.mealType]
})

// Methods
function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else { currentMonth.value-- }
}

function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else { currentMonth.value++ }
}

function goToToday() {
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
}

function getWeekLabel(days) {
  if (!days || !days.length) return ''
  const validDays = days.filter(d => d !== null)
  if (!validDays.length) return ''
  const hasCurrentMonth = validDays.some(d => d.currentMonth)
  if (hasCurrentMonth) {
    return `${monthNames[currentMonth.value]}`
  }
  return `${monthNames[currentMonth.value === 0 ? 11 : currentMonth.value - 1]}`
}

function selectDate(day) {
  selectedDate.value = day.date
  dayMenu.value = { lunch: null, dinner: null }
  dailyMenuStore.fetchMenuForDate(day.date).then(menus => {
    const lunchMenu = menus?.find(m => m.meal_type === 'lunch')
    const dinnerMenu = menus?.find(m => m.meal_type === 'dinner')
    dayMenu.value = { lunch: lunchMenu?.dishes || null, dinner: dinnerMenu?.dishes || null }
  })
}

function closeDayDetail() {
  selectedDate.value = null
  dayMenu.value = { lunch: null, dinner: null }
}

function selectDish(mealType) { dishSelector.value = { show: true, mealType } }
function closeDishSelector() { dishSelector.value = { show: false, mealType: null } }

async function copyFromPreviousMonth() {
  const prevYear = currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value
  const prevMonth = currentMonth.value === 0 ? 11 : currentMonth.value - 1
  const firstDay = new Date(prevYear, prevMonth, 1)
  const lastDay = new Date(prevYear, prevMonth + 1, 0)
  
  await dailyMenuStore.fetchDailyMenus(formatDate(firstDay), formatDate(lastDay))
  
  const prevMenus = {}
  for (const menu of dailyMenuStore.dailyMenus) {
    if (!prevMenus[menu.date]) prevMenus[menu.date] = { lunch: null, dinner: null }
    prevMenus[menu.date][menu.meal_type] = menu.dishes
  }
  
  const currentFirstDay = new Date(currentYear.value, currentMonth.value, 1)
  const currentLastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  
  for (let day = 1; day <= currentLastDay.getDate(); day++) {
    const date = new Date(currentYear.value, currentMonth.value, day)
    const dateStr = formatDate(date)
    const prevDate = new Date(prevYear, prevMonth, day)
    const prevDateStr = formatDate(prevDate)
    const prevMenu = prevMenus[prevDateStr]
    
    if (prevMenu?.lunch) await dailyMenuStore.setDishForDate(dateStr, prevMenu.lunch.id, 'lunch')
    if (prevMenu?.dinner) await dailyMenuStore.setDishForDate(dateStr, prevMenu.dinner.id, 'dinner')
  }
  
  await loadMonthMenus()
  showCopyModal.value = false
}

async function assignDish(dishId) {
  if (!selectedDate.value || !dishSelector.value.mealType) return
  await dailyMenuStore.setDishForDate(selectedDate.value, dishId, dishSelector.value.mealType)
  const dish = dishStore.dishes.find(d => d.id === dishId)
  dayMenu.value[dishSelector.value.mealType] = dish
  monthMenus.value[selectedDate.value] = { ...monthMenus.value[selectedDate.value], [dishSelector.value.mealType]: dish }
  closeDishSelector()
}

async function removeDish() {
  if (!selectedDate.value || !dishSelector.value.mealType) return
  await dailyMenuStore.removeDishFromDate(selectedDate.value, dishSelector.value.mealType)
  dayMenu.value[dishSelector.value.mealType] = null
  monthMenus.value[selectedDate.value] = { ...monthMenus.value[selectedDate.value], [dishSelector.value.mealType]: null }
  closeDishSelector()
}

async function loadMonthMenus() {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  await dailyMenuStore.fetchDailyMenus(formatDate(firstDay), formatDate(lastDay))
  const menus = {}
  for (const menu of dailyMenuStore.dailyMenus) {
    if (!menus[menu.date]) menus[menu.date] = { lunch: null, dinner: null }
    // menu.dishes puede ser un array (del join) o un objeto
    const dish = Array.isArray(menu.dishes) ? menu.dishes[0] : menu.dishes
    menus[menu.date][menu.meal_type] = dish
  }
  monthMenus.value = menus
}

watch([currentMonth, currentYear], loadMonthMenus)

onMounted(async () => {
  await dishStore.fetchDishes()
  await loadMonthMenus()
  // Scroll to today after load
  setTimeout(() => {
    const todayEl = document.querySelector('.day-row.today')
    if (todayEl) {
      todayEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
})
</script>

<style scoped>
.calendar-view {
  min-height: 100vh;
  background: var(--surface);
  user-select: none;
}

.calendar-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 16px 8px;
  background: var(--surface);
  z-index: 100;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0 0 8px 0;
  text-align: center;
}

.nav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-surface);
  border: none;
  cursor: pointer;
}

.today-btn {
  padding: 8px 20px;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.view-toggle {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 12px;
}

.toggle-btn {
  padding: 8px 20px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  background: var(--surface-container);
  border: none;
  cursor: pointer;
}

.toggle-btn.active {
  background: var(--primary);
  color: var(--on-primary);
}

.weekend-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.weekend-label {
  font-size: 0.85rem;
  color: var(--on-surface);
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: var(--outline);
  border-radius: 12px;
  position: relative;
}

.toggle-switch.on { background: var(--primary); }

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-switch.on .toggle-thumb { transform: translateX(20px); }

.calendar-content { padding: 140px 16px 100px; }

.month-list { display: flex; flex-direction: column; gap: 4px; }

.week-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  padding: 8px 0;
}

.day-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--surface-container);
  border-radius: 14px;
  cursor: pointer;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
}

.day-row.today::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--primary);
}

.day-row.today .day-name,
.day-row.today .day-number {
  color: var(--primary);
}
.day-row.weekend { }
.day-row.other-month { opacity: 0.4; }

.day-info { min-width: 50px; }

.day-name {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
}

.day-row.today .day-name { color: var(--on-primary-container); }

.day-number {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--on-surface);
}

.day-row.today .day-number { color: var(--on-primary-container); }

.day-meals { flex: 1; display: flex; flex-direction: column; gap: 4px; }

.meal-item { display: flex; align-items: center; gap: 8px; }
.meal-item.empty { opacity: 0.5; }

.meal-name { font-size: 0.85rem; font-weight: 600; color: #333333; }
.meal-empty { font-size: 0.8rem; color: var(--on-surface-variant); }

.day-arrow { color: var(--on-surface-variant); }

.copy-month-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  margin-top: 20px;
  background: var(--surface-container);
  color: var(--on-surface);
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.month-grid { display: flex; flex-direction: column; }

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--on-surface-variant);
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 8px;
  background: var(--surface-container);
  cursor: pointer;
}

.calendar-day.other-month { opacity: 0.3; }
.calendar-day.today { background: var(--primary-container); border: 2px solid var(--primary); }
.calendar-day.has-meals { background: var(--surface-container-low); }

.calendar-day .day-number { font-size: 0.85rem; font-weight: 500; color: var(--on-surface); }
.calendar-day.today .day-number { color: var(--on-primary-container); font-weight: 700; }

.meal-indicator { font-size: 0.65rem; font-weight: 600; color: var(--primary); margin-top: 2px; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  background: var(--surface-container-lowest);
  border-radius: 24px 24px 0 0;
  padding: 20px;
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 { font-size: 1.25rem; font-weight: 600; color: var(--on-surface); margin: 0; }

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-surface);
  border: none;
  cursor: pointer;
}

.modal-text { text-align: center; color: var(--on-surface-variant); margin-bottom: 20px; }

.modal-meal { margin-bottom: 16px; }

.modal-meal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--on-surface-variant);
}

.modal-dish {
  display: flex;
  justify-content: space-between;
  padding: 14px;
  background: var(--surface-container);
  border-radius: 12px;
  cursor: pointer;
}

.change-btn { color: var(--primary); font-weight: 500; font-size: 0.85rem; }

.modal-add-btn {
  width: 100%;
  padding: 14px;
  border: 2px dashed var(--outline-variant);
  border-radius: 12px;
  background: none;
  color: var(--on-surface-variant);
  font-size: 0.85rem;
  cursor: pointer;
}

.modal-done-btn, .modal-confirm-btn {
  width: 100%;
  padding: 14px;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: 12px;
  font-weight: 600;
  margin-top: 20px;
  border: none;
  cursor: pointer;
}

.modal-cancel-btn {
  width: 100%;
  padding: 14px;
  background: var(--surface-container);
  color: var(--on-surface);
  border-radius: 12px;
  font-weight: 600;
  margin-top: 12px;
  border: none;
  cursor: pointer;
}

.modal-remove-btn {
  width: 100%;
  padding: 12px;
  background: var(--error-container);
  color: var(--error);
  border-radius: 10px;
  font-weight: 600;
  margin-top: 12px;
  border: none;
  cursor: pointer;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 50vh;
  overflow-y: auto;
}

.dish-option {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--surface-container);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  color: var(--on-surface);
}
</style>