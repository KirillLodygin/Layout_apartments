<template>
  <span class="sortable-icon-wrapper">
    <svg class="sortable-icon sortable-icon--up" viewBox="0 0 7 4" aria-hidden="true">
      <line
          :class="{ 'sortable-icon--active': sortOrder === 'asc' }"
          x1="0" y1="4" x2="3.5" y2="0"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          fill="none"
      />
      <line
          :class="{ 'sortable-icon--active': sortOrder === 'asc' }"
          x1="7" y1="4" x2="3.5" y2="0"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          fill="none"
      />
    </svg>
    <svg class="sortable-icon sortable-icon--down" viewBox="0 0 7 4" aria-hidden="true">
      <line
          :class="{ 'sortable-icon--active': sortOrder === 'desc' }"
          x1="0" y1="0" x2="3.5" y2="4"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          fill="none"
      />
      <line
          :class="{ 'sortable-icon--active': sortOrder === 'desc' }"
          x1="7" y1="0" x2="3.5" y2="4"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          fill="none"
      />
    </svg>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  sortOrder: 'asc' | 'desc' | null
}>()
</script>

<style scoped>
.sortable-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 7px;
  height: 10px;
  gap: 2px;
}

.sortable-icon {
  width: 7px;
  height: 4px;
  stroke: #94A3B8;
  stroke-width: 1.5;
  stroke-linecap: round;
  fill: none;
  transition: stroke 0.2s ease;
}

.sortable-icon--active {
  stroke: #22C55E !important;
}
</style>