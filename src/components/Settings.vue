<template>
  <BaseModal :isOpen="isOpen" title="设置" @close="close">
    <div class="settings-content">
      <!-- 主题设置 -->
      <section class="settings-section">
        <h3>主题</h3>
        
        <div class="setting-item">
          <label class="setting-label-text">主题模式</label>
          <div class="theme-options">
            <BaseButton 
              v-for="mode in themeModes" 
              :key="mode.value"
              :variant="settings.themeMode === mode.value ? 'primary' : 'tonal'"
              class="theme-btn-flex"
              @click="updateThemeMode(mode.value)"
            >
              {{ mode.label }}
            </BaseButton>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label-text">主题色</label>
          <div class="color-options">
            <div 
              v-for="color in presetColors" 
              :key="color.name"
              :class="['color-option', { active: settings.themeColor === color.name }]"
              :style="{ backgroundColor: color.value }"
              @click="updateThemeColor(color.name, color.value)"
              :title="color.label"
            >
              <svg v-if="settings.themeColor === color.name" viewBox="0 0 24 24" width="20" height="20" fill="white">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <ColorPicker
              v-model="customColor"
              :isActive="settings.themeColor === 'custom'"
              @change="updateCustomColor"
            >
              <template #icon>
                <svg v-if="settings.themeColor === 'custom'" viewBox="0 0 24 24" width="20" height="20" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0 1 12 22zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 0 0-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 0 1 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"/><circle cx="6.5" cy="11.5" r="1.5"/><circle cx="9.5" cy="7.5" r="1.5"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"/>
                </svg>
              </template>
            </ColorPicker>
          </div>
        </div>

        <div class="setting-item row-space-between">
          <div class="setting-text">
            <label class="setting-label-text">自动提取颜色</label>
            <p class="setting-description">更换壁纸时自动提取主色调作为主题色</p>
          </div>
          <BaseSwitch 
            v-model="settings.autoExtractColor"
            @update:modelValue="updateAutoExtractColor"
          />
        </div>
      </section>

      <!-- 搜索引擎设置 -->
      <section class="settings-section">
        <h3>搜索</h3>
        <div class="setting-item">
          <label class="setting-label-text">默认搜索引擎</label>
          <BaseSelect
            v-model="settings.defaultEngine"
            :options="searchEngines"
            @change="updateDefaultEngine"
          />
        </div>
      </section>

      <!-- 关于 -->
      <section class="settings-section">
        <h3>关于</h3>
        <p class="about-text">NewTab - 自定义浏览器标签页</p>
        <p class="about-text version">版本 1.0.0</p>
      </section>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import BaseModal from './ui/BaseModal.vue';
import BaseButton from './ui/BaseButton.vue';
import BaseSwitch from './ui/BaseSwitch.vue';
import BaseSelect from './ui/BaseSelect.vue';
import ColorPicker from './ui/ColorPicker.vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'theme-change']);

const customColor = ref('#6750A4');

const themeModes = [
  { value: 'auto', label: '自动' },
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' }
];

const searchEngines = [
  { label: 'Google', value: '0' },
  { label: 'Bing', value: '1' },
  { label: 'Baidu', value: '2' }
];

const presetColors = [
  { name: 'purple', label: '紫色', value: '#6750A4' },
  { name: 'blue', label: '蓝色', value: '#1976D2' },
  { name: 'green', label: '绿色', value: '#388E3C' },
  { name: 'orange', label: '橙色', value: '#F57C00' },
  { name: 'red', label: '红色', value: '#D32F2F' },
  { name: 'pink', label: '粉色', value: '#C2185B' },
  { name: 'teal', label: '青色', value: '#00796B' },
  { name: 'extracted', label: '提取颜色', value: '#6750A4' }
];

const settings = ref({
  themeMode: 'auto',
  themeColor: 'purple',
  autoExtractColor: true,
  defaultEngine: '0'
});

function loadSettings() {
  const saved = localStorage.getItem('appSettings');
  if (saved) {
    Object.assign(settings.value, JSON.parse(saved));
  }
  
  // 加载自定义颜色
  const savedCustomColor = localStorage.getItem('customThemeColor');
  if (savedCustomColor) {
    customColor.value = savedCustomColor;
  }
  
  // 加载提取的颜色
  const extractedColor = localStorage.getItem('extractedThemeColor');
  if (extractedColor) {
    const extracted = presetColors.find(c => c.name === 'extracted');
    if (extracted) {
      extracted.value = extractedColor;
    }
  }
}

function saveSettings() {
  localStorage.setItem('appSettings', JSON.stringify(settings.value));
  emit('theme-change', settings.value);
}

function updateThemeMode(mode) {
  settings.value.themeMode = mode;
  saveSettings();
  applyThemeMode();
}

function applyThemeMode() {
  const root = document.documentElement;
  const isDark = settings.value.themeMode === 'dark' || 
                 (settings.value.themeMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // 切换主题类
  if (isDark) {
    root.classList.remove('theme-light');
  } else {
    root.classList.add('theme-light');
  }
  
  // 重新应用当前主题色
  const currentColor = settings.value.themeColor === 'custom' ? customColor.value : 
                      presetColors.find(c => c.name === settings.value.themeColor)?.value || '#6750A4';
  applyThemeColor(currentColor);
}

function updateThemeColor(name, color) {
  settings.value.themeColor = name;
  saveSettings();
  applyThemeColor(color);
}

function updateCustomColor() {
  settings.value.themeColor = 'custom';
  localStorage.setItem('customThemeColor', customColor.value);
  saveSettings();
  applyThemeColor(customColor.value);
}

function updateAutoExtractColor() {
  // Fix boolean issue if it comes as event
  // v-model handles it, but just in case logic needs it
  saveSettings();
}

function updateDefaultEngine() {
  localStorage.setItem('defaultEngine', settings.value.defaultEngine);
  saveSettings();
  window.dispatchEvent(new CustomEvent('engine-changed'));
}

function applyThemeColor(colorValue) {
  // 解析RGB值
  const hex = colorValue.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const root = document.documentElement;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const isDark = settings.value.themeMode === 'dark' || 
                 (settings.value.themeMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  root.style.setProperty('--md-sys-color-primary', colorValue);
  root.style.setProperty('--md-sys-color-on-primary', brightness > 128 ? '#000000' : '#ffffff');
  
  // 生成容器颜色
  const containerR = Math.min(255, r + (isDark ? 60 : -60));
  const containerG = Math.min(255, g + (isDark ? 60 : -60));
  const containerB = Math.min(255, b + (isDark ? 60 : -60));
  root.style.setProperty('--md-sys-color-primary-container', `rgb(${containerR}, ${containerG}, ${containerB})`);
  
  root.style.setProperty('--md-sys-color-secondary-container', `rgba(${r}, ${g}, ${b}, 0.3)`);
  
  // 应用明暗模式
  root.style.setProperty('--md-sys-color-surface', isDark ? '#1e1e1e' : '#ffffff');
  root.style.setProperty('--md-sys-color-surface-variant', isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)');
  root.style.setProperty('--md-sys-color-on-surface', isDark ? '#e0e0e0' : '#1c1c1c');
  root.style.setProperty('--md-sys-color-on-surface-variant', isDark ? '#c0c0c0' : '#5f5f5f');
  root.style.setProperty('--md-sys-color-outline', isDark ? '#757575' : '#c0c0c0');
}

function close() {
  emit('close');
}

// 监听系统主题变化
watch(() => settings.value.themeMode, () => {
  applyThemeMode();
});

// 监听系统偏好变化
if (window.matchMedia) {
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeQuery.addEventListener('change', () => {
    if (settings.value.themeMode === 'auto') {
      applyThemeMode();
    }
  });
}

onMounted(() => {
  loadSettings();
  
  // 应用初始主题模式和颜色
  applyThemeMode();
});

defineExpose({ loadSettings, settings, applyThemeColor, applyThemeMode, presetColors });
</script>

<style scoped>
/* Settings specific styles */
.settings-content {
  padding-bottom: 24px;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--md-sys-color-primary);
}

.setting-item {
  margin-bottom: 24px;
}

.row-space-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.setting-label-text {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
  font-size: 16px;
  color: var(--md-sys-color-on-surface);
}

.setting-description {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: var(--md-sys-color-on-surface-variant);
}

.theme-options {
  display: flex;
  gap: 12px;
}

.theme-btn-flex {
    flex: 1;
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
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

.about-text {
  margin: 8px 0;
  color: var(--md-sys-color-on-surface-variant);
}

.version {
  font-size: 13px;
  opacity: 0.7;
}
</style>
