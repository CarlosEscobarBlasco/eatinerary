// Global image cache - persists across component mounts
// Uses localStorage for persistence and session memory for fast access

const IMAGE_CACHE_PREFIX = 'mealendar_img_'
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// In-memory cache (module-level singleton)
const memoryCache = new Map()

// Simple hash function for URL -> key (avoids btoa issues with Unicode)
function hashUrl(url) {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return 'img_' + Math.abs(hash).toString(36)
}

// Get image from cache
export function getCachedImage(url) {
  if (!url) return null
  
  const key = hashUrl(url)
  
  // Check memory cache first
  if (memoryCache.has(key)) {
    return memoryCache.get(key)
  }
  
  // Check localStorage
  try {
    const storageKey = IMAGE_CACHE_PREFIX + key
    const cached = localStorage.getItem(storageKey)
    if (cached) {
      const data = JSON.parse(cached)
      if (data.expires > Date.now()) {
        memoryCache.set(key, data.url)
        return data.url
      } else {
        localStorage.removeItem(storageKey)
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  
  return null
}

// Save image to cache
export async function cacheImage(url) {
  if (!url) return false
  
  const key = hashUrl(url)
  
  // Skip if already cached
  if (memoryCache.has(key)) {
    return true
  }
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return false
    }
    
    const blob = await response.blob()
    
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result
        
        // Save to memory cache
        memoryCache.set(key, base64)
        
        // Save to localStorage with expiry
        try {
          const storageKey = IMAGE_CACHE_PREFIX + key
          localStorage.setItem(storageKey, JSON.stringify({
            url: base64,
            expires: Date.now() + CACHE_EXPIRY_MS
          }))
        } catch (e) {
          // localStorage might be full - continue anyway
          console.warn('Image cache localStorage full:', e.message)
        }
        
        resolve(true)
      }
      reader.onerror = () => resolve(false)
      reader.readAsDataURL(blob)
    })
  } catch (e) {
    return false
  }
}

// Pre-cache multiple images
export async function cacheImages(urls) {
  const promises = urls
    .filter(url => url && !getCachedImage(url))
    .map(url => cacheImage(url))
  
  await Promise.all(promises)
}

// Clear all cached images
export function clearImageCache() {
  memoryCache.clear()
  
  // Clear localStorage items
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(IMAGE_CACHE_PREFIX)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key))
}

// Get cache stats
export function getImageCacheStats() {
  return {
    memorySize: memoryCache.size,
    url: window.location.href
  }
}