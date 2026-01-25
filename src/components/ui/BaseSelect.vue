<template>
  <div class="base-select" ref="container">
    <div 
      ref="triggerRef"
      class="select-trigger" 
      :class="{ 'is-open': isOpen }"
      @click="toggle"
      tabindex="0"
      @keydown.space.prevent="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.esc="close"
    >
      <span class="selected-label">{{ selectedLabel }}</span>
      <svg 
        class="select-arrow" 
        :class="{ 'rotated': isOpen }"
        viewBox="0 0 24 24" 
        width="24" 
        height="24"
      >
        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
      </svg>
    </div>
    
    <Teleport to="body">
      <transition name="select-fade">
        <div 
          v-if="isOpen" 
          ref="dropdownRef"
          class="options-list"
          :style="dropdownStyle"
          @mousedown.stop
        >
          <div 
            v-for="option in options" 
            :key="option.value"
            class="option-item"
            :class="{ selected: modelValue === option.value }"
            @click="select(option)"
            tabindex="0"
            @keydown.enter.prevent="select(option)"
            @keydown.space.prevent="select(option)"
          >
            <span class="option-label">{{ option.label }}</span>
            <svg v-if="modelValue === option.value" class="check-icon" viewBox="0 0 24 24" width="18" height="18">
               <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true
  },
  options: {
    type: Array,
    required: true,
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const container = ref(null);
const triggerRef = ref(null);
const dropdownRef = ref(null);
const dropdownStyle = ref({});

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected ? selected.label : '';
});

function toggle() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      updatePosition();
    });
  }
}

function close() {
  isOpen.value = false;
}

function select(option) {
  emit('update:modelValue', option.value);
  emit('change', option.value);
  close();
}

function updatePosition() {
  if (!triggerRef.value || !dropdownRef.value) return;
  
  const rect = triggerRef.value.getBoundingClientRect();
  const dropdownRect = dropdownRef.value.getBoundingClientRect();
  const screenHeight = window.innerHeight;

  let top = rect.bottom + 4;
  let left = rect.left;
  let width = rect.width; // Match trigger width by default
  
  // Check if it fits below
  if (top + dropdownRect.height > screenHeight - 10) {
     // If not, put it above
     if (rect.top - dropdownRect.height - 4 > 0) {
        top = rect.top - dropdownRect.height - 4;
     }
  }

  dropdownStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    position: 'fixed'
  };
}

// Global click handler
function handleGlobalClick(event) {
  // Check if click is outside both trigger and dropdown
  if (!isOpen.value) return;
  
  const target = event.target;
  const isTrigger = container.value && container.value.contains(target);
  const isDropdown = dropdownRef.value && dropdownRef.value.contains(target);
  
  if (!isTrigger && !isDropdown) {
    close();
  }
}

function handleResize() {
  if (isOpen.value) updatePosition();
}

onMounted(() => {
  document.addEventListener('mousedown', handleGlobalClick);
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleResize, true);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleGlobalClick);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleResize, true);
});
</script>

<style scoped>
.base-select {
  position: relative;
  width: 100%;
  font-family: inherit;
}

.select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  user-select: none;
}

.select-trigger:hover {
  background: var(--md-sys-color-surface-variant-hover, rgba(0,0,0,0.08));
}

.select-trigger:focus, 
.select-trigger.is-open {
  border-color: var(--md-sys-color-primary);
  /* box-shadow: 0 0 0 2px var(--md-sys-color-secondary-container); */
}

.selected-label {
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-arrow {
  color: var(--md-sys-color-on-surface-variant);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.select-arrow.rotated {
  transform: rotate(180deg);
}

.options-list {
  position: fixed;
  /* top/left set by JS */
  max-height: 240px;
  overflow-y: auto;
  background: var(--md-sys-color-surface-container-high, #2b2b2b);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 9999;
  padding: 4px;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.option-item:hover,
.option-item:focus {
  background: var(--md-sys-color-surface-variant);
  outline: none;
}

.option-item.selected {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  font-weight: 500;
}

.check-icon {
  flex-shrink: 0;
  margin-left: 8px;
}

/* Scrollbar styles */
.options-list::-webkit-scrollbar {
  width: 6px;
}
.options-list::-webkit-scrollbar-thumb {
  background-color: var(--md-sys-color-outline);
  border-radius: 3px;
}

/* Transitions */
.select-fade-enter-active,
.select-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.select-fade-enter-from,
.select-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
