<template>
  <div class="menu-view">
    <div class="header-section">
      <header class="menu-header">
        <h1 class="title">Menú</h1>
        <div v-if="store.weeks.length > 0" class="header-actions">
          <button class="transfer-btn" @click="openTransferModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
            <span>Mover al calendario</span>
          </button>
          <button class="edit-btn" :class="{ active: editMode }" @click="editMode = !editMode">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>{{ editMode ? 'Hecho' : 'Editar' }}</span>
          </button>
        </div>
      </header>
    </div>

    <div class="content-section">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Cargando...</p>
      </div>

      <div v-else-if="store.weeks.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </div>
        <h3>No hay semanas todavía</h3>
        <p>Añade tu primera semana para comenzar</p>
      </div>

      <div v-else class="weeks-list">
        <div class="weekdays-header">
          <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
        </div>
        <div v-for="week in store.weeks" :key="week.id" class="week-group">
          <div class="week-header">
            <span class="week-label">Semana {{ week.week_number }}</span>
            <button v-if="editMode" class="delete-week-btn" @click="confirmDelete = week">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="week-grid">
            <div
              v-for="dayIndex in 5"
              :key="dayIndex"
              class="grid-day"
              :class="{ 'has-meals': hasMeals(week, dayIndex - 1) }"
              @click="selectDay(week, dayIndex - 1)"
            >
              <div class="meal-indicator">
                <template v-if="getMeal(week, dayIndex - 1, 'lunch')">
                  <span class="meal-line">{{ getMealName(week, dayIndex - 1, 'lunch') }}</span>
                </template>
                <span v-else class="meal-line empty">-</span>
                <template v-if="getMeal(week, dayIndex - 1, 'dinner')">
                  <span class="meal-line">{{ getMealName(week, dayIndex - 1, 'dinner') }}</span>
                </template>
                <span v-else class="meal-line empty">-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button v-if="editMode" class="fab-add-btn" @click="handleAddWeek">
      <span>+</span>
    </button>

    <div v-if="selectedDay !== null" class="modal-overlay" @click.self="closeDayDetail">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-top">
            <h2>{{ dayNamesFull[selectedDay] }}</h2>
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
          <div v-if="dayMenu.lunch" class="modal-dish" @click="openDishSelector('lunch')">
            <img v-if="dayMenu.lunch.image_url" :src="getImage(dayMenu.lunch.image_url)" class="dish-thumb" />
            <span>{{ dayMenu.lunch.name }}</span>
            <svg class="change-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <button v-else class="modal-add-btn" @click="openDishSelector('lunch')">+ Añadir</button>
        </div>

        <div class="modal-meal">
          <div class="modal-meal-header">
            <span>Cena</span>
          </div>
          <div v-if="dayMenu.dinner" class="modal-dish" @click="openDishSelector('dinner')">
            <img v-if="dayMenu.dinner.image_url" :src="getImage(dayMenu.dinner.image_url)" class="dish-thumb" />
            <span>{{ dayMenu.dinner.name }}</span>
            <svg class="change-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <button v-else class="modal-add-btn" @click="openDishSelector('dinner')">+ Añadir</button>
        </div>

        <button class="modal-done-btn" @click="closeDayDetail">Listo</button>
      </div>
    </div>

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

    <div v-if="confirmDelete" class="modal-overlay" @click.self="confirmDelete = null">
      <div class="modal-content confirm-modal-content">
        <div class="modal-header">
          <div class="header-top">
            <h2>Eliminar semana</h2>
            <button class="modal-close" @click="confirmDelete = null">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <p class="confirm-text">Se va a eliminar la <strong>Semana {{ confirmDelete.week_number }}</strong></p>
        <button class="modal-confirm-btn confirm-accept" @click="handleDeleteWeek(confirmDelete.id)">Aceptar</button>
        <button class="modal-cancel-btn" @click="confirmDelete = null">Cancelar</button>
      </div>
    </div>

    <div v-if="showTransferModal" class="modal-overlay" @click.self="closeTransferModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-top">
            <h2>Mover al calendario</h2>
            <button class="modal-close" @click="closeTransferModal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="transfer-form">
          <div class="transfer-field">
            <label class="transfer-label">Desde semana</label>
            <select v-model.number="transferSourceWeek" class="transfer-select">
              <option v-for="week in store.weeks" :key="week.id" :value="week.week_number">
                Semana {{ week.week_number }}
              </option>
            </select>
          </div>

          <div class="transfer-field">
            <label class="transfer-label">Número de semanas</label>
            <div class="stepper">
              <button class="stepper-btn" @click="transferWeekCount = Math.max(1, transferWeekCount - 1)">-</button>
              <span class="stepper-value">{{ transferWeekCount }}</span>
              <button class="stepper-btn" @click="transferWeekCount = Math.min(maxTransferWeeks, transferWeekCount + 1)">+</button>
            </div>
          </div>

          <div class="transfer-field">
            <label class="transfer-label">Pegar a partir de</label>
            <select v-model.number="transferTargetIndex" class="transfer-select">
              <option v-for="(tw, idx) in targetWeeks" :key="idx" :value="idx">
                {{ tw.label }}
              </option>
            </select>
          </div>
          </div>

        <button class="modal-done-btn" :disabled="transferLoading" @click="handleTransfer">
          {{ transferLoading ? 'Moviendo...' : 'Mover al calendario' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMenuWeeksStore } from '../../stores/menuWeeks'
import { useDishStore } from '../../stores/dishes'
import { useDailyMenuStore } from '../../stores/dailyMenu'
import { supabase, TABLES } from '../../lib/supabase'
import { getCachedImage, cacheImage } from '../../lib/imageCache'

const store = useMenuWeeksStore()
const dishStore = useDishStore()
const dailyMenuStore = useDailyMenuStore()

const loading = computed(() => store.loading)

const weekDays = ['L', 'M', 'X', 'J', 'V']
const dayNamesFull = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const editMode = ref(false)
const confirmDelete = ref(null)
const selectedWeek = ref(null)
const selectedDay = ref(null)
const dayMenu = ref({ lunch: null, dinner: null })
const dishSelector = ref({ show: false, mealType: null })
const dishSearchQuery = ref('')

const showTransferModal = ref(false)
const transferSourceWeek = ref(1)
const transferWeekCount = ref(1)
const transferTargetIndex = ref(0)
const transferLoading = ref(false)
const transferResult = ref(null)

function getImage(url) {
  return getCachedImage(url) || url
}

function getMeal(week, dayIndex, mealType) {
  return store.getMeal(week.id, dayIndex, mealType)
}

function getMealName(week, dayIndex, mealType) {
  const meal = getMeal(week, dayIndex, mealType)
  if (!meal) return ''
  return meal.name.length > 20 ? meal.name.substring(0, 18) + '…' : meal.name
}

function hasMeals(week, dayIndex) {
  return !!(getMeal(week, dayIndex, 'lunch') || getMeal(week, dayIndex, 'dinner'))
}

async function handleAddWeek() {
  await store.addWeek()
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  return d
}

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const targetWeeks = computed(() => {
  const weeks = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = getWeekStart(today)

  for (let i = 0; i < 8; i++) {
    const mon = new Date(start)
    mon.setDate(mon.getDate() + i * 7)
    const fri = new Date(mon)
    fri.setDate(fri.getDate() + 4)

    const monDay = mon.getDate()
    const monMonth = monthNames[mon.getMonth()]
    const friDay = fri.getDate()
    const friMonth = monthNames[fri.getMonth()]

    let label = `${monDay} ${monMonth} - ${friDay} ${friMonth}`
    if (i === 0) label = `${label} (Esta semana)`

    weeks.push({
      label,
      startDate: mon,
      endDate: fri
    })
  }
  return weeks
})

const maxTransferWeeks = computed(() => {
  return Math.max(1, store.weeks.length)
})

const transferWeekLabels = computed(() => {
  if (store.weeks.length === 0) return []
  const sorted = [...store.weeks].sort((a, b) => a.week_number - b.week_number)
  const startIdx = sorted.findIndex(w => w.week_number === transferSourceWeek.value)
  if (startIdx === -1) return []
  const labels = []
  for (let i = 0; i < transferWeekCount.value; i++) {
    const w = sorted[(startIdx + i) % sorted.length]
    labels.push(`Semana ${w.week_number}`)
  }
  return labels
})

function openTransferModal() {
  transferSourceWeek.value = 1
  transferWeekCount.value = Math.max(1, store.weeks.length)
  transferTargetIndex.value = 0
  transferResult.value = null
  showTransferModal.value = true
}

function closeTransferModal() {
  showTransferModal.value = false
  transferResult.value = null
}

async function handleTransfer() {
  const sourceWeekNum = transferSourceWeek.value
  const count = transferWeekCount.value
  const targetStartWeek = targetWeeks.value[transferTargetIndex.value]
  if (!targetStartWeek || store.weeks.length === 0) return

  transferLoading.value = true
  transferResult.value = null

  try {
    const sorted = [...store.weeks].sort((a, b) => a.week_number - b.week_number)
    const startIdx = sorted.findIndex(w => w.week_number === sourceWeekNum)
    const sourceWeeks = []
    for (let i = 0; i < count; i++) {
      sourceWeeks.push(sorted[(startIdx + i) % sorted.length])
    }

    let totalCopied = 0

    for (let wi = 0; wi < sourceWeeks.length; wi++) {
      const sourceWeek = sourceWeeks[wi]
      const targetMon = new Date(targetStartWeek.startDate)
      targetMon.setDate(targetMon.getDate() + wi * 7)

      for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
        const lunchDish = store.getMeal(sourceWeek.id, dayIndex, 'lunch')
        const dinnerDish = store.getMeal(sourceWeek.id, dayIndex, 'dinner')

        const targetDate = new Date(targetMon)
        targetDate.setDate(targetDate.getDate() + dayIndex)
        const dateStr = formatDate(targetDate)

        if (lunchDish) {
          await dailyMenuStore.setDishForDate(dateStr, lunchDish.id, 'lunch')
          totalCopied++
        }
        if (dinnerDish) {
          await dailyMenuStore.setDishForDate(dateStr, dinnerDish.id, 'dinner')
          totalCopied++
        }
      }
    }

    transferResult.value = {
      type: 'success',
      message: `Se movieron ${totalCopied} platos al calendario`
    }
  } catch (e) {
    transferResult.value = {
      type: 'error',
      message: 'Error al mover los platos: ' + e.message
    }
  } finally {
    transferLoading.value = false
  }
}

async function handleDeleteWeek(weekId) {
  await store.deleteWeek(weekId)
  confirmDelete.value = null
  editMode.value = false
}

function selectDay(week, dayIndex) {
  selectedWeek.value = week
  selectedDay.value = dayIndex
  dayMenu.value = {
    lunch: getMeal(week, dayIndex, 'lunch'),
    dinner: getMeal(week, dayIndex, 'dinner')
  }
}

function closeDayDetail() {
  selectedWeek.value = null
  selectedDay.value = null
  dayMenu.value = { lunch: null, dinner: null }
}

function openDishSelector(mealType) {
  dishSelector.value = { show: true, mealType }
}

function closeDishSelector() {
  dishSelector.value = { show: false, mealType: null }
  dishSearchQuery.value = ''
}

const availableDishes = computed(() => {
  const mealType = dishSelector.value.mealType
  const query = dishSearchQuery.value.toLowerCase().trim()
  if (!mealType) return []
  let dishes = [...dishStore.dishes]

  if (query) {
    dishes = dishes.filter(dish => dish.name.toLowerCase().includes(query))
  }

  return dishes.sort((a, b) => {
    const aPriority = a.meal_type === mealType ? 0 : a.meal_type === 'both' ? 1 : 2
    const bPriority = b.meal_type === mealType ? 0 : b.meal_type === 'both' ? 1 : 2
    return aPriority - bPriority
  })
})

const currentDishForMeal = computed(() => {
  if (selectedWeek.value === null || selectedDay.value === null || !dishSelector.value.mealType) return null
  return dayMenu.value[dishSelector.value.mealType]
})

async function assignDish(dishId) {
  if (selectedWeek.value === null || selectedDay.value === null || !dishSelector.value.mealType) return
  const dish = dishStore.dishes.find(d => d.id === dishId)
  await store.setDishForDay(selectedWeek.value.id, selectedDay.value, dishSelector.value.mealType, dishId)
  dayMenu.value[dishSelector.value.mealType] = dish
  closeDishSelector()
}

async function removeDish() {
  if (selectedWeek.value === null || selectedDay.value === null || !dishSelector.value.mealType) return
  await store.removeDishFromDay(selectedWeek.value.id, selectedDay.value, dishSelector.value.mealType)
  dayMenu.value[dishSelector.value.mealType] = null
  closeDishSelector()
}

watch(transferSourceWeek, () => {
  const max = maxTransferWeeks.value
  if (transferWeekCount.value > max) {
    transferWeekCount.value = max
  }
})

onMounted(async () => {
  await dishStore.fetchDishes()
  await store.fetchWeeks()
  dishStore.dishes.forEach(dish => {
    if (dish.image_url) {
      const cached = getCachedImage(dish.image_url)
      if (!cached) {
        cacheImage(dish.image_url)
      }
    }
  })
})
</script>

<style scoped>
.menu-view {
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

.header-section {
  flex-shrink: 0;
  padding: 12px 16px 8px;
  background: var(--surface);
  box-sizing: border-box;
}

.menu-header {
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--on-surface);
  margin: 0;
  text-align: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.transfer-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  color: var(--on-surface-variant);
  background: var(--surface-container);
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn.active {
  background: var(--primary);
  color: var(--on-primary);
}

.transfer-btn:hover {
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  min-height: 0;
}

.loading {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--surface-container-high);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  color: var(--on-surface-variant);
  opacity: 0.5;
  margin-bottom: 8px;
}

.empty-state h3 {
  font-size: 1.1rem;
  color: var(--on-surface);
}

.empty-state p {
  font-size: 0.9rem;
  color: var(--on-surface-variant);
  margin: 0;
}

.weeks-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 120px;
}

.week-group {
  margin-bottom: 8px;
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.week-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--on-surface-variant);
}

.delete-week-btn {
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

.delete-week-btn:hover {
  background: var(--error-container);
  color: var(--error);
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  position: sticky;
  top: 0;
  background: var(--surface);
  z-index: 1;
  padding: 8px 0 4px;
  margin-bottom: 4px;
}

.weekday {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--on-surface-variant);
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
}

.grid-day {
  display: flex;
  flex-direction: column;
  padding: 6px 4px;
  border-radius: 6px;
  background: var(--surface-container);
  cursor: pointer;
  overflow: hidden;
  min-height: 52px;
}
.meal-indicator {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2px;
}

.meal-line {
  font-size: 0.55rem;
  font-weight: 600;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;
  line-height: 1.2;
}

.meal-line.empty {
  color: var(--outline-variant);
  font-size: 0.6rem;
}

@media (min-width: 768px) {
  .meal-line {
    font-size: 0.65rem;
  }
}

/* Floating Add Button */
.fab-add-btn {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 400;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 50;
  transition: all 0.15s;
}

.fab-add-btn:active {
  transform: scale(0.92);
}

/* Modal styles (same as CalendarView) */
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

.dish-selector-header {
  flex-shrink: 0;
}

.dish-list {
  flex: 1;
  overflow-y: auto;
  margin-top: 12px;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.header-top {
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

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--surface-container);
  border-radius: var(--radius-sm);
}

.search-box svg {
  color: var(--on-surface-variant);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  font-size: 0.95rem;
  color: var(--on-surface);
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
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

.modal-meal {
  margin-bottom: 16px;
}

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

.modal-done-btn {
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

.confirm-modal-content {
  height: auto !important;
  padding-bottom: 32px;
}

.confirm-text {
  text-align: center;
  font-size: 1rem;
  color: var(--on-surface);
  margin: 0 0 24px;
  line-height: 1.5;
}

.confirm-accept {
  width: 100%;
  padding: 14px;
  background: var(--error);
  color: var(--on-error);
  border-radius: 12px;
  font-weight: 600;
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

@media (max-width: 767px) {
  .content-section {
    padding-bottom: 65px;
  }
}

@media (min-width: 768px) {
  .menu-view {
    max-width: none;
  }

  .header-section {
    padding: 12px 32px 8px;
  }

  .content-section {
    padding-left: 0;
    padding-right: 0;
  }

  .weeks-list {
    padding: 0 32px 100px;
  }
}

.transfer-form {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 8px;
}

.transfer-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.transfer-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--on-surface-variant);
}

.transfer-select {
  padding: 12px 16px;
  background: var(--surface-container);
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--on-surface);
  cursor: pointer;
  font-family: inherit;
}

.transfer-select:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--primary);
}

.stepper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--surface-container);
  border-radius: 10px;
  width: fit-content;
}

.stepper-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-container-high);
  color: var(--on-surface);
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
}

.stepper-btn:active {
  transform: scale(0.9);
}

.stepper-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--on-surface);
  min-width: 24px;
  text-align: center;
}

.transfer-summary {
  padding: 12px;
  background: var(--surface-container-low);
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--on-surface);
  line-height: 1.5;
}

.transfer-result {
  padding: 12px;
  border-radius: 10px;
  margin-top: 12px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
}

.transfer-result.success {
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.transfer-result.error {
  background: var(--error-container);
  color: var(--error);
}

.modal-done-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
