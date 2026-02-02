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
                <Icon :icon="modelValue" />
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
                    <Icon :icon="icon.name" />
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
import { ref, computed, watch } from 'vue';
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
    background: var(--md-sys-color-surface);
    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--md-sys-color-outline-variant);
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
    background: var(--md-sys-color-surface-container-highest);
    border-radius: 4px;
}

.presets {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.presets-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.presets-label {
    font-size: 11px;
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.7;
}

.view-toggle {
    display: flex;
    background: var(--md-sys-color-surface-container-high);
    border-radius: 6px;
    padding: 2px;
    gap: 2px;
}

.view-toggle button {
    background: transparent;
    border: none;
    padding: 3px 10px;
    font-size: 11px;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
}

.view-toggle button.active {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
}

.presets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
    gap: 6px;
    max-height: 240px;
    overflow-y: auto;
    padding-right: 4px;
}

/* Custom scrollbar for presets */
.presets-grid::-webkit-scrollbar {
    width: 4px;
}
.presets-grid::-webkit-scrollbar-thumb {
    background: var(--md-sys-color-outline-variant);
    border-radius: 2px;
}

.preset-btn {
    width: 32px;
    height: 32px;
    border: 1px solid transparent;
    background: var(--md-sys-color-surface-container-high);
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
    background: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface);
}

.preset-btn.active {
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    border-color: var(--md-sys-color-primary);
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding-top: 8px;
    border-top: 1px solid var(--md-sys-color-outline-variant);
}

.pagination button {
    background: var(--md-sys-color-surface-container-high);
    border: none;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
}

.pagination button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.page-info {
    font-size: 12px;
    color: var(--md-sys-color-on-surface-variant);
    min-width: 60px;
    text-align: center;
}
</style>
