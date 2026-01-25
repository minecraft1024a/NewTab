<template>
  <label class="base-switch">
    <input 
      type="checkbox" 
      :checked="modelValue" 
      @change="$emit('update:modelValue', $event.target.checked)"
    >
    <span class="slider round">
        <span class="icon" v-if="modelValue">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </span>
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: Boolean
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.base-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 32px;
}

.base-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 32px;
  transition: .4s cubic-bezier(0.2, 0, 0, 1);
  border: 2px solid var(--md-sys-color-outline);
  box-sizing: border-box;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 6px;
  bottom: 6px;
  background-color: var(--md-sys-color-outline);
  transition: .4s cubic-bezier(0.2, 0, 0, 1);
  border-radius: 50%;
}

.slider .icon {
    position: absolute;
    right: 6px;
    top: 6px;
    height: 16px;
    width: 16px;
    color: var(--md-sys-color-on-primary);
    opacity: 0;
    transition: opacity 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}
.slider .icon svg {
    width: 12px;
    height: 12px;
}

input:checked + .slider {
  background-color: var(--md-sys-color-primary);
  border-color: var(--md-sys-color-primary);
}

input:checked + .slider:before {
  transform: translateX(20px);
  background-color: var(--md-sys-color-on-primary);
  width: 24px;
  height: 24px;
  bottom: 2px;
  left: 2px; /* Adjust for larger thumb */
}

input:checked + .slider .icon {
    opacity: 1;
    /* The icon logic here is a bit tricky with pseudo-elements, simpler to just have thumb color change */
}

/* Material 3 switch animation style adjustment */
input:checked + .slider:before {
    /* For M3, the thumb grows when checked */
    width: 24px;
    height: 24px;
    transform: translateX(20px);
    background-color: var(--md-sys-color-on-primary);
    bottom: 2px; 
    left: 2px;
}
input:not(:checked) + .slider:before {
    background-color: var(--md-sys-color-outline);
    width: 16px;
    height: 16px;
    bottom: 6px;
    left: 6px;
}
</style>
