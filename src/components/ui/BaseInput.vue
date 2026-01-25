<template>
  <div :class="['base-input-wrapper', { 'focused': isFocused }]">
    <div v-if="$slots.prepend" class="input-prepend">
      <slot name="prepend"></slot>
    </div>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="isFocused = true"
      @blur="isFocused = false"
      v-bind="$attrs"
      class="base-input-field"
    />
    <div v-if="$slots.append" class="input-append">
      <slot name="append"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  modelValue: [String, Number]
});

defineEmits(['update:modelValue']);

const isFocused = ref(false);
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--md-sys-color-surface-variant, #49454f);
  border-radius: 28px; /* Extra large for pill shape */
  padding: 4px 16px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  width: 100%;
  box-sizing: border-box;
}

.base-input-wrapper.focused {
  background-color: var(--md-sys-color-surface, #141218);
  border-color: var(--md-sys-color-primary, #d0bcff);
  box-shadow: 0 0 0 1px var(--md-sys-color-primary, #d0bcff);
}

.base-input-field {
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px 0;
  color: var(--md-sys-color-on-surface, #e6e1e5);
  font-size: 16px;
  outline: none;
  min-width: 0;
}

.base-input-field::placeholder {
  color: var(--md-sys-color-on-surface-variant, #cac4d0);
}

.input-prepend,
.input-append {
  display: flex;
  align-items: center;
  color: var(--md-sys-color-on-surface-variant);
}

.input-prepend {
  margin-right: 12px;
}

.input-append {
  margin-left: 12px;
}
</style>
