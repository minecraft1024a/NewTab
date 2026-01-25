<template>
  <div class="wallpaper-container">
    <video 
      v-if="videoSrc && isVideo" 
      :src="videoSrc" 
      autoplay 
      loop 
      muted 
      class="wallpaper-media"
    ></video>
    <img 
      v-else-if="videoSrc && !isVideo" 
      :src="videoSrc" 
      class="wallpaper-media" 
    />
    <div v-else class="wallpaper-placeholder"></div>
    
    <input 
      type="file" 
      ref="fileInput" 
      accept="video/*,image/*" 
      style="display: none" 
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { openDB } from 'idb';

const emit = defineEmits(['color-extracted']);

const videoSrc = ref(null);
const mimeType = ref('');
const fileInput = ref(null);

const isVideo = computed(() => mimeType.value.startsWith('video/'));

// 从图片或视频帧提取主色调
function extractColors(mediaElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 设置较小的尺寸以提高性能
  canvas.width = 100;
  canvas.height = 100;
  
  try {
    ctx.drawImage(mediaElement, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // 简单的颜色统计
    let r = 0, g = 0, b = 0;
    const pixelCount = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    
    r = Math.floor(r / pixelCount);
    g = Math.floor(g / pixelCount);
    b = Math.floor(b / pixelCount);
    
    // 应用颜色到CSS变量
    applyThemeColors(r, g, b);
  } catch (err) {
    console.error('颜色提取失败:', err);
  }
}

function applyThemeColors(r, g, b) {
  // 转换为HEX并emit
  const hexColor = '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
  
  emit('color-extracted', hexColor);
  
  // 保存到localStorage
  localStorage.setItem('extractedThemeColor', hexColor);
}

const dbName = 'wallpaper-db';
const storeName = 'wallpapers';

async function getDb() {
  return openDB(dbName, 1, {
    upgrade(db) {
      db.createObjectStore(storeName);
    },
  });
}

async function loadWallpaper() {
  try {
    const db = await getDb();
    const record = await db.get(storeName, 'current');
    if (record) {
      if (videoSrc.value) URL.revokeObjectURL(videoSrc.value);
      // record can be just the Blob or an object { file: Blob, type: String }
      // Storing just the blob is easiest, we can get type from it
      const file = record instanceof Blob ? record : record.file;
      videoSrc.value = URL.createObjectURL(file);
      mimeType.value = file.type;
    }
  } catch (err) {
    console.error('Failed to load wallpaper:', err);
  }
}

async function saveWallpaper(file) {
  const db = await getDb();
  await db.put(storeName, file, 'current');
  await loadWallpaper();
}

function triggerUpload() {
  fileInput.value.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    saveWallpaper(file);
  }
}

defineExpose({ triggerUpload });

onMounted(() => {
  loadWallpaper();
  
  // 监听媒体加载完成以提取颜色
  setTimeout(() => {
    const videoElement = document.querySelector('.wallpaper-media');
    if (videoElement) {
      if (videoElement.tagName === 'VIDEO') {
        videoElement.addEventListener('loadeddata', () => {
          extractColors(videoElement);
        });
      } else if (videoElement.tagName === 'IMG') {
        if (videoElement.complete) {
          extractColors(videoElement);
        } else {
          videoElement.addEventListener('load', () => {
            extractColors(videoElement);
          });
        }
      }
    }
  }, 100);
});

onUnmounted(() => {
  if (videoSrc.value) URL.revokeObjectURL(videoSrc.value);
});

// 监听videoSrc变化以重新提取颜色
watch(videoSrc, () => {
  setTimeout(() => {
    const videoElement = document.querySelector('.wallpaper-media');
    if (videoElement) {
      if (videoElement.tagName === 'VIDEO') {
        videoElement.addEventListener('loadeddata', () => {
          extractColors(videoElement);
        }, { once: true });
      } else if (videoElement.tagName === 'IMG') {
        if (videoElement.complete) {
          extractColors(videoElement);
        } else {
          videoElement.addEventListener('load', () => {
            extractColors(videoElement);
          }, { once: true });
        }
      }
    }
  }, 100);
});
</script>

<style scoped>
.wallpaper-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  background: #000;
  overflow: hidden;
}

.wallpaper-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.wallpaper-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--md-sys-color-primary-container), var(--md-sys-color-secondary-container));
}
</style>
