<template>
  <div class="search-widget animate-fade-in" v-click-outside="closeSuggestions">
    <!-- Engine Logo -->
    <div class="engine-selector" @click="rotateEngine">
      <div v-html="currentEngine.svg" class="engine-logo"></div>
    </div>

    <!-- Search Input -->
    <div class="search-bar-container" :class="{ 'has-suggestions': showSuggestions }">
      <BaseInput
        v-model="query"
        type="text"
        :placeholder="`使用 ${currentEngine.name} 搜索...`"
        @keydown.enter="handleEnter"
        @keydown.up.prevent="navigateSuggestions(-1)"
        @keydown.down.prevent="navigateSuggestions(1)"
        @keydown.esc="closeSuggestions"
        @focus="handleFocus"
        autofocus
        class="custom-search-input"
        spellcheck="false"
      >
        <template #append>
           <button class="icon-btn search-icon-btn" @click="performSearch" title="搜索">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
              </svg>
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
               <svg class="suggestion-icon" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                 <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
               </svg>
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
let debounceTimer = null;

const showSuggestions = computed(() => {
    return isFocused.value && suggestions.value.length > 0;
});

// Basic SVGs for logos
const engines = [
  {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    svg: `<svg viewBox="0 0 24 24" width="64" height="64"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.43 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.8c1.76 0 3.32.6 4.56 1.8l3.43-3.41C17.95 1.17 15.235 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>`
  },
  {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    svg: `<svg viewBox="0 0 24 24" width="64" height="64"><path fill="#008373" d="M5,3v18l13-7L9,9L5,3z M11,11l3,2.5L11,15V11z"/></svg>` // Simplified placeholder
  },
  {
    name: 'Baidu',
    url: 'https://www.baidu.com/s?wd=',
    svg: `<svg viewBox="0 0 24 24" width="64" height="64"><path fill="#2932E1" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>` // Simplified placeholder
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

function fetchSuggestions(text) {
    if (!text || !text.trim()) {
        suggestions.value = [];
        return;
    }

    const callbackName = 'bing_sugg_' + Math.floor(Math.random() * 100000);
    window[callbackName] = (data) => {
        try {
            if (data && data.AS && data.AS.Results && data.AS.Results.length > 0) {
                suggestions.value = data.AS.Results[0].Suggests.map(s => s.Txt);
            } else {
                suggestions.value = [];
            }
        } catch (e) {
            suggestions.value = [];
        }
        document.body.removeChild(script);
        delete window[callbackName];
    };

    const script = document.createElement('script');
    script.src = `https://api.bing.com/qsonhs.aspx?type=cb&q=${encodeURIComponent(text)}&cb=${callbackName}`;
    script.onerror = () => {
        suggestions.value = [];
        document.body.removeChild(script);
        delete window[callbackName];
    };
    document.body.appendChild(script);
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

onMounted(() => {
  loadEngine();
  window.addEventListener('engine-changed', loadEngine);
});

onUnmounted(() => {
  window.removeEventListener('engine-changed', loadEngine);
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
  border-color: transparent;
} 

/* Override BaseInput generic styles for the specific search bar needs */
:deep(.base-input-wrapper) {
   padding: 8px 16px 8px 24px;
   background: var(--md-sys-color-surface);
   border-radius: 28px;
   transition: box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1), border-radius 0.2s cubic-bezier(0.2, 0, 0, 1);
   position: relative;
   z-index: 25;
}

:deep(.base-input-wrapper.focused) {
    box-shadow: var(--md-sys-elevation-level3);
    background-color: var(--md-sys-color-surface);
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
  padding: 8px 0;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
}

.suggestion-item {
  padding: 10px 16px;
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
