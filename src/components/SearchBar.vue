<template>
  <div class="search-widget animate-fade-in">
    <!-- Engine Logo -->
    <div class="engine-selector" @click="rotateEngine">
      <div v-html="currentEngine.svg" class="engine-logo"></div>
    </div>

    <!-- Search Input -->
    <div class="search-bar-container">
      <BaseInput
        v-model="query"
        type="text"
        :placeholder="`使用 ${currentEngine.name} 搜索...`"
        @keydown.enter="performSearch"
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import BaseInput from './ui/BaseInput.vue';

const query = ref('');
const engineIndex = ref(0);

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
}

/* Override BaseInput generic styles for the specific search bar needs */
:deep(.base-input-wrapper) {
   padding: 8px 16px 8px 24px;
   background: var(--md-sys-color-surface);
   border-radius: 28px;
   transition: box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1);
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
</style>
