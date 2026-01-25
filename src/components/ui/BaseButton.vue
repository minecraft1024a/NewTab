<template>
  <button 
    :class="['base-btn', `btn-${variant}`, { 'icon-only': iconOnly }]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot name="icon">
      <component :is="icon" v-if="icon" class="btn-icon" />
    </slot>
    <span v-if="$slots.default" class="btn-content">
        <slot></slot>
    </span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'text', 'error', 'tonal'].includes(value)
  },
  disabled: Boolean,
  icon: Object, // Component or SVG string handling might require more logic, assuming slot for now mostly
  iconOnly: Boolean
});
defineEmits(['click']);
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  gap: 8px;
  position: relative;
  overflow: hidden;
  height: 40px;
}

/* Ripple effect could be added here later */

.base-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Primary */
.btn-primary {
  background-color: var(--md-sys-color-primary, #d0bcff);
  color: var(--md-sys-color-on-primary, #381e72);
  box-shadow: var(--md-sys-elevation-level1);
}
.btn-primary:hover {
  box-shadow: var(--md-sys-elevation-level2);
  background-image: linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08));
}

/* Secondary */
.btn-secondary {
  background-color: var(--md-sys-color-secondary-container, #4a4458);
  color: var(--md-sys-color-on-secondary-container, #e8def8);
}
.btn-secondary:hover {
    box-shadow: var(--md-sys-elevation-level1);
    background-image: linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08));
}

/* Tonal */
.btn-tonal {
    background-color: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
}

/* Text */
.btn-text {
  background-color: transparent;
  color: var(--md-sys-color-primary, #d0bcff);
  padding: 10px 12px;
}
.btn-text:hover {
  background-color: var(--md-sys-color-surface-variant); /* Low opacity */
  background-color: rgba(208, 188, 255, 0.08); /* Fallback/Approx */
}

/* Icon Only */
.icon-only {
  padding: 0;
  width: 40px;
  border-radius: 20px; /* Circle */
}

.btn-icon {
    width: 18px;
    height: 18px;
    fill: currentColor;
}
</style>
