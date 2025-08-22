<template>
  <h1>Квартиры</h1>
  <div class="table-header" role="row">
    <div class="table-header__cell" role="columnheader">Планировка</div>
    <div class="table-header__cell" role="columnheader">Квартира</div>

    <div class="table-header__actions">
      <!-- Площадь -->
      <button
          @click="handleSort('area')"
          class="table-header__cell--sortable"
          :class="{ 'table-header__cell--active': sortField === 'area' }"
          type="button"
          aria-label="Сортировать по площади"
      >
        <span class="table-header__label">S, м²</span>
        <SortableIcon :sort-order="sortField === 'area' ? sortOrder : null" />
      </button>

      <!-- Этаж -->
      <button
          @click="handleSort('floor')"
          class="table-header__cell--sortable"
          :class="{ 'table-header__cell--active': sortField === 'floor' }"
          type="button"
          aria-label="Сортировать по этажу"
      >
        <span class="table-header__label">Этаж</span>
        <SortableIcon :sort-order="sortField === 'floor' ? sortOrder : null" />
      </button>

      <!-- Цена -->
      <button
          @click="handleSort('price')"
          class="table-header__cell--sortable table-header__cell--price"
          :class="{ 'table-header__cell--active': sortField === 'price' }"
          type="button"
          aria-label="Сортировать по цене"
      >
        <span class="table-header__label">Цена, ₽</span>
        <SortableIcon :sort-order="sortField === 'price' ? sortOrder : null" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SortableIcon from '@/components/Apartments/SortableIcon.vue'

  const sortField = ref<string | null>(null)
  const sortOrder = ref<'asc' | 'desc' | null>(null)

  function handleSort(field: string) {
    if (sortField.value === field) {
      if (sortOrder.value === 'asc') {
        sortOrder.value = 'desc'
      } else if (sortOrder.value === 'desc') {
        sortOrder.value = null
        sortField.value = null
      } else {
        sortOrder.value = 'asc'
      }
    } else {
      sortField.value = field
      sortOrder.value = 'asc'
    }

    emit('sort', {
    field: sortField.value,
    order: sortOrder.value
  })
}

const emit = defineEmits<{
  (e: 'sort', payload: { field: string | null; order: 'asc' | 'desc' | null }): void
}>()
</script>
