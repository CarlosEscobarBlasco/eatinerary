<template>
  <div class="dishes-view">
    <header class="dishes-header">
      <h1>Mis Platos</h1>
    </header>

    <div v-if="dishStore.loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Cargando...</p>
    </div>
    <div v-else-if="dishStore.error" class="error">
      <p>{{ dishStore.error }}</p>
    </div>

    <div v-else class="dishes-grid">
      <article 
        v-for="dish in dishStore.dishes" 
        :key="dish.id" 
        class="dish-card"
        :style="dish.image_url ? { backgroundImage: `url(${dish.image_url})` } : {}"
        @click="openForm(dish)"
      >
        <div class="dish-card-overlay">
          <div class="dish-card-content">
            <h3>{{ dish.name }}</h3>
            <div class="dish-badges">
              <span v-if="dish.meal_type === 'lunch'" class="dish-badge lunch"></span>
              <span v-else-if="dish.meal_type === 'dinner'" class="dish-badge dinner"></span>
              <span v-else class="dish-badge both"></span>
            </div>
          </div>
        </div>
      </article>

      <div v-if="dishStore.dishes.length === 0" class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h3>No hay platos todavía</h3>
        <p>Añade tu primer plato para comenzar</p>
        <button class="add-first-btn" @click="openForm()">Añadir plato</button>
      </div>
    </div>

    <!-- Floating Add Button -->
    <button class="fab-add-btn" @click="openForm()">
      <span>+</span>
    </button>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal-content form-modal">
        <header class="modal-header">
          <h2>{{ editingDish ? 'Editar Plato' : 'Nuevo Plato' }}</h2>
          <div class="header-actions">
            <button v-if="editingDish" class="delete-btn" @click="deleteDish">
              <span>🗑️</span>
            </button>
            <button class="close-btn" @click="closeForm">
              <span>×</span>
            </button>
          </div>
        </header>

        <form @submit.prevent="saveDish" class="dish-form">
          <div class="form-group">
            <label>Nombre del plato</label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              placeholder="Ej: Pasta carbonara" 
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label>Imagen</label>
            
            <!-- Preview de imagen actual/seleccionada -->
            <div v-if="imagePreview || form.image_url" class="image-preview">
              <img :src="imagePreview || form.image_url" alt="Preview" />
              <button type="button" class="remove-image" @click="removeImage">
                <span>×</span>
              </button>
            </div>
            
            <!-- Input de archivo -->
            <div v-else class="image-upload">
              <label class="upload-label">
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleImageChange"
                  class="file-input"
                />
                <div class="upload-content">
                  <span class="upload-icon">📷</span>
                  <span class="upload-text">Subir imagen</span>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Ingredientes</label>
            <div class="ingredients-list">
              <div v-for="(ingredient, index) in form.ingredients" :key="index" class="ingredient-row">
                <input 
                  v-model="form.ingredients[index]" 
                  type="text" 
                  placeholder="Ingrediente" 
                  class="input-field"
                />
                <button 
                  type="button" 
                  class="remove-ingredient" 
                  @click="removeIngredient(index)"
                  v-if="form.ingredients.length > 1"
                >
                  <span>×</span>
                </button>
              </div>
              <button type="button" class="add-ingredient-btn" @click="addIngredient">
                + Añadir ingrediente
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Tipo de comida</label>
            <div class="meal-selector">
              <button 
                type="button"
                class="meal-option"
                :class="{ active: form.meal_type === 'lunch' }"
                @click="form.meal_type = 'lunch'"
              >
                <span class="option-color lunch"></span>
                <span>Comida</span>
              </button>
              <button 
                type="button"
                class="meal-option"
                :class="{ active: form.meal_type === 'dinner' }"
                @click="form.meal_type = 'dinner'"
              >
                <span class="option-color dinner"></span>
                <span>Cena</span>
              </button>
              <button 
                type="button"
                class="meal-option"
                :class="{ active: form.meal_type === 'both' }"
                @click="form.meal_type = 'both'"
              >
                <span class="option-color both"></span>
                <span>Ambos</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Link (URL)</label>
            <input 
              v-model="form.url" 
              type="url" 
              placeholder="https://..." 
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label>Notas</label>
            <textarea 
              v-model="form.notes" 
              placeholder="Notas adicionales..." 
              rows="3"
              class="input-field textarea"
            ></textarea>
          </div>

          <button 
            type="submit" 
            class="submit-btn" 
            :disabled="dishStore.loading || uploading"
          >
            {{ dishStore.loading || uploading ? 'Guardando...' : 'Guardar plato' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useDishStore } from '../../stores/dishes'
import { MEAL_TYPES } from '../../lib/supabase'

const dishStore = useDishStore()

const showForm = ref(false)
const editingDish = ref(null)
const imageFile = ref(null)
const imagePreview = ref(null)
const uploading = ref(false)

const form = ref({
  name: '',
  image_url: '',
  ingredients: [''],
  meal_type: MEAL_TYPES.LUNCH,
  url: '',
  notes: ''
})

function openForm(dish = null) {
  editingDish.value = dish
  imageFile.value = null
  imagePreview.value = null
  
  if (dish) {
    form.value = {
      name: dish.name || '',
      image_url: dish.image_url || '',
      ingredients: dish.ingredients ? dish.ingredients.split(',').map(i => i.trim()) : [''],
      meal_type: dish.meal_type || MEAL_TYPES.LUNCH,
      url: dish.url || '',
      notes: dish.notes || ''
    }
  } else {
    resetForm()
  }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingDish.value = null
  imageFile.value = null
  imagePreview.value = null
  resetForm()
}

function resetForm() {
  form.value = {
    name: '',
    image_url: '',
    ingredients: [''],
    meal_type: MEAL_TYPES.LUNCH,
    url: '',
    notes: ''
  }
}

function handleImageChange(event) {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

function removeImage() {
  imageFile.value = null
  imagePreview.value = null
  form.value.image_url = ''
}

function addIngredient() {
  form.value.ingredients.push('')
}

function removeIngredient(index) {
  form.value.ingredients.splice(index, 1)
  if (form.value.ingredients.length === 0) {
    form.value.ingredients.push('')
  }
}

async function saveDish() {
  const dishData = {
    name: form.value.name,
    image_url: form.value.image_url || null,
    ingredients: form.value.ingredients.filter(i => i.trim()).join(', '),
    meal_type: form.value.meal_type,
    url: form.value.url || null,
    notes: form.value.notes || null
  }

  let result
  
  if (editingDish.value) {
    result = await dishStore.updateDish(editingDish.value.id, dishData, imageFile.value || null)
  } else {
    result = await dishStore.addDish(dishData, imageFile.value)
  }

  if (result) {
    await dishStore.fetchDishes()
    closeForm()
  }
}

async function deleteDish() {
  if (editingDish.value && confirm('¿Estás seguro de que quieres eliminar este plato?')) {
    const success = await dishStore.deleteDish(editingDish.value.id)
    if (success) {
      closeForm()
    }
  }
}

onMounted(() => {
  dishStore.fetchDishes()
})
</script>

<style scoped>
.dishes-view {
  min-height: 100vh;
  background: var(--surface);
}

.dishes-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.dishes-header h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--surface-container);
  color: var(--on-surface);
  font-size: 1.25rem;
  transition: all 0.2s;
}

.back-btn:active {
  transform: scale(0.95);
}

.dishes-header h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--on-surface);
  margin: 0;
}

.header-spacer {
  width: 40px;
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

.add-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary);
  font-size: 1.5rem;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 12px var(--shadow);
}

.add-btn:active {
  transform: scale(0.95);
}

.loading, .error {
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
  border: 3px solid var(--surface-container);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  color: var(--error);
}

.dishes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px 20px;
}

.dish-card {
  aspect-ratio: 1;
  border-radius: var(--radius);
  overflow: hidden;
  position: relative;
  background-size: cover;
  background-position: center;
  background-color: var(--surface-container);
  cursor: pointer;
  transition: all 0.2s;
}

.dish-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--shadow-lg);
}

.dish-card:active {
  transform: scale(0.98);
}

.dish-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(57, 56, 49, 0.8) 0%, transparent 50%);
  display: flex;
  align-items: flex-end;
  padding: 16px;
}

.dish-card-content h3 {
  font-size: 1rem;
  color: white;
  margin: 0 0 8px;
  font-weight: 600;
}

.dish-badges {
  display: flex;
  gap: 4px;
}

.dish-badge {
  width: 20px;
  height: 8px;
  border-radius: 4px;
}

.dish-badge.lunch {
  background: #f97316;
}

.dish-badge.dinner {
  background: #3b82f6;
}

.dish-badge.both {
  background: linear-gradient(90deg, #f97316 0%, #3b82f6 100%);
}

/* Empty State */
.empty-state {
  grid-column: span 2;
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: var(--on-surface);
  margin: 0;
}

.empty-state p {
  font-size: 0.875rem;
  color: var(--on-surface-variant);
  margin: 0;
}

.add-first-btn {
  margin-top: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 12px var(--shadow);
  transition: all 0.2s;
}

.add-first-btn:active {
  transform: scale(0.98);
}

/* Form Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(57, 56, 49, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 100%;
  max-height: 90vh;
  background: var(--surface-container-lowest);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.form-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--surface-container);
}

.form-modal .modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--on-surface);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--error-container);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--on-surface);
}

.dish-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 75vh;
  overflow-y: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--on-surface);
}

.input-field {
  width: 100%;
  padding: 14px 16px;
  background: var(--surface-container-highest);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  color: var(--on-surface);
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  background: var(--surface);
  box-shadow: inset 0 0 0 2px var(--primary);
}

.input-field::placeholder {
  color: var(--on-surface-variant);
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

/* Image Preview */
.image-preview {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  max-height: 200px;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(57, 56, 49, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload {
  border: 2px dashed var(--outline-variant);
  border-radius: var(--radius);
  padding: 32px;
  text-align: center;
}

.upload-label {
  cursor: pointer;
  display: block;
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 2rem;
}

.upload-text {
  font-size: 0.875rem;
  color: var(--on-surface-variant);
}

/* Ingredients */
.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ingredient-row {
  display: flex;
  gap: 8px;
}

.ingredient-row .input-field {
  flex: 1;
}

.remove-ingredient {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: var(--surface-container);
  color: var(--error);
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-ingredient-btn {
  padding: 12px;
  border: 1px dashed var(--outline-variant);
  border-radius: var(--radius-sm);
  background: none;
  color: var(--on-surface-variant);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-ingredient-btn:active {
  background: var(--surface-container);
}

/* Meal Selector */
.meal-selector {
  display: flex;
  gap: 8px;
}

.meal-option {
  flex: 1;
  padding: 12px 8px;
  border: 2px solid var(--surface-container);
  border-radius: var(--radius-sm);
  background: var(--surface-container-low);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--on-surface-variant);
  font-size: 0.75rem;
  font-weight: 600;
}

.meal-option.active {
  border-color: var(--primary);
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.option-color {
  width: 24px;
  height: 10px;
  border-radius: 5px;
}

.option-color.lunch {
  background: #f97316;
}

.option-color.dinner {
  background: #3b82f6;
}

.option-color.both {
  background: linear-gradient(90deg, #f97316 0%, #3b82f6 100%);
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 12px var(--shadow);
  transition: all 0.2s;
  margin-top: 8px;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
