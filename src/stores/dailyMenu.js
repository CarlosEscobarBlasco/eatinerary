import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, TABLES, MEAL_TYPES } from '../lib/supabase'

export const useDailyMenuStore = defineStore('dailyMenu', () => {
  const dailyMenus = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchDailyMenus(startDate, endDate) {
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
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchMenuForDate(date) {
    try {
      const { data, error: err } = await supabase
        .from(TABLES.DAILY_MENU)
        .select('*, dishes:dish_id(*)')
        .eq('date', date)
        .order('meal_type')
      
      if (err) throw err
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
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    dailyMenus,
    loading,
    error,
    fetchDailyMenus,
    fetchMenuForDate,
    setDishForDate,
    removeDishFromDate
  }
})