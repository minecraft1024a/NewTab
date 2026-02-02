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
                v-model="searchQuery" 
                placeholder="搜索图标名称..." 
             />
             <div class="icon-preview" v-if="modelValue">
                <Icon :icon="modelValue" :color="iconColor" />
             </div>
        </div>
        
        <div class="presets">
            <div class="presets-header">
              <div class="presets-label">
                {{ searchQuery ? `找到 ${filteredIcons.length} 个图标` : (showAllIcons ? `所有图标 (共 ${allIconsData.length} 个)` : '常用图标') }}
              </div>
              <div class="view-toggle" v-if="!searchQuery">
                <button 
                  type="button"
                  :class="{ active: !showAllIcons }"
                  @click="showAllIcons = false"
                >
                  常用
                </button>
                <button 
                  type="button"
                  :class="{ active: showAllIcons }"
                  @click="handleShowAll"
                >
                  全部
                </button>
              </div>
            </div>
            
            <div class="presets-grid">
                <button 
                    v-for="icon in displayIcons" 
                    :key="icon.name"
                    class="preset-btn"
                    :class="{ active: modelValue === icon.name }"
                    @click="updateIcon(icon.name)"
                    type="button"
                    :title="icon.label"
                >
                    <Icon :icon="icon.name" :color="iconColor" />
                </button>
            </div>
            
            <!-- 分页控制 -->
            <div class="pagination" v-if="(showAllIcons && !searchQuery) || (searchQuery && filteredIcons.length > 100)">
              <button 
                type="button"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                上一页
              </button>
              <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
              <button 
                type="button"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                下一页
              </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import BaseInput from './BaseInput.vue';
import { getAllIcons, searchIcons, commonIcons as presetIcons } from '@/data/mdi-icons.js';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const searchQuery = ref('');
const showAllIcons = ref(false);
const currentPage = ref(1);
const pageSize = 100;
const useThemeColor = ref(true);

const iconColor = computed(() => {
    return useThemeColor.value ? 'var(--md-sys-color-primary)' : 'currentColor';
});

// 所有图标数据
const allIconsData = getAllIcons();

// 常用图标转换为对象格式
const commonIconsList = presetIcons.map(name => ({
  name,
  label: name.replace(/^[^:]+:/, '')
}));

// 过滤后的图标
const filteredIcons = computed(() => {
  if (searchQuery.value) {
    return searchIcons(searchQuery.value);
  }
  return showAllIcons.value ? allIconsData : commonIconsList;
});

// 总页数
const totalPages = computed(() => {
  const total = filteredIcons.value.length;
  if (searchQuery.value || showAllIcons.value) {
    return Math.ceil(total / pageSize);
  }
  return 1;
});

// 当前页显示的图标
const displayIcons = computed(() => {
  const icons = filteredIcons.value;
  
  // 如果是常用图标且没有搜索，显示全部
  if (!searchQuery.value && !showAllIcons.value) {
    return icons;
  }
  
  // 否则进行分页
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return icons.slice(start, end);
});

// 监听搜索或视图切换，重置页码
watch([searchQuery, showAllIcons], () => {
  currentPage.value = 1;
});

function updateIcon(val) {
  emit('update:modelValue', val);
}

function clearIcon() {
  emit('update:modelValue', '');
  searchQuery.value = '';
  showAllIcons.value = false;
  currentPage.value = 1;
}

function enableCustom() {
  if (!props.modelValue) {
    emit('update:modelValue', 'mdi:earth');
  }
}

function handleShowAll() {
  showAllIcons.value = true;
  currentPage.value = 1;
}

function loadIconColorSetting() {
  const saved = localStorage.getItem('appSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    useThemeColor.value = settings.useThemeColorForIcons !== false;
  }
}

onMounted(() => {
  loadIconColorSetting();
  window.addEventListener('icon-color-changed', loadIconColorSetting);
});

onUnmounted(() => {
  window.removeEventListener('icon-color-changed', loadIconColorSetting);
});
</script>

<style scoped>
.icon-selector {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.selector-header label {
    font-size: 14px;
    font-weight: 600;
    color: var(--md-sys-color-on-surface);
    letter-spacing: 0.1px;
}

.tabs {
    display: flex;
    background: var(--md-sys-color-surface-container-high);
    border-radius: 10px;
    padding: 3px;
    gap: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tabs button {
    background: transparent;
    border: none;
    padding: 6px 16px;
    font-size: 13px;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

.tabs button:hover:not(.active) {
    background: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface);
}

.tabs button.active {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
}

.custom-icon-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--md-sys-color-surface-container-low);
    padding: 16px;
    border-radius: 12px;
    border: 1px solid var(--md-sys-color-outline-variant);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.input-wrapper {
    display: flex;
    gap: 12px;
    align-items: center;
}

.icon-preview {
    font-size: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--md-sys-color-primary);
    width: 48px;
    height: 48px;
    background: var(--md-sys-color-primary-container);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: iconPulse 0.5s ease-out;
}

@keyframes iconPulse {
    0% {
        transform: scale(0.9);
        opacity: 0;
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.icon-preview:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.presets {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.presets-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2px;
}

.presets-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--md-sys-color-primary);
    opacity: 0.9;
    letter-spacing: 0.5px;
}

.view-toggle {
    display: flex;
    background: var(--md-sys-color-surface-container-high);
    border-radius: 8px;
    padding: 3px;
    gap: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.view-toggle button {
    background: transparent;
    border: none;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-toggle button:hover:not(.active) {
    background: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface);
}

.view-toggle button.active {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.presets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
    gap: 8px;
    max-height: 260px;
    overflow-y: auto;
    padding: 4px;
    margin: -4px;
}

/* Custom scrollbar for presets */
.presets-grid::-webkit-scrollbar {
    width: 6px;
}
.presets-grid::-webkit-scrollbar-track {
    background: var(--md-sys-color-surface-container);
    border-radius: 3px;
}
.presets-grid::-webkit-scrollbar-thumb {
    background: var(--md-sys-color-primary);
    border-radius: 3px;
    opacity: 0.6;
}
.presets-grid::-webkit-scrollbar-thumb:hover {
    background: var(--md-sys-color-primary);
    opacity: 1;
}

.preset-btn {
    width: 36px;
    height: 36px;
    border: 2px solid transparent;
    background: var(--md-sys-color-surface-container-high);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.preset-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--md-sys-color-primary);
    opacity: 0;
    transition: opacity 0.25s;
}

.preset-btn:hover {
    background: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preset-btn:hover::before {
    opacity: 0.08;
}

.preset-btn.active {
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-primary);
    border-color: var(--md-sys-color-primary);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    transform: scale(1.05);
}

.preset-btn.active::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--md-sys-color-primary) 0%, transparent 100%);
    opacity: 0.1;
    pointer-events: none;
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding-top: 12px;
    margin-top: 4px;
    border-top: 1px solid var(--md-sys-color-outline-variant);
}

.pagination button {
    background: var(--md-sys-color-surface-container-high);
    border: none;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.pagination button:hover:not(:disabled) {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pagination button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.pagination button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
}

.page-info {
    font-size: 13px;
    font-weight: 500;
    color: var(--md-sys-color-primary);
    min-width: 70px;
    text-align: center;
    padding: 4px 8px;
    background: var(--md-sys-color-primary-container);
    border-radius: 6px;
}
</style>
