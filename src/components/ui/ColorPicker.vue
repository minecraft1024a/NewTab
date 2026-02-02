<template>
  <div class="color-picker-wrapper" ref="wrapperRef">
    <!-- Trigger Button -->
    <div 
      ref="triggerRef"
      class="color-option custom-color" 
      :class="{ active: isActive }"
      @click="toggle"
      :style="customStyle"
    >
        <slot name="icon">
          <!-- Fallback icon if needed -->
        </slot>
    </div>

    <!-- Dropdown Panel -->
    <Teleport to="body">
      <transition name="pop">
        <div 
          v-if="isOpen" 
          ref="panelRef"
          class="color-picker-panel"
          :style="panelPosition"
          @mousedown.stop
        >
          <!-- Saturation/Brightness Area -->
          <div 
            class="saturation-area" 
            ref="saturationArea"
            @mousedown="handleSaturationDown"
            :style="{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }"
          >
            <div class="saturation-white"></div>
            <div class="saturation-black"></div>
            <div 
              class="saturation-pointer"
              :style="{ top: (1 - hsv.v) * 100 + '%', left: hsv.s * 100 + '%' }"
            ></div>
          </div>

          <!-- Hue Slider -->
          <div class="hue-slider-container">
            <div 
              class="hue-slider" 
              ref="hueSlider"
              @mousedown="handleHueDown"
            >
              <div 
                class="hue-pointer"
                :style="{ left: (hsv.h / 360) * 100 + '%' }"
              ></div>
            </div>
          </div>

          <!-- Inputs and Preview -->
          <div class="picker-controls">
            <div class="color-preview" :style="{ backgroundColor: modelValue }"></div>
            <div class="hex-input-wrapper">
              <span class="hash">#</span>
              <input 
                type="text" 
                class="hex-input" 
                :value="hexValue" 
                @input="handleHexInput"
                @blur="handleHexBlur"
                maxlength="6"
              />
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '#ffffff'
  },
  isActive: Boolean
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const wrapperRef = ref(null);
const triggerRef = ref(null);
const panelRef = ref(null);
const saturationArea = ref(null);
const hueSlider = ref(null);
const panelPosition = ref({ top: '0px', left: '0px' });

// HSV state
const hsv = ref({ h: 0, s: 0, v: 0 });

const customStyle = computed(() => {
    if (props.isActive) {
       return {};
    }
    return {};
});

const hexValue = computed(() => {
  return props.modelValue.replace('#', '');
});

function toggle() {
  isOpen.value = !isOpen.value;
  if(isOpen.value) {
      updateHsvFromHex(props.modelValue);
      nextTick(() => {
        updatePosition();
      });
  }
}

function close() {
  isOpen.value = false;
}

function updatePosition() {
  if (!triggerRef.value || !panelRef.value) return;
  
  const rect = triggerRef.value.getBoundingClientRect();
  const panelRect = panelRef.value.getBoundingClientRect();
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Calculate potential positions
  // Default: align right edges, place below
  let left = rect.right - panelRect.width;
  let top = rect.bottom + 8; // 8px spacing
  
  // Check horizontal overflow (left side)
  if (left < 10) {
    // If it goes off left, align left edges instead
    left = rect.left;
  }
  
  // Check vertical overflow (bottom)
  if (top + panelRect.height > screenHeight - 10) {
    // If it fits above, put it above
    if (rect.top - panelRect.height - 8 > 0) {
      top = rect.top - panelRect.height - 8;
    }
  }

  panelPosition.value = {
    top: `${top}px`,
    left: `${left}px`,
    position: 'fixed'
  };
}

// Global click handler to replace v-click-outside since we teleported
function handleGlobalClick(event) {
  if (!isOpen.value) return;
  
  const target = event.target;
  const isClickInsideTrigger = triggerRef.value && triggerRef.value.contains(target);
  const isClickInsidePanel = panelRef.value && panelRef.value.contains(target);
  
  if (!isClickInsideTrigger && !isClickInsidePanel) {
    close();
  }
}

// Window resize handler
function handleResize() {
  if (isOpen.value) {
    updatePosition();
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleGlobalClick);
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleResize, true); // Capture scroll to update position
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleGlobalClick);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleResize, true);
});

// Color Utility Functions
function hexToRgb(hex) {

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
}

function hsvToRgb(h, s, v) {
  let r, g, b;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function updateModelValue() {
  const { r, g, b } = hsvToRgb(hsv.value.h, hsv.value.s, hsv.value.v);
  const hex = rgbToHex(r, g, b);
  emit('update:modelValue', hex);
  emit('change', hex);
}

function updateHsvFromHex(hex) {
    const rgb = hexToRgb(hex);
    if(rgb) {
        hsv.value = rgbToHsv(rgb.r, rgb.g, rgb.b);
    }
}

// Interaction Handlers
function handleSaturationDown(e) {
  e.preventDefault();
  window.addEventListener('mousemove', handleSaturationMove);
  window.addEventListener('mouseup', handleSaturationUp);
  handleSaturationMove(e);
}

function handleSaturationMove(e) {
  const rect = saturationArea.value.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  
  x = Math.max(0, Math.min(x, rect.width));
  y = Math.max(0, Math.min(y, rect.height));

  hsv.value.s = x / rect.width;
  hsv.value.v = 1 - (y / rect.height);
  
  updateModelValue();
}

function handleSaturationUp() {
  window.removeEventListener('mousemove', handleSaturationMove);
  window.removeEventListener('mouseup', handleSaturationUp);
}

function handleHueDown(e) {
  e.preventDefault();
  window.addEventListener('mousemove', handleHueMove);
  window.addEventListener('mouseup', handleHueUp);
  handleHueMove(e);
}

function handleHueMove(e) {
  const rect = hueSlider.value.getBoundingClientRect();
  let x = e.clientX - rect.left;
  x = Math.max(0, Math.min(x, rect.width));
  
  hsv.value.h = (x / rect.width) * 360;
  
  updateModelValue();
}

function handleHueUp() {
  window.removeEventListener('mousemove', handleHueMove);
  window.removeEventListener('mouseup', handleHueUp);
}

function handleHexInput(e) {
    let val = e.target.value;
    if(val.length >= 6) {
        if(!val.startsWith('#')) val = '#' + val;
        // Basic validation
        if(/^#[0-9A-Fa-f]{6}$/.test(val)) {
            emit('update:modelValue', val);
            updateHsvFromHex(val);
        }
    }
}

function handleHexBlur(e) {
    // Reset to prop value if invalid
    e.target.value = props.modelValue.replace('#', '');
}

watch(() => props.modelValue, (newVal) => {
    // If not dragging (simplistic check to avoid jitter? actually w/ hsv state we should update if external change)
    if(!isOpen.value) {
        updateHsvFromHex(newVal);
    }
}, { immediate: true });


// v-click-outside replaced by global listener
</script>

<style scoped>
.color-picker-wrapper {
  position: relative;
  display: inline-block;
}

.color-option {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  box-shadow: var(--md-sys-elevation-level1);
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: var(--md-sys-elevation-level2);
}

.color-option.active {
  border-color: var(--md-sys-color-on-surface);
  transform: scale(1.1);
}

.custom-color {
  background: linear-gradient(135deg, 
    #ff0000 0%, #ff7f00 16.67%, #ffff00 33.33%, 
    #00ff00 50%, #0000ff 66.67%, #4b0082 83.33%, #9400d3 100%);
  color: #fff;
}

.color-picker-panel {
  position: fixed;
  /* top/left set via JS style */
  width: 240px;
  background: var(--md-sys-color-surface-container-high);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  z-index: 9999;
  padding: 12px;
  user-select: none;
}

/* Saturation Box */
.saturation-area {
  width: 100%;
  height: 150px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: crosshair;
  margin-bottom: 12px;
}

.saturation-white {
  background: linear-gradient(to right, #fff, rgba(255,255,255,0));
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
}

.saturation-black {
  background: linear-gradient(to top, #000, rgba(0,0,0,0));
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
}

.saturation-pointer {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 2px rgba(0,0,0,0.5);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* Hue Slider */
.hue-slider-container {
  height: 16px;
  margin-bottom: 12px;
  position: relative;
}

.hue-slider {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(to right, 
    #f00 0%, #ff0 17%, #0f0 33%, 
    #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
  position: relative;
  cursor: pointer;
}

.hue-pointer {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 0 2px rgba(0,0,0,0.5);
  transform: translateX(-50%);
  pointer-events: none;
  height: 100%;
}

/* Input Row */
.picker-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-preview {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--md-sys-color-outline-variant);
  flex-shrink: 0;
}

.hex-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--md-sys-color-surface-variant);
  border-radius: 8px;
  padding: 0 8px;
  border: 1px solid transparent;
  transition: border 0.2s;
}

.hex-input-wrapper:focus-within {
  border-color: var(--md-sys-color-primary);
}

.hash {
  color: var(--md-sys-color-on-surface-variant);
  font-family: monospace;
}

.hex-input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--md-sys-color-on-surface);
  font-family: monospace;
  font-size: 14px;
  padding: 6px 4px;
  outline: none;
  text-transform: uppercase;
}

/* Transitions */
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
