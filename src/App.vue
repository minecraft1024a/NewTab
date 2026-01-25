<template>
  <div class="app-container">
    <WallpaperPlayer ref="wallpaperRef" @color-extracted="handleColorExtracted" />
    
    <div class="content animate-fade-in">
      <div class="center-section">
        <SearchBar />
        <div class="spacer-vertical"></div>
        <QuickLinks />
      </div>

      <div class="footer-actions">
        <BaseButton variant="secondary" :iconOnly="true" @click="triggerWallpaperUpload" title="更换壁纸" class="icon-btn-glass">
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z"/>
                </svg>
            </template>
        </BaseButton>
        <BaseButton variant="secondary" :iconOnly="true" @click="openSettings" title="设置" class="icon-btn-glass">
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/>
                </svg>
            </template>
        </BaseButton>
      </div>
    </div>
    
    <Settings :isOpen="settingsOpen" @close="closeSettings" ref="settingsRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import WallpaperPlayer from './components/WallpaperPlayer.vue';
import SearchBar from './components/SearchBar.vue';
import QuickLinks from './components/QuickLinks.vue';
import Settings from './components/Settings.vue';
import BaseButton from './components/ui/BaseButton.vue';

const wallpaperRef = ref(null);
const settingsRef = ref(null);
const settingsOpen = ref(false);

function triggerWallpaperUpload() {
  wallpaperRef.value?.triggerUpload();
}

function openSettings() {
  settingsOpen.value = true;
}

function closeSettings() {
  settingsOpen.value = false;
}

function handleColorExtracted(color) {
  // 保存提取的颜色
  localStorage.setItem('extractedThemeColor', color);
  
  // 如果设置了自动提取颜色，则应用该颜色
  const settings = localStorage.getItem('appSettings');
  if (settings) {
    const parsedSettings = JSON.parse(settings);
    if (parsedSettings.autoExtractColor) {
      // 更新设置中的提取颜色并应用
      setTimeout(() => {
        if (settingsRef.value) {
          const extracted = settingsRef.value.presetColors.find(c => c.name === 'extracted');
          if (extracted) {
            extracted.value = color;
          }
          if (parsedSettings.themeColor === 'extracted' || parsedSettings.autoExtractColor) {
            settingsRef.value.applyThemeColor(color);
            parsedSettings.themeColor = 'extracted';
            localStorage.setItem('appSettings', JSON.stringify(parsedSettings));
          }
        }
      }, 100);
    }
  }
}
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  padding: 20px;
}

.center-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  background: rgba(0,0,0,0.0); /* Transparent by default */
  /* Optional: Add backdrop blur if text is hard to read */
}

.spacer-vertical {
  height: 40px;
}

.footer-actions {
  position: absolute;
  bottom: 24px;
  right: 24px;
  display: flex;
  gap: 12px;
  z-index: 10;
}

.icon-btn-glass {
    background-color: var(--md-sys-color-surface-container, rgba(0, 0, 0, 0.4));
    backdrop-filter: blur(8px);
    color: var(--md-sys-color-on-surface);
    border: 1px solid rgba(255,255,255,0.1);
}

.icon-btn-glass:hover {
    background-color: var(--md-sys-color-surface-container-high, rgba(30, 30, 30, 0.6));
    border-color: rgba(255,255,255,0.2);
}
</style>
