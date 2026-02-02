<template>
  <div class="search-widget animate-fade-in" v-click-outside="closeSuggestions">
    <!-- Engine Logo -->
    <div class="engine-selector" @click="rotateEngine">
      <Icon :icon="currentEngine.icon" class="engine-logo" width="48" height="48" :color="iconColor" />
    </div>

    <!-- Search Input -->
    <div class="search-bar-container" :class="{ 'has-suggestions': showSuggestions }">
      <BaseInput
        v-model="query"
        type="text"
        :placeholder="`使用 ${currentEngine.name} 搜索...`"
        @keydown.enter.stop="handleEnter"
        @keydown.up.prevent.stop="navigateSuggestions(-1)"
        @keydown.down.prevent.stop="navigateSuggestions(1)"
        @keydown.esc.stop="closeSuggestions"
        @focus="handleFocus"
        autofocus
        class="custom-search-input"
        spellcheck="false"
      >
        <template #append>
           <button class="icon-btn search-icon-btn" @click="performSearch" title="搜索">
              <Icon icon="mdi:magnify" width="24" height="24" :color="iconColor" />
           </button>
        </template>
      </BaseInput>

      <!-- Suggestions Dropdown -->
      <transition name="dropdown-slide">
        <div v-if="showSuggestions" class="suggestions-dropdown">
           <div 
               v-for="(item, index) in suggestions" 
               :key="index" 
               class="suggestion-item"
               :class="{ active: index === activeSuggestionIndex }"
               @click="selectSuggestion(item)"
               @mouseenter="activeSuggestionIndex = index"
           >
               <Icon icon="mdi:magnify" class="suggestion-icon" width="20" height="20" :color="iconColor" />
               <span class="suggestion-text">{{ item }}</span>
           </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import BaseInput from './ui/BaseInput.vue';
import { Icon } from '@iconify/vue';

// Custom Directive: v-click-outside
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};

const query = ref('');
const engineIndex = ref(0);
const suggestions = ref([]);
const activeSuggestionIndex = ref(-1);
const isFocused = ref(false);
const useThemeColor = ref(true);
let debounceTimer = null;

const showSuggestions = computed(() => {
    return isFocused.value && suggestions.value.length > 0;
});

const iconColor = computed(() => {
    return useThemeColor.value ? 'var(--md-sys-color-primary)' : 'currentColor';
});

// 搜索引擎配置，使用 MDI 图标
const engines = [
  {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: 'mdi:google'
  },
  {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: 'mdi:microsoft-bing'
  },
  {
    name: 'Baidu',
    url: 'https://www.baidu.com/s?wd=',
    icon: 'mdi:paw' // MDI没有百度图标，使用熊掌代表百度
  }
];

const currentEngine = computed(() => engines[engineIndex.value]);

function rotateEngine() {
  engineIndex.value = (engineIndex.value + 1) % engines.length;
}

function performSearch() {
  if (!query.value.trim()) return;
  window.location.href = currentEngine.value.url + encodeURIComponent(query.value);
}

function handleEnter() {
  if (activeSuggestionIndex.value >= 0 && activeSuggestionIndex.value < suggestions.value.length) {
    query.value = suggestions.value[activeSuggestionIndex.value];
    performSearch();
  } else {
    performSearch();
  }
}

function selectSuggestion(item) {
  query.value = item;
  performSearch();
}

function navigateSuggestions(step) {
  if (!suggestions.value.length) return;
  activeSuggestionIndex.value += step;
  if (activeSuggestionIndex.value < -1) activeSuggestionIndex.value = suggestions.value.length - 1;
  if (activeSuggestionIndex.value >= suggestions.value.length) activeSuggestionIndex.value = -1;
  
  // Optionally update query preview in input
  if (activeSuggestionIndex.value !== -1) {
      // query.value = suggestions.value[activeSuggestionIndex.value]; // This might be annoying if user wants to keep typing
  }
}

function closeSuggestions() {
    isFocused.value = false;
    activeSuggestionIndex.value = -1;
}

function handleFocus() {
    isFocused.value = true;
    if (query.value && suggestions.value.length === 0) {
        fetchSuggestions(query.value);
    }
}

async function fetchSuggestions(text) {
    if (!text || !text.trim()) {
        suggestions.value = [];
        return;
    }

    try {
        // 使用 CORS 代理来访问 Bing API
        // 由于 Chrome Extension 可以跨域请求，我们直接使用 fetch
        const url = `https://api.bing.com/qsonhs.aspx?type=cb&q=${encodeURIComponent(text)}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': '*/*'
            }
        });
        
        const text_data = await response.text();
        console.log('Bing Suggestion Response:', text_data);
        
        // 解析 JSONP 响应 
        // Bing 返回格式类似: if(typeof callback === 'function') callback({...});
        // 我们需要提取大括号内的 JSON
        const jsonMatch = text_data.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            
            if (data && data.AS && data.AS.Results && data.AS.Results.length > 0) {
                suggestions.value = data.AS.Results[0].Suggests.map(s => s.Txt);
            } else {
                suggestions.value = [];
            }
        } else {
            suggestions.value = [];
        }
    } catch (e) {
        console.error('Failed to fetch suggestions:', e);
        suggestions.value = [];
    }
}

watch(query, (newVal) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        fetchSuggestions(newVal);
    }, 200);
});

function loadEngine() {
  const saved = localStorage.getItem('defaultEngine');
  if (saved !== null) {
    engineIndex.value = parseInt(saved, 10) % engines.length;
  }
}

function loadIconColorSetting() {
  const saved = localStorage.getItem('appSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    useThemeColor.value = settings.useThemeColorForIcons !== false;
  }
}

onMounted(() => {
  loadEngine();
  loadIconColorSetting();
  window.addEventListener('engine-changed', loadEngine);
  window.addEventListener('icon-color-changed', loadIconColorSetting);
});

onUnmounted(() => {
  window.removeEventListener('engine-changed', loadEngine);
  window.removeEventListener('icon-color-changed', loadIconColorSetting);
});
</script>

<style scoped>
.search-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  z-index: 10;
  position: relative; /* Context for absolute dropdown */
}

.engine-selector {
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.2, 0, 0 , 1);
  padding: 12px;
  border-radius: 50%;
  background: var(--md-sys-color-surface-variant);
  box-shadow: var(--md-sys-elevation-level1);
}

.engine-selector:hover {
  transform: scale(1.1);
  background: var(--md-sys-color-surface);
}

.engine-logo svg {
  display: block;
}

.search-bar-container {
  width: 100%;
  position: relative;
  box-shadow: var(--md-sys-elevation-level2);
  border-radius: 28px;
  background: var(--md-sys-color-surface);
  transition: border-radius 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.search-bar-container.has-suggestions {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  box-shadow: var(--md-sys-elevation-level3);
}

.search-bar-container.has-suggestions :deep(.base-input-wrapper) {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.search-bar-container.has-suggestions :deep(.base-input-wrapper.focused) {
  box-shadow: none;
  border: 2px solid var(--md-sys-color-primary);
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  padding: 7px 15px 8px 23px;
}
/* Override BaseInput generic styles for the specific search bar needs */
:deep(.base-input-wrapper) {
   padding: 8px 24px 8px 24px;
   background: var(--md-sys-color-surface);
   border-radius: 28px;
   transition: box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1), border-radius 0.2s cubic-bezier(0.2, 0, 0, 1);
   position: relative;
   z-index: 25;
}

:deep(.base-input-wrapper.focused) {
    box-shadow: var(--md-sys-elevation-level3);
    background-color: var(--md-sys-color-surface);
    border: 2px solid var(--md-sys-color-primary);
    padding: 7px 23px 7px 23px;
}

:deep(.base-input-field) {
    font-size: 18px;
    padding: 12px 0;
}

.search-icon-btn {
  background: none;
  border: none;
  color: var(--md-sys-color-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
}

.search-icon-btn:hover {
    background-color: var(--md-sys-color-surface-variant);
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0;
  background-color: var(--md-sys-color-surface, #1e1e1e);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
  box-shadow: var(--md-sys-elevation-level3);
  overflow: hidden;
  z-index: 20;
  padding: 0;
  border: 2px solid var(--md-sys-color-primary);
  border-top: none;
  box-sizing: border-box;
}

.suggestion-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--md-sys-color-on-surface, #e3e3e3);
}

.suggestion-item:hover, .suggestion-item.active {
  background-color: var(--md-sys-color-surface-container-high, rgba(255, 255, 255, 0.1));
}

.suggestion-icon {
  color: var(--md-sys-color-on-surface-variant, #c4c4c4);
  opacity: 0.7;
}

.suggestion-text {
  font-size: 16px;
  line-height: 24px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-slide-enter-from,
.dropdown-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
