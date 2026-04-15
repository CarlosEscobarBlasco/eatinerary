import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const TABLES = {
  DISHES: 'dishes',
  DAILY_MENU: 'daily_menu'
}

export const MEAL_TYPES = {
  LUNCH: 'lunch',
  DINNER: 'dinner',
  BOTH: 'both'
}

// Bucket para las imágenes
export const STORAGE_BUCKET = 'dish-images'

// Funciones para manejo de imágenes
export async function uploadDishImage(file, dishId) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${dishId}-${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName)

  return publicUrl
}

export async function deleteDishImage(imageUrl) {
  if (!imageUrl) return

  // Extraer nombre del archivo de la URL
  const urlParts = imageUrl.split('/')
  const fileName = urlParts[urlParts.length - 1]

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([fileName])

  if (error) console.error('Error deleting image:', error)
}

export function getImageUrl(pathOrUrl) {
  if (!pathOrUrl) return null
  
  // Si ya es una URL completa, retornarla
  if (pathOrUrl.startsWith('http')) return pathOrUrl
  
  // Si es solo un path, construir URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(pathOrUrl)
  
  return publicUrl
}