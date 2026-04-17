import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, TABLES, MEAL_TYPES } from '../lib/supabase'

export const useDailyMenuStore = defineStore('dailyMenu', () => {
  const dailyMenus = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Cache en memoria para menús por fecha
  // Key: fecha en formato YYYY-MM-DD
  // Value: array de menús para esa fecha (lunch y dinner)
  const menuCache = new Map()

  // Cache para rangos de fechas
  // Key: string "startDate-endDate"
  // Value: array de menús en ese rango
  const rangeCache = new Map()

  // Función helper para obtener clave de cache
  function getCacheKey(date) {
    return date
  }

  // Función helper para obtener clave de cache de rango
  function getRangeCacheKey(startDate, endDate) {
    return `${startDate}-${endDate}`
  }

  async function fetchDailyMenus(startDate, endDate) {
    const cacheKey = getRangeCacheKey(startDate, endDate)

    // Verificar si ya hay datos en cache para este rango
    if (rangeCache.has(cacheKey)) {
      dailyMenus.value = rangeCache.get(cacheKey)
      return
    }

    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from(TABLES.DAILY_MENU)
        .select('*, dishes:dish_id(*)')

      if (startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate)
      }

      const { data, error: err } = await query.order('date')
      
      if (err) throw err
      dailyMenus.value = data

      // Guardar en cache
      rangeCache.set(cacheKey, data)

      // Agrupar por fecha y guardar en cache individual
      const menusByDate = {}
      data.forEach(menu => {
        if (!menusByDate[menu.date]) {
          menusByDate[menu.date] = []
        }
        menusByDate[menu.date].push(menu)
      })
      
      // Guardar cada fecha con su array de menús
      Object.entries(menusByDate).forEach(([date, menus]) => {
        menuCache.set(date, menus)
      })
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchMenuForDate(date) {
    const cacheKey = getCacheKey(date)

    // Verificar cache primero
    if (menuCache.has(date)) {
      // Devolver array con los resultados cacheados
      return menuCache.get(date)
    }

    try {
      const { data, error: err } = await supabase
        .from(TABLES.DAILY_MENU)
        .select('*, dishes:dish_id(*)')
        .eq('date', date)
        .order('meal_type')
      
      if (err) throw err

      // Guardar en cache (array de menús para esa fecha)
      menuCache.set(date, data || [])

      return data
    } catch (e) {
      return []
    }
  }

  async function setDishForDate(date, dishId, mealType) {
    loading.value = true
    error.value = null
    try {
      // Eliminar entrada existente para ese tipo de comida
      await supabase
        .from(TABLES.DAILY_MENU)
        .delete()
        .eq('date', date)
        .eq('meal_type', mealType)

      // Crear nueva entrada
      const { data, error: err } = await supabase
        .from(TABLES.DAILY_MENU)
        .insert([{
          date,
          dish_id: dishId,
          meal_type: mealType
        }])
        .select()
        .single()
      
      if (err) throw err

      // Obtener todos los menús actualizados para esa fecha y guardar en cache
      const { data: updatedMenus } = await supabase
        .from(TABLES.DAILY_MENU)
        .select('*, dishes:dish_id(*)')
        .eq('date', date)
        .order('meal_type')
      
      if (updatedMenus) {
        menuCache.set(date, updatedMenus)
      }

      // Limpiar cache de rangos porque cambio la data
      invalidateRangeCache()

      return data
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function removeDishFromDate(date, mealType) {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from(TABLES.DAILY_MENU)
        .delete()
        .eq('date', date)
        .eq('meal_type', mealType)
      
      if (err) throw err

      // Obtener todos los menús restantes para esa fecha y guardar en cache
      const { data: updatedMenus } = await supabase
        .from(TABLES.DAILY_MENU)
        .select('*, dishes:dish_id(*)')
        .eq('date', date)
        .order('meal_type')
      
      if (updatedMenus && updatedMenus.length > 0) {
        menuCache.set(date, updatedMenus)
      } else {
        // Si no hay más menús, guardar array vacío
        menuCache.set(date, [])
      }

      // Limpiar cache de rangos porque cambio la data
      invalidateRangeCache()

      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Funcion para invalidar todos los caches de rango
  function invalidateRangeCache() {
    rangeCache.clear()
  }

  // Funcion para limpiar todo el cache (util para logout o refresh forzado)
  function clearCache() {
    menuCache.clear()
    rangeCache.clear()
  }

  return {
    dailyMenus,
    loading,
    error,
    fetchDailyMenus,
    fetchMenuForDate,
    setDishForDate,
    removeDishFromDate,
    clearCache,
    menuCache,
    rangeCache
  }
})