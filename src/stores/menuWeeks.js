import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, TABLES } from '../lib/supabase'

export const useMenuWeeksStore = defineStore('menuWeeks', () => {
  const weeks = ref([])
  const weekMeals = ref({})
  const loading = ref(false)
  const weeksCacheLoaded = ref(false)

  function mealsKey(weekId, dayIndex, mealType) {
    return `${weekId}-${dayIndex}-${mealType}`
  }

  function indexMeals(mealsData) {
    const meals = {}
    for (const meal of mealsData || []) {
      const dish = Array.isArray(meal.dishes) ? meal.dishes[0] : meal.dishes
      meals[mealsKey(meal.week_id, meal.day_index, meal.meal_type)] = dish
    }
    weekMeals.value = meals
  }

  async function fetchWeeks() {
    if (weeksCacheLoaded.value && weeks.value.length > 0) {
      return
    }

    loading.value = true
    try {
      const { data: weeksData, error } = await supabase
        .from(TABLES.MENU_WEEKS)
        .select('*')
        .order('week_number')

      if (error) throw error
      weeks.value = weeksData || []

      if (weeksData && weeksData.length > 0) {
        const weekIds = weeksData.map(w => w.id)
        const { data: mealsData } = await supabase
          .from(TABLES.WEEK_MEALS)
          .select('*, dishes:dish_id(*)')
          .in('week_id', weekIds)

        indexMeals(mealsData)
      }

      weeksCacheLoaded.value = true
    } catch (e) {
      console.error('Error fetching weeks:', e)
    } finally {
      loading.value = false
    }
  }

  async function refreshWeeks() {
    weeksCacheLoaded.value = false
    await fetchWeeks()
  }

  async function addWeek() {
    loading.value = true
    try {
      const maxNum = weeks.value.length > 0
        ? Math.max(...weeks.value.map(w => w.week_number))
        : 0

      const { data, error } = await supabase
        .from(TABLES.MENU_WEEKS)
        .insert([{ week_number: maxNum + 1 }])
        .select()
        .single()

      if (error) throw error
      weeks.value.push(data)
      return data
    } catch (e) {
      console.error('Error adding week:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteWeek(weekId) {
    loading.value = true
    try {
      const { error } = await supabase
        .from(TABLES.MENU_WEEKS)
        .delete()
        .eq('id', weekId)

      if (error) throw error

      weeks.value = weeks.value.filter(w => w.id !== weekId)

      for (let i = 0; i < weeks.value.length; i++) {
        const newNumber = i + 1
        if (weeks.value[i].week_number !== newNumber) {
          await supabase
            .from(TABLES.MENU_WEEKS)
            .update({ week_number: newNumber })
            .eq('id', weeks.value[i].id)
          weeks.value[i].week_number = newNumber
        }
      }

      Object.keys(weekMeals.value).forEach(key => {
        if (key.startsWith(String(weekId) + '-')) {
          delete weekMeals.value[key]
        }
      })
    } catch (e) {
      console.error('Error deleting week:', e)
    } finally {
      loading.value = false
    }
  }

  async function setDishForDay(weekId, dayIndex, mealType, dishId) {
    try {
      const { error } = await supabase
        .from(TABLES.WEEK_MEALS)
        .upsert({
          week_id: weekId,
          day_index: dayIndex,
          meal_type: mealType,
          dish_id: dishId
        }, {
          onConflict: 'week_id, day_index, meal_type'
        })
        .select()

      if (error) throw error

      const dish = dishId ? await fetchDishById(dishId) : null
      weekMeals.value[mealsKey(weekId, dayIndex, mealType)] = dish
    } catch (e) {
      console.error('Error setting dish for day:', e)
    }
  }

  async function removeDishFromDay(weekId, dayIndex, mealType) {
    try {
      const { error } = await supabase
        .from(TABLES.WEEK_MEALS)
        .delete()
        .eq('week_id', weekId)
        .eq('day_index', dayIndex)
        .eq('meal_type', mealType)

      if (error) throw error

      delete weekMeals.value[mealsKey(weekId, dayIndex, mealType)]
    } catch (e) {
      console.error('Error removing dish from day:', e)
    }
  }

  async function fetchDishById(dishId) {
    const { data } = await supabase
      .from(TABLES.DISHES)
      .select('*')
      .eq('id', dishId)
      .single()

    return data
  }

  function getMeal(weekId, dayIndex, mealType) {
    return weekMeals.value[mealsKey(weekId, dayIndex, mealType)] || null
  }

  function clearCache() {
    weeks.value = []
    weekMeals.value = {}
    weeksCacheLoaded.value = false
  }

  return {
    weeks,
    weekMeals,
    loading,
    weeksCacheLoaded,
    fetchWeeks,
    refreshWeeks,
    addWeek,
    deleteWeek,
    setDishForDay,
    removeDishFromDay,
    getMeal,
    clearCache
  }
})
