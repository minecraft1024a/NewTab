<template>
  <div class="quick-links-container animate-slide-up">
    <div class="links-grid">
      <BaseCard 
        v-for="(link, index) in links" 
        :key="index" 
        :interactive="true"
        class="link-card"
        @click="openLink(link.url)"
      >
        <div class="link-content">
            <div class="link-icon-wrapper">
            <img 
                :src="getFavicon(link.url)" 
                class="link-icon" 
                alt=""
                @error="handleImageError"
            />
            </div>
            <span class="link-label">{{ link.title }}</span>
            <button class="delete-btn" @click.stop="removeLink(index)">
                ×
            </button>
        </div>
      </BaseCard>

      <BaseCard 
        :interactive="true" 
        class="link-card add-card"
        @click="openModal"
      >
        <div class="link-content add-content">
            <div class="link-icon-wrapper add-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </div>
            <span class="link-label">添加</span>
        </div>
      </BaseCard>
    </div>

    <!-- Modal -->
    <BaseModal :isOpen="isModalOpen" title="添加快捷方式" @close="closeModal">
        <div class="modal-form">
            <div class="form-group">
                <label>名称</label>
                <BaseInput v-model="newLink.title" placeholder="例如: GitHub" />
            </div>
            <div class="form-group">
                <label>网址</label>
                <BaseInput v-model="newLink.url" placeholder="https://" @keyup.enter="addLink" />
            </div>
        </div>
        <template #footer>
            <BaseButton variant="text" @click="closeModal">取消</BaseButton>
            <BaseButton variant="primary" @click="addLink" :disabled="!newLink.url">添加</BaseButton>
        </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseCard from './ui/BaseCard.vue';
import BaseModal from './ui/BaseModal.vue';
import BaseInput from './ui/BaseInput.vue';
import BaseButton from './ui/BaseButton.vue';

const links = ref([]);
const isModalOpen = ref(false);
const newLink = ref({ title: '', url: '' });

function getFavicon(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch {
    return ''; // Fallback handled by CSS or default icon
  }
}

function loadLinks() {
  const saved = localStorage.getItem('quickLinks');
  if (saved) {
    links.value = JSON.parse(saved);
  } else {
    // Defaults
    links.value = [
      { title: 'YouTube', url: 'https://youtube.com' },
      { title: 'GitHub', url: 'https://github.com' }
    ];
  }
}

function saveLinks() {
  localStorage.setItem('quickLinks', JSON.stringify(links.value));
}

function addLink() {
  if (!newLink.value.url) return;
  let url = newLink.value.url;
  if (!url.startsWith('http')) url = 'https://' + url;
  
  links.value.push({
    title: newLink.value.title || url,
    url: url
  });
  saveLinks();
  closeModal();
}

function removeLink(index) {
  links.value.splice(index, 1);
  saveLinks();
}

function openModal() {
  newLink.value = { title: '', url: '' };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

onMounted(() => {
  loadLinks();
});
</script>

<style scoped>
.quick-links-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.links-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.link-card {
  width: 100px;
  height: 100px;
  padding: 0; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  text-decoration: none;
  background-color: var(--md-sys-color-surface-container, rgba(0, 0, 0, 0.4)) !important; 
  border-radius: 20px !important;
}

.link-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 12px;
    box-sizing: border-box;
}

.link-icon-wrapper {
  width: 40px;
  height: 40px;
  background: var(--md-sys-color-surface);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  padding: 6px;
  box-shadow: var(--md-sys-elevation-level1);
}

.link-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.link-label {
  font-size: 13px;
  color: var(--md-sys-color-on-surface);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.delete-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  transform: scale(0.8);
}

.link-card:hover .delete-btn {
  opacity: 1;
  transform: scale(1);
}

.add-content {
    opacity: 0.8;
}

.add-icon {
    color: var(--md-sys-color-primary);
}

/* Modal Form Styles */
.modal-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px 0;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-size: 14px;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
}
</style>
