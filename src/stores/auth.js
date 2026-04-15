import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  async function initAuth() {
    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        user.value = session.user
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user || null
      })
    } catch (e) {
      console.error('Error initializing auth:', e)
    } finally {
      loading.value = false
    }
  }

  async function getSession() {
    return await supabase.auth.getSession()
  }

  async function signUp(email, password) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (err) throw err
      return data
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function signIn(email, password) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (err) throw err
      return data
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    try {
      await supabase.auth.signOut()
      user.value = null
    } catch (e) {
      console.error('Error signing out:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    initAuth,
    getSession,
    signUp,
    signIn,
    signOut
  }
})