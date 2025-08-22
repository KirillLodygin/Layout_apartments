<template>
  <span class="sortable-icon-wrapper">
    <svg
      class="sortable-icon sortable-icon--up" 
      :class="{ 'sortable-icon--active': isActive && sortOrder === 'asc' }"
      width="7" 
      height="4" 
      viewBox="0 0 7 4" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M0.5 4L3.5 1L6.5 4" stroke="currentColor" stroke-linecap="round"/>
    </svg>
    
    <svg
      class="sortable-icon sortable-icon--down" 
      :class="{ 'sortable-icon--active': isActive && sortOrder === 'desc' }"
      width="7" 
      height="4" 
      viewBox="0 0 7 4" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M0.5 0L3.5 3L6.5 0" stroke="currentColor" stroke-linecap="round"/>
    </svg>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  sortOrder: 'asc' | 'desc' | null
  isActive: boolean
}>()
</script>

<style scoped>
.sortable-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-left: 8px;
  width: 7px;
  height: 16px;
}

.sortable-icon {
  width: 7px;
  height: 4px;
  display: block;
  color: #94A3B8;
  transition: color 0.2s ease;
}

.sortable-icon--active {
  color: #10B981;
}

/* Убираем лишние трансформации, так как стрелки уже в правильной ориентации */
.sortable-icon--up {
  /* Стрелка вверх - оставляем как есть */
}

.sortable-icon--down {
  /* Стрелка вниз - оставляем как есть */
}
</style>