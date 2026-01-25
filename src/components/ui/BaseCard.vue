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
  background-color: var(--md-sys-color-surface-container, rgba(40, 40, 40, 0.6)); /* slightly translucent */
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--md-sys-elevation-level1);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.interactive {
  cursor: pointer;
}

.interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--md-sys-elevation-level2);
  background-color: var(--md-sys-color-surface-container-high, rgba(50, 50, 50, 0.7));
}
</style>
