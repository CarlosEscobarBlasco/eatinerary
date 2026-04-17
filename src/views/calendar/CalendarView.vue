<template>
  <div class="calendar-view">
    <!-- Header Section -->
    <div class="header-section">
      <header class="calendar-header">
        <!-- Title -->
        <h1 class="title">{{ weekRangeLabel }}</h1>
        
        <!-- Navigation and View Toggle -->
        <div class="controls-row">
          <div class="nav-row">
            <button class="nav-btn" @click="prevWeek">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <button class="today-btn" @click="goToToday">{{ today.getDate() }} {{ monthNames[today.getMonth()] }}</button>
            
            <button class="nav-btn" @click="nextWeek">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          
          <!-- View Toggle: List/Grid -->
          <div class="view-toggle">
            <button class="toggle-btn" :class="{ active: isListView }" @click="isListView = true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
            <button class="toggle-btn" :class="{ active: !isListView }" @click="isListView = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
          </div>
        </div>
      </header>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <div class="calendar-content-wrapper">
        <!-- List View (scrollable) -->
        <div v-if="isListView" class="calendar-content-list">
          <div v-for="week in monthWeeks" :key="week.start" class="week-group">
            <div class="week-header">
              <span class="week-label">{{ week.label }}</span>
              <button 
                class="copy-week-btn" 
                :class="{ 'copied': copiedWeek?.start === week.start, 'paste-mode': copiedWeek && copiedWeek.start !== week.start, 'copying': copyingWeek === week.start }"
                @click="handleCopyWeek(week)" 
                :title="copiedWeek && copyingWeek !== week.start ? 'Pegar menú' : copiedWeek ? 'Copiar menú' : 'Copiar semana'"
                :disabled="copyingWeek !== null"
              >
                <svg v-if="copyingWeek === week.start" class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                <svg v-else-if="copiedWeek?.start === week.start" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <svg v-else-if="copiedWeek && copiedWeek.start !== week.start" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
            
            <template v-for="day in week.days.filter(d => d && !d.isWeekend)" :key="day?.date">
              <div 
                v-if="day"
                class="day-row"
                :class="{ 
                  'today': day.isToday, 
                  'weekend': day.isWeekend
                }"
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
        </div>

        <!-- Content: Grid View (not scrollable, fits in screen) -->
        <div v-else class="calendar-content-grid">
        <div class="weekdays-header">
          <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
        </div>
        <div class="scrollable">
          <div class="calendar-days">
            <template v-for="day in calendarDays">
              <div 
                v-if="day"
                :key="day.date"
                class="calendar-day"
                :class="{ 
                  'today': day.isToday, 
                  'has-meals': day.hasLunch || day.hasDinner,
                  'expanded': sidebarExpanded
                }"
                @click="selectDate(day)"
              >
                <span class="day-number">{{ day.day }}</span>
                <div v-if="day.hasLunch || day.hasDinner" class="meal-indicator" :title="getMealNames(day)">
                  <span v-for="(meal, index) in getMealLines(day)" :key="index" class="meal-line">
                    {{ meal.text }}
                  </span>
                </div>
              </div>
              <div v-else class="calendar-day empty"></div>
            </template>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Day Detail Modal -->
    <div v-if="selectedDate" class="modal-overlay" @click.self="closeDayDetail">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-top">
            <h2>{{ formatSelectedDate }}</h2>
            <button class="modal-close" @click="closeDayDetail">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="modal-meal">
          <div class="modal-meal-header">
            <span>Comida</span>
          </div>
          <div v-if="dayMenu.lunch" class="modal-dish" @click="selectDish('lunch')">
            <img v-if="dayMenu.lunch.image_url" :src="getImage(dayMenu.lunch.image_url)" class="dish-thumb" />
            <span>{{ dayMenu.lunch.name }}</span>
            <svg class="change-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <button v-else class="modal-add-btn" @click="selectDish('lunch')">+ Añadir</button>
        </div>

        <div class="modal-meal">
          <div class="modal-meal-header">
            <span>Cena</span>
          </div>
          <div v-if="dayMenu.dinner" class="modal-dish" @click="selectDish('dinner')">
            <img v-if="dayMenu.dinner.image_url" :src="getImage(dayMenu.dinner.image_url)" class="dish-thumb" />
            <span>{{ dayMenu.dinner.name }}</span>
            <svg class="change-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <button v-else class="modal-add-btn" @click="selectDish('dinner')">+ Añadir</button>
        </div>

        <button class="modal-done-btn" @click="closeDayDetail">Listo</button>
      </div>
    </div>

    <!-- Dish Selector Modal -->
    <div v-if="dishSelector.show" class="modal-overlay" @click.self="closeDishSelector">
      <div class="modal-content">
        <div class="modal-header dish-selector-header">
          <div class="header-top">
            <h2>{{ dishSelector.mealType === 'lunch' ? 'Elige Comida' : 'Elige Cena' }}</h2>
            <button class="modal-close" @click="closeDishSelector">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
            <input 
              v-model="dishSearchQuery" 
              type="text" 
              placeholder="Buscar..."
              class="search-input"
            />
            <button v-if="dishSearchQuery" type="button" class="search-clear" @click="dishSearchQuery = ''">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="dish-list">
          <div v-for="dish in availableDishes" :key="dish.id" class="dish-option" @click="assignDish(dish.id)">
            <img v-if="dish.image_url" :src="getImage(dish.image_url)" class="dish-option-thumb" />
            <span>{{ dish.name }}</span>
          </div>
        </div>

        <button v-if="currentDishForMeal" class="modal-remove-btn" @click="removeDish">Quitar plato</button>
        <button class="modal-cancel-btn" @click="closeDishSelector">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useDailyMenuStore } from '../../stores/dailyMenu'
import { useDishStore } from '../../stores/dishes'
import { getCachedImage, cacheImage } from '../../lib/imageCache'

const dailyMenuStore = useDailyMenuStore()
const dishStore = useDishStore()

// Pre-cache images for all dishes
function preCacheDishImages() {
  dishStore.dishes.forEach(dish => {
    if (dish.image_url) {
      const cached = getCachedImage(dish.image_url)
      if (!cached) {
        cacheImage(dish.image_url)
      }
    }
  })
}

// Get cached image or original URL
function getImage(url) {
  return getCachedImage(url) || url
}

// View state
const isListView = ref(true)

// Sidebar state
const sidebarExpanded = ref(false)

function handleSidebarExpanded(e) {
  sidebarExpanded.value = e.detail.expanded
}

// Date state
const today = new Date()
today.setHours(0, 0, 0, 0)

// currentWeekOffset: 0 = current week, -1 = last week, 1 = next week, etc.
// Range: -1 (week before) to +4 (4 weeks after)
const currentWeekOffset = ref(0)

function getWeekStartDate(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
  return new Date(d.setDate(diff))
}

const currentWeekStart = computed(() => {
  const weekStart = getWeekStartDate(today)
  weekStart.setDate(weekStart.getDate() + currentWeekOffset.value * 7)
  return weekStart
})

const currentWeekEnd = computed(() => {
  const end = new Date(currentWeekStart.value)
  end.setDate(end.getDate() + 4) // Friday
  return end
})

// Selection state
const selectedDate = ref(null)
const dayMenu = ref({ lunch: null, dinner: null })
const monthMenus = ref({})
const dishSelector = ref({ show: false, mealType: null })
const dishSearchQuery = ref('')

// Copy week state
const copiedWeek = ref(null) // Week selected to copy from
const copyingWeek = ref(null) // Week currently being copied to

// Constants
const weekDays = ['L', 'M', 'X', 'J', 'V']
const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  return new Date(d.setDate(d.getDate() - day + (day === 0 ? -6 : 1)))
}

const weekRangeLabel = computed(() => {
  // Show range from first week to last week (current to +5)
  const firstWeekStart = new Date(currentWeekStart.value)
  const lastWeekStart = new Date(currentWeekStart.value)
  lastWeekStart.setDate(lastWeekStart.getDate() + 5 * 7) // +5 weeks
  const lastWeekEnd = new Date(lastWeekStart)
  lastWeekEnd.setDate(lastWeekEnd.getDate() + 4) // Friday
  
  const startMonth = firstWeekStart.getMonth()
  const startDay = firstWeekStart.getDate()
  const endMonth = lastWeekEnd.getMonth()
  const endDay = lastWeekEnd.getDate()
  const year = firstWeekStart.getFullYear()
  
  if (startMonth === endMonth) {
    return `${startDay} ${monthNames[startMonth]} - ${endDay} ${monthNames[endMonth]}${year !== today.getFullYear() ? ' ' + year : ''}`
  } else {
    return `${startDay} ${monthNames[startMonth]} - ${endDay} ${monthNames[endMonth]}${year !== today.getFullYear() ? ' ' + year : ''}`
  }
})

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Computed
const calendarDays = computed(() => {
  const days = []
  const weekStart = new Date(currentWeekStart.value)
  
  // Generate 6 weeks: from current week (0) to week +5
  for (let weekNum = 0; weekNum <= 5; weekNum++) {
    const thisWeekStart = new Date(weekStart)
    thisWeekStart.setDate(thisWeekStart.getDate() + weekNum * 7)
    
    // Add only Monday to Friday (weekdays)
    for (let i = 0; i < 5; i++) {
      const date = new Date(thisWeekStart)
      date.setDate(date.getDate() + i)
      
      const day = date.getDate()
      const dateStr = formatDate(date)
      const isCurrentMonth = date.getMonth() === weekStart.getMonth()
      const isToday = date.toDateString() === today.toDateString()
      const menu = monthMenus.value[dateStr] || {}
      
      days.push({ 
        day, 
        date: dateStr, 
        currentMonth: isCurrentMonth, 
        isToday, 
        hasLunch: !!menu.lunch, 
        hasDinner: !!menu.dinner 
      })
    }
  }

  return days
})

const monthWeeks = computed(() => {
  const weeks = []
  const weekStart = new Date(currentWeekStart.value)
  
  // Nombres de días cortos - siempre de lunes a viernes
  const dayNamesShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
  
  // Generate 6 weeks: from current week (0) to week +5
  for (let weekNum = 0; weekNum <= 5; weekNum++) {
    const thisWeekStart = new Date(weekStart)
    thisWeekStart.setDate(thisWeekStart.getDate() + weekNum * 7)
    
    // Build week days (Mon-Fri only)
    const weekDays = []
    for (let i = 0; i < 5; i++) {
      const date = new Date(thisWeekStart)
      date.setDate(date.getDate() + i)
      
      const dateStr = formatDate(date)
      const isCurrentMonth = date.getMonth() === weekStart.getMonth()
      const isToday = date.toDateString() === today.toDateString()
      const menu = monthMenus.value[dateStr] || {}
      const dow = date.getDay()
      
      weekDays.push({
        day: date.getDate(),
        date: dateStr,
        dateObj: date,
        currentMonth: isCurrentMonth,
        isToday,
        hasLunch: !!menu.lunch,
        hasDinner: !!menu.dinner,
        lunchName: menu.lunch?.name || null,
        dinnerName: menu.dinner?.name || null,
        dayName: dayNamesShort[i],
        isWeekend: false,
        dayOfWeek: i + 1
      })
    }
    
    // Generate label showing date range
    const startDay = weekDays[0].day
    const endDay = weekDays[4].day
    const startMonth = weekDays[0].dateObj.getMonth()
    const endMonth = weekDays[4].dateObj.getMonth()
    const year = weekDays[0].dateObj.getFullYear()
    
    let label
    if (startMonth === endMonth) {
      label = `${startDay}-${endDay} ${monthNames[startMonth]}`
    } else {
      label = `${startDay} ${monthNames[startMonth]} - ${endDay} ${monthNames[endMonth]}`
    }
    
    weeks.push({ days: weekDays, label, start: weekDays[0].date, year, weekNum })
  }

  return weeks
})

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value + 'T00:00:00')
  return `${dayNamesFull[date.getDay()]} ${date.getDate()}`
})

function getMealIndicator(day) {
  const menu = monthMenus.value[day.date] || {}
  if (menu.lunch && menu.dinner) {
    return 'A'
  }
  return menu.lunch ? 'A' : 'C'
}

function getMealLines(day) {
  const menu = monthMenus.value[day.date] || {}
  if (menu.lunch && menu.dinner) {
    return [
      { text: menu.lunch.name ? menu.lunch.name : 'Comida' },
      { text: menu.dinner.name ? menu.dinner.name : 'Cena' }
    ]
  }
  if (menu.lunch) {
    return [{ text: menu.lunch.name ? menu.lunch.name : 'Comida' }]
  }
  if (menu.dinner) {
    return [{ text: menu.dinner.name ? menu.dinner.name : 'Cena' }]
  }
  return []
}

function getMealNames(day) {
  const menu = monthMenus.value[day.date] || {}
  const meals = []
  if (menu.lunch) meals.push(`Comida: ${menu.lunch.name}`)
  if (menu.dinner) meals.push(`Cena: ${menu.dinner.name}`)
  return meals.join('\n') || ''
}

const availableDishes = computed(() => {
  const mealType = dishSelector.value.mealType
  const query = dishSearchQuery.value.toLowerCase().trim()
  if (!mealType) return []
  let dishes = [...dishStore.dishes]
  
  // Filter by search query
  if (query) {
    dishes = dishes.filter(dish => dish.name.toLowerCase().includes(query))
  }
  
  // Sort by priority
  return dishes.sort((a, b) => {
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
function prevWeek() {
  currentWeekOffset.value -= 6
}

function nextWeek() {
  currentWeekOffset.value += 6
}

function goToToday() {
  currentWeekOffset.value = 0
  // Scroll to today after changing week
  setTimeout(() => {
    const todayEl = document.querySelector('.day-row.today')
    if (todayEl) {
      todayEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
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
function closeDishSelector() { 
  dishSelector.value = { show: false, mealType: null }
  dishSearchQuery.value = ''
}

// Handle copy week button click
async function handleCopyWeek(week) {
  // If no week is copied yet, select this week as source
  if (!copiedWeek.value) {
    copiedWeek.value = week
    return
  }
  
  // If this is the same week that's copied, deselect
  if (copiedWeek.value.start === week.start) {
    copiedWeek.value = null
    return
  }
  
  // If another week is already copied, paste to this week
  copyingWeek.value = week.start
  await pasteWeekMenu(week)
  copyingWeek.value = null
  copiedWeek.value = null
}

// Paste menu from copied week to target week
async function pasteWeekMenu(targetWeek) {
  if (!copiedWeek.value || !targetWeek) return
  
  const sourceStart = copiedWeek.value.days.find(d => d && d.dayOfWeek === 1)?.dateObj
  if (!sourceStart) return
  
  // Fetch menus from source week
  const sourceStartStr = formatDate(sourceStart)
  const sourceEndDate = new Date(sourceStart)
  sourceEndDate.setDate(sourceEndDate.getDate() + 4)
  const sourceEndStr = formatDate(sourceEndDate)
  
  await dailyMenuStore.fetchDailyMenus(sourceStartStr, sourceEndStr)
  
  // Create a map of source menus by day of week (Lun=1 to Fri=5)
  const sourceMenuMap = {}
  for (const menu of dailyMenuStore.dailyMenus) {
    const menuDate = new Date(menu.date + 'T00:00:00')
    const dow = menuDate.getDay()
    // Only Mon-Fri (1-5), skip weekends (0=Sun, 6=Sat)
    if (dow < 1 || dow > 5) continue
    
    if (!sourceMenuMap[dow]) {
      sourceMenuMap[dow] = { lunch: null, dinner: null }
    }
    
    const dish = Array.isArray(menu.dishes) ? menu.dishes[0] : menu.dishes
    
    if (menu.meal_type === 'lunch') {
      sourceMenuMap[dow].lunch = dish
    } else if (menu.meal_type === 'dinner') {
      sourceMenuMap[dow].dinner = dish
    }
  }
  
  // Paste to target week
  for (let i = 0; i < 5; i++) {
    const targetDay = targetWeek.days.find(d => d && d.dayOfWeek === i + 1)
    if (!targetDay || !targetDay.date) continue
    
    const sourceMenu = sourceMenuMap[i + 1]
    if (!sourceMenu) continue
    
    const targetDateStr = targetDay.date
    
    // Copy lunch
    if (sourceMenu.lunch) {
      await dailyMenuStore.setDishForDate(targetDateStr, sourceMenu.lunch.id, 'lunch')
    }
    
    // Copy dinner
    if (sourceMenu.dinner) {
      await dailyMenuStore.setDishForDate(targetDateStr, sourceMenu.dinner.id, 'dinner')
    }
  }
  
  await loadWeekMenus()
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

async function loadWeekMenus() {
  // Load menus for current week to week +5
  const start = new Date(currentWeekStart.value)
  
  const end = new Date(currentWeekStart.value)
  end.setDate(end.getDate() + 7 * 5 + 4) // Week +5, Friday
  
  await dailyMenuStore.fetchDailyMenus(formatDate(start), formatDate(end))
  const menus = {}
  for (const menu of dailyMenuStore.dailyMenus) {
    if (!menus[menu.date]) menus[menu.date] = { lunch: null, dinner: null }
    // menu.dishes puede ser un array (del join) o un objeto
    const dish = Array.isArray(menu.dishes) ? menu.dishes[0] : menu.dishes
    menus[menu.date][menu.meal_type] = dish
  }
  monthMenus.value = menus
}

watch(currentWeekOffset, loadWeekMenus)

onMounted(async () => {
  await dishStore.fetchDishes()
  await loadWeekMenus()
  
  // Pre-cache dish images
  preCacheDishImages()
  
  // Listen for sidebar expand/collapse
  window.addEventListener('sidebar-expanded', handleSidebarExpanded)
})

onUnmounted(() => {
  window.removeEventListener('sidebar-expanded', handleSidebarExpanded)
})
</script>

<style scoped>
.calendar-view {
  min-height: 100vh;
  background: var(--surface);
  user-select: none;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
}

/* Main layout: flex column with full height */
.calendar-view {
  height: 100vh;
  background: var(--surface);
  user-select: none;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Header section - fixed, no shrink */
.calendar-view .header-section {
  flex-shrink: 0;
  padding: 12px 16px 8px;
  background: var(--surface);
  box-sizing: border-box;
}

/* Content section - takes remaining space */
.calendar-view .content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  min-height: 0;
}

.calendar-view .calendar-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

/* Header - part of header section */
.calendar-header {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
  text-align: center;
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 20%;
  background: var(--surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-surface);
  border: none;
  cursor: pointer;
}

.today-btn {
  padding: 8px 16px;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.view-toggle {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.toggle-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-surface-variant);
  background: var(--surface-container);
  border: none;
  cursor: pointer;
}

.toggle-btn.active {
  background: var(--primary);
  color: var(--on-primary);
}

/* Content wrapper */
.calendar-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* List Content - scrollable inside wrapper */
.calendar-content-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
}

.calendar-content-list .week-group {
  margin-bottom: 4px;
}

/* Mobile styles (below 768px) - add padding for bottom nav */
@media (max-width: 767px) {
  .calendar-view .content-section {
    padding-bottom: 65px;
  }
  .calendar-day {
    aspect-ratio: 1!important;
  }
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  padding: 8px 0;
}

.week-label {
  flex: 1;
}

.copy-week-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-surface-variant);
  background: var(--surface-container);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-week-btn:hover {
  background: var(--primary);
  color: var(--on-primary);
}

.copy-week-btn.copied {
  background: var(--primary);
  color: var(--on-primary);
}

.copy-week-btn.paste-mode {
  background: var(--primary-container);
  color: var(--primary);
}

.copy-week-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.copy-week-btn .spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

/* Grid Content - no scroll, fits in viewport */
.calendar-content-grid {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  padding: 0 10px 10px 10px;
}
.scrollable {
  overflow-y: auto;
}

.calendar-content-grid .weekdays-header,
.calendar-content-grid .calendar-days {
  min-width: 0;
}

.calendar-content-grid .calendar-days {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
}

/* Wide content on medium+ screens */
@media (min-width: 768px) {
  .calendar-view {
    max-width: none;
  }
  
  .calendar-view .header-section {
    padding: 12px 32px 8px;
  }
  
  .calendar-view .content-section {
    padding-left: 0;
    padding-right: 0;
  }
  
  .calendar-content-wrapper {
    padding: 0 32px 16px;
    max-width: none;
  }
  
  .calendar-header {
    position: relative;
  }
  
  .controls-row {
    justify-content: center;
  }
  
  .view-toggle {
    position: absolute;
    right: 0;
  }
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
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
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
}

.calendar-day {
  aspect-ratio: 2.5;
  display: flex;
  flex-direction: column;
  padding: 3px;
  border-radius: 6px;
  background: var(--surface-container);
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: aspect-ratio 0.3s ease;
}

.calendar-day.expanded {
  aspect-ratio: 1.8;
}

.calendar-day.empty {
  background: transparent;
  cursor: default;
}

.calendar-day.today { background: var(--primary-container); border: 2px solid var(--primary); }
.calendar-day.has-meals { background: var(--surface-container-low); }

.calendar-day .day-number {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--on-surface);
  position: absolute;
  top: 2px;
  left: 4px;
}

.calendar-day.today .day-number {
  color: var(--on-primary-container);
  font-weight: 700;
}

.meal-indicator {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  font-size: 0.5rem;
  font-weight: 600;
  color: var(--primary);
  max-width: 100%;
  overflow: hidden;
  text-align: left;
  line-height: 1.2;
  padding: 4px;
}

.meal-indicator .meal-line {
  font-size: 0.55rem;
  font-weight: 600;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

@media (min-width: 768px) {
  .meal-indicator .meal-line {
    font-size: 0.7rem;
  }
}

.meal-indicator:hover {
  white-space: normal;
  word-break: break-word;
}

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
  background: var(--surface);
  border-radius: 24px 24px 0 0;
  padding: 20px;
  animation: slideUp 0.25s ease-out;
  height: 75vh;
  display: flex;
  flex-direction: column;
}

.modal-content .dish-selector-header {
  flex-shrink: 0;
}

.modal-content .dish-list {
  flex: 1;
  overflow-y: auto;
  margin-top: 12px;
}

@keyframes slideUp {
  from { 
    transform: translateY(100%);
  }
  to { 
    transform: translateY(0);
  }
}

@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

.modal-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.modal-header .header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 { 
  font-size: 1.25rem; 
  font-weight: 600; 
  color: var(--on-surface); 
  margin: 0; 
}

.modal-header .search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--surface-container);
  border-radius: var(--radius-sm);
}

.modal-header .search-box svg {
  color: var(--on-surface-variant);
  flex-shrink: 0;
}

.modal-header .search-input {
  flex: 1;
  background: none;
  border: none;
  font-size: 0.95rem;
  color: var(--on-surface);
}

.modal-header .search-input:focus {
  outline: none;
}

.modal-header .search-input::placeholder {
  color: var(--on-surface-variant);
}

.search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--surface-container-high);
  color: var(--on-surface-variant);
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.search-clear:hover {
  background: var(--primary);
  color: var(--on-primary);
}

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
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--surface-container);
  border-radius: 12px;
  cursor: pointer;
}

.dish-thumb {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.change-btn { color: var(--primary); font-weight: 500; font-size: 0.85rem; }

.change-icon {
  color: var(--primary);
  flex-shrink: 0;
  margin-left: auto;
}

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

.weeks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  max-height: 350px;
  overflow-y: auto;
}

.week-option {
  padding: 14px 16px;
  background: var(--surface-container);
  border-radius: 12px;
  font-weight: 500;
  color: var(--on-surface);
  cursor: pointer;
}

.week-option:hover {
  background: var(--primary);
  color: var(--on-primary);
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
  overflow-y: auto;
}

.dish-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--surface-container);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  color: var(--on-surface);
}

.dish-option-thumb {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
</style>