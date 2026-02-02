<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-backdrop" @click.self="close">
        <div class="modal-container" role="dialog" aria-modal="true">
          <header v-if="title || $slots.header" class="modal-header">
            <slot name="header">
              <h3>{{ title }}</h3>
              <button class="close-btn" @click="close">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                </svg>
              </button>
            </slot>
          </header>
          
          <div class="modal-content">
            <slot></slot>
          </div>
          
          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  title: String
});
const emit = defineEmits(['close']);
const close = () => emit('close');
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-container {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-radius: 28px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--md-sys-elevation-level3);
  position: relative;
  overflow: hidden;
}

.modal-header {
  padding: 24px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 400;
  color: var(--md-sys-color-on-surface);
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant);
  border-radius: 50%;
  padding: 8px;
  display: flex;
}
.close-btn:hover {
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface);
}

.modal-content {
  padding: 0 24px 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container {
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
}
.modal-leave-active .modal-container {
   transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.modal-enter-from .modal-container {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
.modal-leave-to .modal-container {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
