<template>
  <div :class="['base-card', { 'interactive': interactive }]" @click="$emit('click', $event)">
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  interactive: Boolean
});
defineEmits(['click']);
</script>

<style scoped>
.base-card {
  background-color: color-mix(in srgb, var(--md-sys-color-surface-container), transparent 40%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--md-sys-elevation-level1);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  border: 1px solid var(--md-sys-color-outline-variant);
}

.interactive {
  cursor: pointer;
}

.interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--md-sys-elevation-level2);
  background-color: color-mix(in srgb, var(--md-sys-color-surface-container-high), transparent 40%);
}
</style>
