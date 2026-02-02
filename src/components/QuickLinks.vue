<template>
  <div class="quick-links-container animate-slide-up">
    <TransitionGroup 
      name="list" 
      tag="div" 
      class="links-grid"
    >
      <BaseCard 
        v-for="(link, index) in links" 
        :key="link.id" 
        :interactive="true"
        class="link-card"
        :class="{ 'is-dragging': dragIndex === index }"
        draggable="true"
        @dragstart="handleDragStart($event, index)"
        @dragenter.prevent="handleDragEnter(index)"
        @dragover.prevent
        @dragend="handleDragEnd"
        @click="openLink(link.url, $event)"
        @contextmenu.prevent="handleContextMenu($event, index)"
      >
        <div class="link-content">
            <div class="link-icon-wrapper">
            <Icon 
                v-if="link.icon" 
                :icon="link.icon" 
                class="link-icon"
                :color="iconColor"
            />
            <img 
                v-else
                :src="getFavicon(link.url)" 
                class="link-icon" 
                alt=""
                @error="handleImageError"
                draggable="false"
            />
            </div>
            <span class="link-label">{{ link.title }}</span>
        </div>
      </BaseCard>

      <BaseCard 
        :interactive="true" 
        class="link-card add-card"
        @click="openAddModal"
        key="add-button"
      >
        <div class="link-content add-content">
            <div class="link-icon-wrapper add-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </div>
            <span class="link-label">添加</span>
        </div>
      </BaseCard>
    </TransitionGroup>

    <!-- Context Menu -->
    <Teleport to="body">
      <Transition name="context-menu">
        <div 
          v-if="contextMenu.visible" 
          class="context-menu"
          @click.stop
        >
          <div class="context-header">
            <div class="context-icon-wrapper">
                <Icon 
                    v-if="tempLink.icon" 
                    :icon="tempLink.icon" 
                    class="context-large-icon"
                    :color="iconColor"
                />
                <img 
                    v-else
                    :src="getFavicon(tempLink.url)" 
                    class="context-large-icon" 
                    @error="handleImageError"
                />
            </div>
          </div>
          <div class="context-body">
            <BaseInput v-model="tempLink.title" placeholder="名称" />
            <BaseInput v-model="tempLink.url" placeholder="网址" />
          </div>
          <div class="context-footer">
            <div class="context-btn" @click="openEditModal(contextMenu.index)" title="编辑">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </div>
            <div class="context-btn delete" @click="deleteLink(contextMenu.index)" title="删除">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal -->
    <BaseModal :isOpen="isModalOpen" :title="editMode ? '编辑快捷方式' : '添加快捷方式'" @close="closeModal">
        <div class="modal-form">
            <div class="form-group">
                <label>名称</label>
                <BaseInput v-model="newLink.title" placeholder="例如: GitHub" />
            </div>
            <div class="form-group">
                <label>网址</label>
                <BaseInput v-model="newLink.url" placeholder="https://" />
            </div>
            <IconSelector v-model="newLink.icon" />
        </div>
        <template #footer>
            <BaseButton variant="text" @click="closeModal">取消</BaseButton>
            <BaseButton variant="primary" @click="handleModalSubmit" :disabled="!newLink.url">
              {{ editMode ? '保存' : '添加' }}
            </BaseButton>
        </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import BaseCard from './ui/BaseCard.vue';
import BaseModal from './ui/BaseModal.vue';
import BaseInput from './ui/BaseInput.vue';
import BaseButton from './ui/BaseButton.vue';
import IconSelector from './ui/IconSelector.vue';

// Helper for unique IDs
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

const links = ref([]);
const isModalOpen = ref(false);
const newLink = ref({ title: '', url: '' });
const editMode = ref(false);
const editIndex = ref(-1);
const useThemeColor = ref(true);

const iconColor = computed(() => {
    return useThemeColor.value ? 'var(--md-sys-color-primary)' : 'currentColor';
});

// Drag and Drop
const dragIndex = ref(null);
let lastSwapTime = 0;

function handleDragStart(event, index) {
  closeContextMenu();
  dragIndex.value = index;
  // Reduce opacity of the ghost image if supported
  if (event.dataTransfer.setDragImage) {
      // Optional: set a custom drag image or clear it
  }
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(index) {
  if (dragIndex.value === null || dragIndex.value === index) return;
  
  // Throttle swaps to prevent flickering/thrashing during animation
  const now = Date.now();
  if (now - lastSwapTime < 300) return; 

  // Reorder
  const item = links.value.splice(dragIndex.value, 1)[0];
  links.value.splice(index, 0, item);
  dragIndex.value = index;
  lastSwapTime = now;
}

function handleDragEnd() {
  dragIndex.value = null;
  saveLinks();
}

// Context Menu
const contextMenu = ref({ visible: false, x: 0, y: 0, index: -1 });
const tempLink = ref({ title: '', url: '' });

function handleContextMenu(event, index) {
  event.stopPropagation();
  // Close existing if any (triggers save logic via closeContextMenu)
  if (contextMenu.value.visible) {
    closeContextMenu();
  }
  
  tempLink.value = { ...links.value[index] };
  
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    index
  };
}

function closeContextMenu(event) {
  if (contextMenu.value.visible && contextMenu.value.index !== -1) {
    // Save changes on close
    const index = contextMenu.value.index;
    if (links.value[index]) {
        // Only update if URL is valid-ish, or just allow it? 
        // User asked to change inputs. Let's save.
        let url = tempLink.value.url;
        if (url && !/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }
        
        links.value[index] = {
            ...links.value[index],
            title: tempLink.value.title || url,
            url: url || links.value[index].url // Keep old if empty? Or allow empty?
        };
        saveLinks();
    }
  }
  contextMenu.value.visible = false;
  contextMenu.value.index = -1;
}

// Edit / Delete / Add
function openAddModal() {
  editMode.value = false;
  newLink.value = { title: '', url: '', icon: '' };
  openModal();
}

function openEditModal(index) {
  closeContextMenu();
  editMode.value = true;
  editIndex.value = index;
  // Clone to avoid direct mutation before save
  newLink.value = { ...links.value[index] };
  openModal();
}

function deleteLink(index) {
  closeContextMenu();
  links.value.splice(index, 1);
  saveLinks();
}

function handleModalSubmit() {
  if (editMode.value) {
    updateLink();
  } else {
    addLink();
  }
}

function updateLink() {
   if (!newLink.value.url) return;
   let url = newLink.value.url;
   if (!/^https?:\/\//i.test(url)) {
     url = 'https://' + url;
   }
   
   // Preserve ID if it exists, otherwise generate one (fallback)
   const currentId = links.value[editIndex.value].id || generateId();
   
   links.value[editIndex.value] = {
     id: currentId,
     title: newLink.value.title || url,
     url: url,
     icon: newLink.value.icon
   };
   
   saveLinks();
   closeModal();
}

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
    links.value = JSON.parse(saved).map(link => ({
        ...link,
        id: link.id || generateId() // Ensure ID exists for legacy data
    }));
  } else {
    // Defaults
    links.value = [
      { id: generateId(), title: 'YouTube', url: 'https://youtube.com' },
      { id: generateId(), title: 'GitHub', url: 'https://github.com' }
    ];
  }
}

function loadIconColorSetting() {
  const saved = localStorage.getItem('appSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    useThemeColor.value = settings.useThemeColorForIcons !== false;
  }
}

function saveLinks() {
  localStorage.setItem('quickLinks', JSON.stringify(links.value));
}

function addLink() {
  if (!newLink.value.url) return;
  let url = newLink.value.url;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  
  links.value.push({
    id: generateId(),
    title: newLink.value.title || url,
    url: url,
    icon: newLink.value.icon
  });
  saveLinks();
  closeModal();
}

function openLink(url, event) {
    if (contextMenu.value.visible) {
        return;
    }
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    window.location.href = url;
}

function handleImageError(e) {
  e.target.style.display = 'none';
}

function openModal() {
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  editMode.value = false;
  editIndex.value = -1;
}

function handleDocumentClick(event) {
  // 如果点击的不是右键菜单内部，则关闭菜单
  const menu = document.querySelector('.context-menu');
  if (contextMenu.value.visible && (!menu || !menu.contains(event.target))) {
    closeContextMenu(event);
  }
}

onMounted(() => {
  loadLinks();
  loadIconColorSetting();
  document.addEventListener('click', handleDocumentClick);
  window.addEventListener('icon-color-changed', loadIconColorSetting);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
  window.removeEventListener('icon-color-changed', loadIconColorSetting);
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
  gap: 32px;
  padding: 20px;
  transition: transform 0.2s cubic-bezier(0.2, 0, 0.2, 1), 
              background-color 0.2s ease, 
              box-shadow 0.2s ease;
}

.link-card:hover {
  transform: translateY(-4px);
  /* background-color handled by BaseCard */
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 10;
}

.link-card:active {
  transform: scale(0.95);
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
  /* background-color handled by BaseCard */
  border-radius: 20px !important;
  transition: transform 0.2s cubic-bezier(0.2, 0, 0.2, 1), 
              background-color 0.2s ease, 
              box-shadow 0.2s ease,
              opacity 0.2s ease;
}

.link-card.is-dragging {
  opacity: 0.3;
  transform: scale(0.95);
  box-shadow: none;
  background-color: var(--md-sys-color-surface-variant, rgba(255, 255, 255, 0.05)) !important;
  border: 1px dashed rgba(255,255,255,0.3);
}

.link-card:not(.is-dragging):hover {
  transform: translateY(-4px);
  background-color: var(--md-sys-color-surface-container-high, rgba(30, 30, 30, 0.6)) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 10;
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

/* Context Menu */
.context-menu {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #2b2b2b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  padding: 16px;
  z-index: 9999;
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(20px);
}

.context-header {
  display: flex;
  justify-content: center;
  width: 100%;
}

.context-icon-wrapper {
  width: 80px;
  height: 80px;
  background: var(--md-sys-color-surface-container-high, #333);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.context-large-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.context-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.context-footer {
  display: flex;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 12px;
  gap: 16px;
}

.context-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.05);
}

.context-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.context-btn.delete {
  color: #ff5252;
  background: rgba(255, 82, 82, 0.1);
}

.context-btn.delete:hover {
  background-color: rgba(255, 82, 82, 0.2);
}

/* List Transitions */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}

/* Ensure moving items don't trigger drag events */
.list-move {
  pointer-events: none;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.list-leave-active {
  position: absolute;
}

/* Context Menu Transition */
.context-menu-enter-active,
.context-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.2, 0, 0.2, 1);
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9) translateY(10px);
}
</style>
