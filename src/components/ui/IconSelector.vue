<template>
  <div class="icon-selector">
    <div class="selector-header">
        <label>图标</label>
        <div class="tabs">
            <button 
                type="button"
                :class="{ active: !modelValue }" 
                @click="clearIcon"
            >
                网站图标
            </button>
            <button 
                type="button"
                :class="{ active: modelValue }" 
                @click="enableCustom"
            >
                自定义
            </button>
        </div>
    </div>

    <div v-if="modelValue" class="custom-icon-panel">
        <div class="input-wrapper">
             <BaseInput 
                :modelValue="modelValue" 
                @update:modelValue="updateIcon" 
                placeholder="例如: mdi:github" 
             />
             <div class="icon-preview" v-if="modelValue">
                <Icon :icon="modelValue" />
             </div>
        </div>
        
        <div class="presets">
            <div class="presets-label">常用图标:</div>
            <div class="presets-grid">
                <button 
                    v-for="icon in commonIcons" 
                    :key="icon"
                    class="preset-btn"
                    :class="{ active: modelValue === icon }"
                    @click="updateIcon(icon)"
                    type="button"
                    :title="icon"
                >
                    <Icon :icon="icon" />
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import BaseInput from './BaseInput.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const commonIcons = [
  'mdi:home', 'mdi:google', 'mdi:youtube', 'mdi:github', 
  'mdi:twitter', 'mdi:instagram', 'mdi:facebook', 'mdi:linkedin',
  'mdi:twitch', 'mdi:discord', 'mdi:reddit', 'mdi:spotify',
  'mdi:netflix', 'mdi:amazon', 'mdi:shopping', 'mdi:cart',
  'mdi:email', 'mdi:calendar', 'mdi:clock', 'mdi:map',
  'mdi:cloud', 'mdi:folder', 'mdi:file', 'mdi:cog',
  'mdi:code-tags', 'mdi:laptop', 'mdi:controller', 'mdi:school',
  'mdi:bank', 'mdi:chart-line'
];

function updateIcon(val) {
  emit('update:modelValue', val);
}

function clearIcon() {
  emit('update:modelValue', '');
}

function enableCustom() {
  if (!props.modelValue) {
    emit('update:modelValue', 'mdi:earth');
  }
}
</script>

<style scoped>
.icon-selector {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.selector-header label {
    font-size: 14px;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
}

.tabs {
    display: flex;
    background: var(--md-sys-color-surface-container-high);
    border-radius: 8px;
    padding: 2px;
    gap: 2px;
}

.tabs button {
    background: transparent;
    border: none;
    padding: 4px 12px;
    font-size: 12px;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
}

.tabs button.active {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
}

.custom-icon-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: var(--md-sys-color-surface-container);
    padding: 12px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.05);
}

.input-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;
}

.icon-preview {
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--md-sys-color-primary);
    width: 32px;
    height: 32px;
    background: rgba(255,255,255,0.05);
    border-radius: 4px;
}

.presets {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.presets-label {
    font-size: 11px;
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.7;
}

.presets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
    gap: 6px;
    max-height: 120px;
    overflow-y: auto;
    padding-right: 4px;
}

/* Custom scrollbar for presets */
.presets-grid::-webkit-scrollbar {
    width: 4px;
}
.presets-grid::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
}

.preset-btn {
    width: 32px;
    height: 32px;
    border: 1px solid transparent;
    background: rgba(255,255,255,0.03);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    transition: all 0.2s;
}

.preset-btn:hover {
    background: rgba(255,255,255,0.1);
    color: var(--md-sys-color-on-surface);
}

.preset-btn.active {
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    border-color: var(--md-sys-color-primary);
}
</style>
