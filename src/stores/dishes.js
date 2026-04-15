import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, TABLES, MEAL_TYPES, uploadDishImage, deleteDishImage } from '../lib/supabase'

export const useDishStore = defineStore('dishes', () => {
  const dishes = ref([])
  const loading = ref(false)
  const error = ref(null)

  const dishesByMealType = computed(() => {
    return (mealType) => {
      if (mealType === 'all') return dishes.value
      return dishes.value.filter(d => d.meal_type === mealType || d.meal_type === MEAL_TYPES.BOTH)
    }
  })

  async function fetchDishes() {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from(TABLES.DISHES)
        .select('*')
        .order('name')
      
      if (err) throw err
      dishes.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function addDish(dishData, imageFile = null) {
    loading.value = true
    error.value = null
    try {
      let imageUrl = dishData.image_url

      // Si hay archivo, primero crear el registro para obtener el ID
      const { data: dish, error: err } = await supabase
        .from(TABLES.DISHES)
        .insert([{ ...dishData, image_url: null }])
        .select()
        .single()
      
      if (err) throw err

      // Subir imagen si existe
      if (imageFile) {
        imageUrl = await uploadDishImage(imageFile, dish.id)
        // Actualizar con la URL
        const { data: updated, error: err2 } = await supabase
          .from(TABLES.DISHES)
          .update({ image_url: imageUrl })
          .eq('id', dish.id)
          .select()
          .single()
        
        if (err2) throw err2
        dishes.value.push(updated)
        return updated
      }

      dishes.value.push(dish)
      return dish
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateDish(id, dishData, newImageFile = null) {
    loading.value = true
    error.value = null
    try {
      let imageUrl = dishData.image_url

      // Si hay nueva imagen, subirla y reemplazar
      if (newImageFile) {
        // Obtener imagen anterior para borrar
        const oldDish = dishes.value.find(d => d.id === id)
        if (oldDish?.image_url) {
          await deleteDishImage(oldDish.image_url)
        }
        
        imageUrl = await uploadDishImage(newImageFile, id)
      }

      const updateData = {
        ...dishData,
        ...(imageUrl && { image_url: imageUrl })
      }

      const { data, error: err } = await supabase
        .from(TABLES.DISHES)
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (err) throw err
      
      const index = dishes.value.findIndex(d => d.id === id)
      if (index !== -1) {
        dishes.value[index] = data
      }
      return data
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteDish(id) {
    loading.value = true
    error.value = null
    try {
      // Obtener el plato para borrar la imagen
      const dish = dishes.value.find(d => d.id === id)
      if (dish?.image_url) {
        await deleteDishImage(dish.image_url)
      }

      // Borrar referencias en daily_menu directamente
      // Usar delete en lugar de select para evitar problemas de RLS
      await supabase
        .from(TABLES.DAILY_MENU)
        .delete()
        .eq('dish_id', id)

      // Pequeña pausa para que se procese el borrado
      await new Promise(resolve => setTimeout(resolve, 100))

      // Borrar el plato
      const { error: err } = await supabase
        .from(TABLES.DISHES)
        .delete()
        .eq('id', id)
      
      if (err) throw err
      dishes.value = dishes.value.filter(d => d.id !== id)
      return true
    } catch (e) {
      error.value = e.message
      console.error('Error deleting dish:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    dishes,
    loading,
    error,
    dishesByMealType,
    fetchDishes,
    addDish,
    updateDish,
    deleteDish
  }
})