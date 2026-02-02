<template>
  <div class="wallpaper-container" :style="{ opacity: isWallpaperReady ? 1 : 0 }">
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

const emit = defineEmits(['color-extracted', 'wallpaper-loaded']);

const videoSrc = ref(null);
const mimeType = ref('');
const fileInput = ref(null);
const isWallpaperReady = ref(false);

const isVideo = computed(() => mimeType.value.startsWith('video/'));

// 从图片或视频帧提取多种主要颜色
function extractColors(mediaElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 设置较小的尺寸以提高性能
  canvas.width = 150;
  canvas.height = 150;
  
  try {
    ctx.drawImage(mediaElement, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // 使用K-means聚类提取主要颜色
    const colors = extractDominantColors(data, 5);
    
    // 应用颜色
    applyThemeColors(colors);
  } catch (err) {
    console.error('颜色提取失败:', err);
  }
}

// K-means聚类提取主要颜色
function extractDominantColors(data, k) {
  const pixels = [];
  
  // 采样像素，跳过一些像素以提高性能
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // 跳过透明或接近黑白的像素
    if (a < 128) continue;
    const brightness = (r + g + b) / 3;
    if (brightness < 30 || brightness > 225) continue;
    
    pixels.push([r, g, b]);
  }
  
  if (pixels.length === 0) {
    return [{ r: 103, g: 80, b: 164 }];
  }
  
  // 简化的K-means算法
  const maxIterations = 10;
  let centroids = [];
  
  // 随机初始化质心
  for (let i = 0; i < k; i++) {
    const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
    centroids.push([...randomPixel]);
  }
  
  for (let iter = 0; iter < maxIterations; iter++) {
    const clusters = Array(k).fill(null).map(() => []);
    
    // 分配像素到最近的质心
    pixels.forEach(pixel => {
      let minDist = Infinity;
      let closestCentroid = 0;
      
      centroids.forEach((centroid, idx) => {
        const dist = Math.sqrt(
          Math.pow(pixel[0] - centroid[0], 2) +
          Math.pow(pixel[1] - centroid[1], 2) +
          Math.pow(pixel[2] - centroid[2], 2)
        );
        if (dist < minDist) {
          minDist = dist;
          closestCentroid = idx;
        }
      });
      
      clusters[closestCentroid].push(pixel);
    });
    
    // 更新质心
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) {
        return centroids[0];
      }
      const sum = cluster.reduce((acc, pixel) => [
        acc[0] + pixel[0],
        acc[1] + pixel[1],
        acc[2] + pixel[2]
      ], [0, 0, 0]);
      
      return [
        Math.round(sum[0] / cluster.length),
        Math.round(sum[1] / cluster.length),
        Math.round(sum[2] / cluster.length)
      ];
    });
  }
  
  // 增强颜色饱和度
  return centroids.map(centroid => {
    const [r, g, b] = centroid;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    
    // 增强饱和度较低的颜色
    if (saturation < 0.3) {
      const avg = (r + g + b) / 3;
      const boost = 1.5;
      return {
        r: Math.min(255, Math.round(avg + (r - avg) * boost)),
        g: Math.min(255, Math.round(avg + (g - avg) * boost)),
        b: Math.min(255, Math.round(avg + (b - avg) * boost))
      };
    }
    
    return { r, g, b };
  });
}

function applyThemeColors(colors) {
  // 转换为HEX并保存多个颜色
  const hexColors = colors.map(({ r, g, b }) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  });
  
  emit('color-extracted', hexColors);
  
  // 保存到localStorage
  localStorage.setItem('extractedThemeColors', JSON.stringify(hexColors));
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
      
      // 壁纸加载后立即显示，不等待颜色提取
      setTimeout(() => {
        isWallpaperReady.value = true;
        emit('wallpaper-loaded');
      }, 50);
    } else {
      // 如果没有保存的壁纸，直接标记为就绪
      isWallpaperReady.value = true;
      emit('wallpaper-loaded');
    }
  } catch (err) {
    console.error('Failed to load wallpaper:', err);
    // 出错时也标记为就绪
    isWallpaperReady.value = true;
    emit('wallpaper-loaded');
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
  transition: opacity 0.5s ease;
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
