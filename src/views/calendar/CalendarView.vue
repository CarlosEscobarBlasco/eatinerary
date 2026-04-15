<template>
  <div class="calendar-view">
    <!-- Header - Fixed -->
    <header class="calendar-header">
      <div class="header-content">
        <h1>{{ isMonthlyView ? monthNames[currentMonth] + ' ' + currentYear : weekRange }}</h1>
        <button v-if="!isMonthlyView" class="today-btn" @click="goToCurrentWeek">Hoy</button>
        <button v-else class="today-btn" @click="goToToday">Hoy</button>
      </div>
      
      <div class="nav-row">
        <button v-if="!isMonthlyView" class="nav-btn" @click="prevWeek">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span v-if="!isMonthlyView" class="nav-label">{{ weekRange }}</span>
        <span v-else class="nav-label">{{ monthNames[currentMonth] }}</span>
        <button v-if="!isMonthlyView" class="nav-btn" @click="nextWeek">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <button v-else class="nav-btn" @click="nextMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </header>

    <!-- View Toggle - Fixed -->
    <div class="view-toggle">
      <button 
        class="toggle-btn" 
        :class="{ active: !isMonthlyView }"
        @click="isMonthlyView = false"
      >
        Semanal
      </button>
      <button 
        class="toggle-btn" 
        :class="{ active: isMonthlyView }"
        @click="isMonthlyView = true"
      >
        Mensual
      </button>
    </div>

    <!-- Weekend Toggle - Fixed -->
    <div v-if="!isMonthlyView" class="weekend-toggle">
      <span>Mostrar fin de semana</span>
      <div class="toggle-switch" :class="{ on: showWeekend }" @click="showWeekend = !showWeekend">
        <div class="toggle-thumb"></div>
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="scroll-content" :class="{ 'month-scroll': isMonthlyView }">
      <!-- Weekly View - Vertical List -->
      <div v-if="!isMonthlyView" class="week-list">
        <div 
          v-for="day in displayDays" 
          :key="day.date"
          class="day-row"
          :class="{ 
            'today': day.isToday,
            'weekend': day.isWeekend,
            'has-lunch': day.hasLunch,
            'has-dinner': day.hasDinner
          }"
          @click="selectDate(day)"
        >
          <div class="day-info">
            <div class="day-date">
              <span class="day-name">{{ day.dayName }}</span>
              <span class="day-number">{{ day.dayNumber }}</span>
            </div>
          </div>
          
          <div class="day-meals">
            <div v-if="day.hasLunch" class="meal-item">
              <span class="meal-dot lunch"></span>
              <span class="meal-name">{{ day.lunchName }}</span>
            </div>
            <div v-else class="meal-item empty">
              <span class="meal-dot lunch"></span>
              <span class="meal-empty-text">Sin planificar</span>
            </div>
            
            <div v-if="day.hasDinner" class="meal-item">
              <span class="meal-dot dinner"></span>
              <span class="meal-name">{{ day.dinnerName }}</span>
            </div>
            <div v-else class="meal-item empty">
              <span class="meal-dot dinner"></span>
              <span class="meal-empty-text">Sin planificar</span>
            </div>
          </div>
          
          <div class="day-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <!-- Copy Week Button -->
        <button class="copy-week-btn" @click="showCopyModal = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copiar semana anterior</span>
        </button>
      </div>

      <!-- Monthly View -->
      <div v-else class="month-view">
        <div class="weekdays">
          <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
        </div>
        <div class="calendar-grid">
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            class="calendar-day"
            :class="{ 
              'other-month': !day.currentMonth,
              'today': day.isToday,
              'has-meals': day.hasLunch || day.hasDinner
            }"
            @click="selectDate(day)"
          >
            <span class="day-number">{{ day.day }}</span>
            <div class="meal-dots" v-if="day.hasLunch || day.hasDinner">
              <span v-if="day.hasLunch && day.hasDinner" class="dot both"></span>
              <span v-else-if="day.hasLunch" class="dot lunch"></span>
              <span v-else-if="day.hasDinner" class="dot dinner"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day Detail Modal -->
    <div v-if="selectedDate" class="modal-overlay" @click.self="closeDayDetail">
      <div class="modal-content">
        <div class="modal-handle"></div>
        <h2 class="modal-title">{{ formatSelectedDate }}</h2>
        
        <div class="modal-meal">
          <div class="modal-meal-header">
            <span class="meal-dot lunch"></span>
            <span>Almuerzo</span>
          </div>
          <div v-if="dayMenu.lunch" class="modal-dish" @click="selectDish('lunch')">
            <span class="modal-dish-name">{{ dayMenu.lunch.name }}</span>
            <span class="modal-dish-action">Cambiar</span>
          </div>
          <button v-else class="modal-add-btn" @click="selectDish('lunch')">
            + Añadir
          </button>
        </div>

        <div class="modal-meal">
          <div class="modal-meal-header">
            <span class="meal-dot dinner"></span>
            <span>Cena</span>
          </div>
          <div v-if="dayMenu.dinner" class="modal-dish" @click="selectDish('dinner')">
            <span class="modal-dish-name">{{ dayMenu.dinner.name }}</span>
            <span class="modal-dish-action">Cambiar</span>
          </div>
          <button v-else class="modal-add-btn" @click="selectDish('dinner')">
            + Añadir
          </button>
        </div>

        <button class="modal-close-btn" @click="closeDayDetail">Listo</button>
      </div>
    </div>

    <!-- Dish Selector Modal -->
    <div v-if="dishSelector.show" class="modal-overlay" @click.self="closeDishSelector">
      <div class="modal-content">
        <div class="modal-handle"></div>
        <h2 class="modal-title">
          {{ dishSelector.mealType === 'lunch' ? 'Elige Almuerzo' : 'Elige Cena' }}
        </h2>
        
        <div class="modal-dish-grid">
          <div 
            v-for="dish in availableDishes" 
            :key="dish.id" 
            class="modal-dish-option"
            :class="dish.meal_type"
            @click="assignDish(dish.id)"
          >
            <span class="dish-name">{{ dish.name }}</span>
            <span class="dish-indicator" :class="dish.meal_type"></span>
          </div>
        </div>

        <button v-if="currentDishForMeal" class="modal-remove-btn" @click="removeDish">
          Quitar plato
        </button>
        
        <div v-if="availableDishes.length === 0" class="modal-empty">
          <p>No hay platos</p>
          <RouterLink to="/dishes" class="modal-link" @click="closeDishSelector">
            Añadir platos
          </RouterLink>
        </div>

        <button class="modal-close-btn secondary" @click="closeDishSelector">Cancelar</button>
      </div>
    </div>

    <!-- Copy Week Modal -->
    <div v-if="showCopyModal" class="modal-overlay" @click.self="showCopyModal = false">
      <div class="modal-content">
        <div class="modal-handle"></div>
        <h2 class="modal-title">Copiar semana anterior</h2>
        
        <p class="modal-text">
          ¿Quieres copiar las comidas de la semana anterior a esta semana?
        </p>

        <button class="modal-confirm-btn" @click="copyFromPreviousWeek">
          Sí, copiar
        </button>
        
        <button class="modal-close-btn secondary" @click="showCopyModal = false">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useDailyMenuStore } from '../../stores/dailyMenu'
import { useDishStore } from '../../stores/dishes'

const dailyMenuStore = useDailyMenuStore()
const dishStore = useDishStore()

// View state
const isMonthlyView = ref(false) // Default: weekly
const showWeekend = ref(false)

// Date state
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())
const currentWeekStart = ref(getWeekStart(today))

// Selection state
const selectedDate = ref(null)
const dayMenu = ref({ lunch: null, dinner: null })
const monthMenus = ref({})
const weekMenus = ref({})

const showCopyModal = ref(false)
const copyFromWeekStart = ref(null)

const dishSelector = ref({
  show: false,
  mealType: null
})

// Constants
const weekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Computed
const weekRange = computed(() => {
  const start = currentWeekStart.value
  const end = new Date(start)
  const daysToShow = showWeekend.value ? 7 : 5
  end.setDate(end.getDate() + daysToShow - 1)
  
  const formatDayMonth = (date) => {
    return date.getDate() + ' ' + date.toLocaleDateString('es', { month: 'short' })
  }
  
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('es', { month: 'short' })}`
  }
  return `${formatDayMonth(start)} - ${formatDayMonth(end)}`
})

const displayDays = computed(() => {
  const days = []
  const start = new Date(currentWeekStart.value)
  const numDays = showWeekend.value ? 7 : 5
  const dayNames = showWeekend.value 
    ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
  
  for (let i = 0; i < numDays; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const dateStr = formatDate(date)
    const isToday = date.toDateString() === today.toDateString()
    const menu = weekMenus.value[dateStr] || {}
    
    days.push({
      dayName: dayNames[i],
      dayNumber: date.getDate(),
      date: dateStr,
      isToday,
      isWeekend: showWeekend.value && (i === 5 || i === 6),
      hasLunch: !!menu.lunch,
      hasDinner: !!menu.dinner,
      lunchName: menu.lunch?.name,
      dinnerName: menu.dinner?.name
    })
  }
  
  return days
})

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDay = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = formatDate(new Date(currentYear.value, currentMonth.value - 1, day))
    const menu = monthMenus.value[date] || {}
    days.push({
      day,
      date,
      currentMonth: false,
      isToday: false,
      hasLunch: !!menu.lunch,
      hasDinner: !!menu.dinner
    })
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = formatDate(new Date(currentYear.value, currentMonth.value, day))
    const isToday = day === today.getDate() && 
      currentMonth.value === today.getMonth() && 
      currentYear.value === today.getFullYear()
    const menu = monthMenus.value[date] || {}
    days.push({
      day,
      date,
      currentMonth: true,
      isToday,
      hasLunch: !!menu.lunch,
      hasDinner: !!menu.dinner
    })
  }

  const remaining = 42 - days.length
  for (let day = 1; day <= remaining; day++) {
    const date = formatDate(new Date(currentYear.value, currentMonth.value + 1, day))
    const menu = monthMenus.value[date] || {}
    days.push({
      day,
      date,
      currentMonth: false,
      isToday: false,
      hasLunch: !!menu.lunch,
      hasDinner: !!menu.dinner
    })
  }

  return days
})

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value + 'T00:00:00')
  return `${dayNamesFull[date.getDay()]} ${date.getDate()}`
})

const availableDishes = computed(() => {
  const mealType = dishSelector.value.mealType
  if (!mealType) return []
  
  // Mostrar TODOS los platos, ordenados por tipo
  const allDishes = [...dishStore.dishes]
  
  // Ordenar: primero los del tipo actual, luego los "both", luego los del otro tipo
  return allDishes.sort((a, b) => {
    const aType = a.meal_type === 'both' ? 'both' : a.meal_type
    const bType = b.meal_type === 'both' ? 'both' : b.meal_type
    
    // priority: selected type first, then both, then other type
    const getPriority = (type) => {
      if (type === mealType) return 0 // Primero los del tipo seleccionado
      if (type === 'both') return 1  // Luego los "both"
      return 2                        // Último los del otro tipo
    }
    
    return getPriority(aType) - getPriority(bType)
  })
})

const currentDishForMeal = computed(() => {
  if (!selectedDate.value || !dishSelector.value.mealType) return null
  return dayMenu.value[dishSelector.value.mealType]
})

// Methods
function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function prevWeek() {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(newStart.getDate() - 7)
  currentWeekStart.value = newStart
}

function nextWeek() {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(newStart.getDate() + 7)
  currentWeekStart.value = newStart
}

function goToCurrentWeek() {
  currentWeekStart.value = getWeekStart(today)
}

function goToToday() {
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
}

function selectDate(day) {
  selectedDate.value = day.date
  dayMenu.value = { lunch: null, dinner: null }
  
  dailyMenuStore.fetchMenuForDate(day.date).then(menus => {
    const lunchMenu = menus?.find(m => m.meal_type === 'lunch')
    const dinnerMenu = menus?.find(m => m.meal_type === 'dinner')
    dayMenu.value = {
      lunch: lunchMenu?.dishes || lunchMenu?.dish_id || null,
      dinner: dinnerMenu?.dishes || dinnerMenu?.dish_id || null
    }
  })
}

function closeDayDetail() {
  selectedDate.value = null
  dayMenu.value = { lunch: null, dinner: null }
}

function selectDish(mealType) {
  dishSelector.value = { show: true, mealType }
}

function closeDishSelector() {
  dishSelector.value = { show: false, mealType: null }
}

async function copyFromPreviousWeek() {
  // Get the previous week's start date
  const prevWeekStart = new Date(currentWeekStart.value)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
  
  // Get the previous week's menus
  const prevStartDate = formatDate(prevWeekStart)
  const prevEndDateObj = new Date(prevWeekStart)
  const daysToShow = showWeekend.value ? 7 : 5
  prevEndDateObj.setDate(prevEndDateObj.getDate() + daysToShow - 1)
  const prevEndDate = formatDate(prevEndDateObj)
  
  // Fetch menus from previous week
  await dailyMenuStore.fetchDailyMenus(prevStartDate, prevEndDate)
  
  // Create a map of previous week menus
  const prevMenus = {}
  for (const menu of dailyMenuStore.dailyMenus) {
    if (!prevMenus[menu.date]) {
      prevMenus[menu.date] = { lunch: null, dinner: null }
    }
    prevMenus[menu.date][menu.meal_type] = menu.dishes
  }
  
  // Copy meals to current week
  const currentDays = displayDays.value
  
  for (let i = 0; i < currentDays.length; i++) {
    const currentDay = currentDays[i]
    
    const prevDate = new Date(prevWeekStart)
    prevDate.setDate(prevDate.getDate() + i)
    const prevDateStr = formatDate(prevDate)
    const prevMenu = prevMenus[prevDateStr]
    
    if (prevMenu) {
      // Copy lunch
      if (prevMenu.lunch) {
        await dailyMenuStore.setDishForDate(currentDay.date, prevMenu.lunch.id, 'lunch')
      }
      // Copy dinner
      if (prevMenu.dinner) {
        await dailyMenuStore.setDishForDate(currentDay.date, prevMenu.dinner.id, 'dinner')
      }
    }
  }
  
  // Reload current week menus
  await loadWeekMenus()
  showCopyModal.value = false
}

async function assignDish(dishId) {
  if (!selectedDate.value || !dishSelector.value.mealType) return
  
  await dailyMenuStore.setDishForDate(selectedDate.value, dishId, dishSelector.value.mealType)
  const dish = dishStore.dishes.find(d => d.id === dishId)
  dayMenu.value[dishSelector.value.mealType] = dish
  
  // Update both month and week menus
  monthMenus.value[selectedDate.value] = {
    ...monthMenus.value[selectedDate.value],
    [dishSelector.value.mealType]: dish
  }
  weekMenus.value[selectedDate.value] = {
    ...weekMenus.value[selectedDate.value],
    [dishSelector.value.mealType]: dish
  }

  closeDishSelector()
}

async function removeDish() {
  if (!selectedDate.value || !dishSelector.value.mealType) return
  
  await dailyMenuStore.removeDishFromDate(selectedDate.value, dishSelector.value.mealType)
  dayMenu.value[dishSelector.value.mealType] = null
  
  monthMenus.value[selectedDate.value] = {
    ...monthMenus.value[selectedDate.value],
    [dishSelector.value.mealType]: null
  }
  weekMenus.value[selectedDate.value] = {
    ...weekMenus.value[selectedDate.value],
    [dishSelector.value.mealType]: null
  }

  closeDishSelector()
}

async function loadWeekMenus() {
  const startDate = formatDate(currentWeekStart.value)
  const endDateObj = new Date(currentWeekStart.value)
  const daysToShow = showWeekend.value ? 7 : 5
  endDateObj.setDate(endDateObj.getDate() + daysToShow - 1)
  const endDate = formatDate(endDateObj)
  
  await dailyMenuStore.fetchDailyMenus(startDate, endDate)
  
  const menus = {}
  for (const menu of dailyMenuStore.dailyMenus) {
    if (!menus[menu.date]) {
      menus[menu.date] = { lunch: null, dinner: null }
    }
    menus[menu.date][menu.meal_type] = menu.dishes
  }
  weekMenus.value = menus
}

async function loadMonthMenus() {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDate = formatDate(firstDay)
  const endDate = formatDate(lastDay)
  
  await dailyMenuStore.fetchDailyMenus(startDate, endDate)
  
  const menus = {}
  for (const menu of dailyMenuStore.dailyMenus) {
    if (!menus[menu.date]) {
      menus[menu.date] = { lunch: null, dinner: null }
    }
    menus[menu.date][menu.meal_type] = menu.dishes
  }
  monthMenus.value = menus
}

watch([currentMonth, currentYear], () => {
  if (isMonthlyView.value) {
    loadMonthMenus()
  }
})

watch([currentWeekStart, showWeekend], () => {
  if (!isMonthlyView.value) {
    loadWeekMenus()
  }
})

watch(isMonthlyView, (newVal) => {
  if (newVal) {
    loadMonthMenus()
  } else {
    loadWeekMenus()
  }
})

onMounted(async () => {
  await dishStore.fetchDishes()
  await loadWeekMenus()
})
</script>

<style scoped>
.calendar-view {
  min-height: 100vh;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  padding-top: 65px;
  padding-bottom: 100px;
}

/* Header - Fixed */
.calendar-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 20px 12px;
  background: var(--surface);
  z-index: 20;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.calendar-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
}

.today-btn {
  padding: 6px 12px;
  background: var(--primary-container);
  color: var(--on-primary-container);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--on-surface);
}

.nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-surface);
}

/* View Toggle - Fixed */
.view-toggle {
  position: fixed;
  top: 55px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 8px 20px 12px;
  background: var(--surface);
  z-index: 19;
}

.toggle-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  background: var(--surface-container);
  transition: all 0.2s;
}

.toggle-btn.active {
  background: var(--primary);
  color: var(--on-primary);
}

/* Scrollable Content - Scrollable only the list */
.scroll-content {
  flex: 1;
  overflow-y: auto;
  padding: 140px 16px 100px;
}

.month-scroll {
  padding-top: 140px;
}

/* Weekend Toggle - Fixed */
.weekend-toggle {
  position: fixed;
  top: 100px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--surface);
  margin-bottom: 12px;
  cursor: pointer;
  z-index: 18;
}

.weekend-toggle span {
  font-size: 0.85rem;
  color: var(--on-surface);
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: var(--outline);
  border-radius: 12px;
  position: relative;
  transition: background 0.2s;
}

.toggle-switch.on {
  background: var(--primary);
}

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

.toggle-switch.on .toggle-thumb {
  transform: translateX(20px);
}

.week-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.day-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--surface-container);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.day-row:active {
  transform: scale(0.98);
}

.day-row.today {
  background: var(--primary-container);
}

.day-row.weekend {
  background: var(--surface-container-high);
  opacity: 0.6;
}

.day-info {
  min-width: 56px;
}

.day-date {
  display: flex;
  flex-direction: column;
}

.day-row .day-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
}

.day-row.today .day-name {
  color: var(--on-primary-container);
}

.day-row .day-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--on-surface);
  line-height: 1.1;
}

.day-row.today .day-number {
  color: var(--on-primary-container);
}

.day-meals {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meal-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meal-item.empty {
  opacity: 0.5;
}

.meal-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.meal-dot.lunch {
  background: #f97316;
}

.meal-dot.dinner {
  background: #3b82f6;
}

.meal-dot.both {
  background: linear-gradient(135deg, #f97316 50%, #3b82f6 50%);
}

.meal-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--on-surface);
}

.meal-empty-text {
  font-size: 0.8rem;
  color: var(--on-surface-variant);
}

.day-arrow {
  color: var(--on-surface-variant);
}

/* Copy Week Button */
.copy-week-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 20px;
  margin-top: 16px;
  background: var(--surface-container);
  color: var(--on-surface);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.copy-week-btn:active {
  transform: scale(0.98);
}

/* Monthly View */
.month-view {
  padding: 0 16px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.weekday {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  padding: 8px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 4px;
  border-radius: 8px;
  background: var(--surface-container);
  cursor: pointer;
}

.calendar-day.other-month { opacity: 0.3; }

.calendar-day.today {
  background: var(--primary-container);
}

.calendar-day.today .day-number {
  color: var(--on-primary-container);
  font-weight: 700;
}

.calendar-day.has-meals {
  background: var(--surface-container-low);
}

.day-number {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--on-surface);
}

.meal-dots {
  display: flex;
  gap: 3px;
  margin-top: 2px;
  justify-content: center;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot.lunch { background: #f97316; }
.dot.dinner { background: #3b82f6; }
.dot.both { 
  background: linear-gradient(135deg, #f97316 50%, #3b82f6 50%);
  width: 12px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  background: var(--surface-container-lowest);
  border-radius: 24px 24px 0 0;
  padding: 16px 20px 32px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-handle {
  width: 40px;
  height: 4px;
  background: var(--outline-variant);
  border-radius: 2px;
  margin: 0 auto 16px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0 0 20px;
  text-align: center;
}

.modal-text {
  text-align: center;
  color: var(--on-surface-variant);
  font-size: 0.95rem;
  margin: 0 0 8px;
}

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

.modal-meal-header .meal-dot {
  width: 10px;
  height: 10px;
}

.modal-dish {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: var(--surface-container);
  border-radius: 12px;
  cursor: pointer;
}

.modal-dish-name { font-weight: 500; color: var(--on-surface); }
.modal-dish-action { font-size: 0.85rem; color: var(--primary); font-weight: 500; }

.modal-add-btn {
  width: 100%;
  padding: 14px;
  border: 2px dashed var(--outline-variant);
  border-radius: 12px;
  background: none;
  color: var(--on-surface-variant);
  font-size: 0.85rem;
}

.modal-confirm-btn {
  width: 100%;
  padding: 14px;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: 12px;
  font-weight: 600;
  margin-top: 20px;
  cursor: pointer;
}

.modal-close-btn {
  width: 100%;
  padding: 14px;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: 12px;
  font-weight: 600;
  margin-top: 20px;
}

.modal-close-btn.secondary {
  background: var(--surface-container);
  color: var(--on-surface);
  margin-top: 12px;
}

.modal-dish-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 50vh;
  overflow-y: auto;
}

.modal-dish-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--surface-container);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  color: var(--on-surface);
}

.dish-name {
  flex: 1;
}

.dish-indicator {
  width: 24px;
  height: 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.dish-indicator.lunch {
  background: linear-gradient(90deg, #f97316 0%, #f97316 50%, rgba(249, 115, 22, 0.3) 100%);
}

.dish-indicator.dinner {
  background: linear-gradient(90deg, #3b82f6 0%, #3b82f6 50%, rgba(59, 130, 246, 0.3) 100%);
}

.dish-indicator.both {
  background: linear-gradient(90deg, #f97316 0%, #3b82f6 100%);
}

.modal-remove-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: var(--error-container);
  color: var(--error);
  border-radius: 10px;
  font-weight: 600;
  margin-top: 12px;
}

.modal-empty {
  text-align: center;
  padding: 20px;
}

.modal-empty p {
  color: var(--on-surface-variant);
  margin: 0 0 12px;
}

.modal-link {
  display: inline-block;
  padding: 10px 20px;
  background: var(--primary-container);
  color: var(--on-primary-container);
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
}
</style>