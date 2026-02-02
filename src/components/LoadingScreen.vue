<template>
  <Transition name="loading-fade">
    <div v-if="isVisible" class="loading-screen">
      <div class="loading-content">
        <div class="loader">
          <div class="spinner"></div>
        </div>
        <div class="loading-text">加载中...</div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isVisible = ref(true);

defineExpose({
  hide() {
    isVisible.value = false;
  }
});
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--md-sys-color-background, #1a1a1a);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loader {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid var(--md-sys-color-surface-variant, rgba(255, 255, 255, 0.1));
  border-top-color: var(--md-sys-color-primary, rgba(255, 255, 255, 0.8));
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
  font-weight: 400;
  color: var(--md-sys-color-on-background, rgba(255, 255, 255, 0.7));
  letter-spacing: 0.5px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.4s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
