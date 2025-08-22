<template>
  <form class="filter" @submit.prevent="apply">
    <!-- Loading Overlay -->
    <div v-if="store.loading" class="filter-loading-overlay">
      <div class="filter-loading-spinner"></div>
    </div>
    
    <!-- Error Message -->
    <div v-if="store.filterError" class="filter-error-message">
      {{ store.filterError }}
    </div>
    <div class="filter-buttons">
      <button
        v-for="n in [1, 2, 3, 4, 5]"
        :key="n"
        type="button"
        :class="{
          active: rooms.includes(n),
          disabled: !availableRooms.has(n) || store.loading,
        }"
        :disabled="!availableRooms.has(n) || store.loading"
        @click="toggleRoom(n)"
      >
        <span>{{ `${n} к` }}</span>
      </button>
    </div>

    <ClientOnly>
      <div class="filter-price">
        <h3>Стоимость квартиры, ₽</h3>
        <div class="price-range">
          <div><span>от</span> {{ formattedMinPrice }}</div>
          <div><span>до</span> {{ formattedMaxPrice }}</div>
        </div>
        <VueSlider
          v-if="isPriceSliderReady"
          v-model="priceRange"
          :min="adjustedPriceMin"
          :max="adjustedPriceMax"
          :interval="priceInterval"
          :tooltip="'active'"
          :tooltip-placement="'top'"
          :disabled="store.loading"
          :process-style="{ backgroundColor: '#3EB57C' }"
          :tooltip-style="{ backgroundColor: '#3EB57C', color: 'white' }"
          :handle-style="{
            borderColor: '#3EB57C',
            backgroundColor: '#3EB57C',
          }"
          @change="onPriceChange"
        />
        <div v-else class="slider-placeholder">Загрузка слайдера...</div>
      </div>

      <div class="filter-area">
        <h3>Площадь, м²</h3>
        <div class="area-range">
          <div><span>от</span> {{ areaMinFormatted }}</div>
          <div><span>до</span> {{ areaMaxFormatted }}</div>
        </div>
        <VueSlider
          v-if="isAreaSliderReady"
          v-model="areaRange"
          :min="adjustedAreaMin"
          :max="adjustedAreaMax"
          :interval="areaInterval"
          :tooltip="'active'"
          :tooltip-placement="'top'"
          :disabled="store.loading"
          :process-style="{ backgroundColor: '#3EB57C' }"
          :tooltip-style="{ backgroundColor: '#3EB57C', color: 'white' }"
          :handle-style="{
            borderColor: '#3EB57C',
            backgroundColor: '#3EB57C',
          }"
          @change="onAreaChange"
        />
        <div v-else class="slider-placeholder">Загрузка слайдера...</div>
      </div>
    </ClientOnly>

    <div class="reset-button-container">
      <button
        type="button"
        class="reset-button"
        :disabled="store.loading"
        @click="resetFilters"
      >
        <span>Сбросить параметры</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { useApartmentsStore } from '@/stores/apartments'
  import VueSlider from 'vue-3-slider-component'
  import {nextTick} from "@/.nuxt/imports";

  const store = useApartmentsStore()

  const STORAGE_KEY = 'apartment-filters'

  const isPriceSliderReady = ref(false)
  const isAreaSliderReady = ref(false)

  const minMaxPrice = computed(() => store.minMaxPrice)
  const minMaxArea = computed(() => store.minMaxArea)

  const priceInterval = computed(() => {
    const range = minMaxPrice.value.max - minMaxPrice.value.min
    if (range > 5000000) return 100000
    if (range > 2000000) return 50000
    return 10000
  })

  const adjustedPriceMin = computed(() => {
    const min = minMaxPrice.value.min
    return typeof min === 'number' && !isNaN(min) && min >= 0
      ? Math.floor(min / priceInterval.value) * priceInterval.value
      : 0
  })

  const adjustedPriceMax = computed(() => {
    const max = minMaxPrice.value.max
    const min = adjustedPriceMin.value
    const interval = priceInterval.value

    if (typeof max === 'number' && !isNaN(max) && max > min) {
      return min + Math.ceil((max - min) / interval) * interval
    }
    return min + 10 * interval
  })

  const areaInterval = computed(() => {
    const range = minMaxArea.value.max - minMaxArea.value.min
    if (range > 50) return 0.5
    return 0.1
  })

  const adjustedAreaMin = computed(() => {
    const min = minMaxArea.value.min
    const interval = areaInterval.value
    return typeof min === 'number' && !isNaN(min) && min >= 0
      ? Math.floor(min / interval) * interval
      : 0
  })

  const adjustedAreaMax = computed(() => {
    const max = minMaxArea.value.max
    const min = adjustedAreaMin.value
    const interval = areaInterval.value

    if (typeof max === 'number' && !isNaN(max) && max > min) {
      return min + Math.ceil((max - min) / interval) * interval
    }
    return min + 10 * interval
  })

  const priceRange = ref<[number, number]>([0, 0])
  const areaRange = ref<[number, number]>([0, 0])

  const minPrice = computed(() => {
    const val = priceRange.value[0]
    return typeof val === 'number' &&
      !isNaN(val) &&
      val >= adjustedPriceMin.value
      ? val
      : adjustedPriceMin.value
  })

  const maxPrice = computed(() => {
    const val = priceRange.value[1]
    const min = minPrice.value
    return typeof val === 'number' && !isNaN(val) && val > min
      ? val
      : adjustedPriceMax.value
  })

  const areaMin = computed(() => {
    const val = areaRange.value[0]
    return typeof val === 'number' &&
      !isNaN(val) &&
      val >= adjustedAreaMin.value
      ? val
      : adjustedAreaMin.value
  })

  const areaMax = computed(() => {
    const val = areaRange.value[1]
    const min = areaMin.value
    return typeof val === 'number' && !isNaN(val) && val > min
      ? val
      : adjustedAreaMax.value
  })

  const formattedMinPrice = computed(() => {
    const val = minPrice.value
    return typeof val === 'number' && !isNaN(val) ? val.toLocaleString() : '0'
  })

  const formattedMaxPrice = computed(() => {
    const val = maxPrice.value
    return typeof val === 'number' && !isNaN(val) ? val.toLocaleString() : '0'
  })

  const areaMinFormatted = computed(() => {
    const val = areaMin.value
    return typeof val === 'number' && !isNaN(val) ? val.toFixed(1) : '0'
  })

  const areaMaxFormatted = computed(() => {
    const val = areaMax.value
    return typeof val === 'number' && !isNaN(val) ? val.toFixed(1) : '0'
  })

  const rooms = ref<number[]>([])
  const availableRooms = computed(() => store.availableRooms)

  let priceDebounce: number | null = null
  function onPriceChange() {
    if (priceDebounce !== null) {
      clearTimeout(priceDebounce)
    }
    priceDebounce = window.setTimeout(apply, 300)
  }

  let areaDebounce: number | null = null
  function onAreaChange() {
    if (areaDebounce !== null) {
      clearTimeout(areaDebounce)
    }
    areaDebounce = window.setTimeout(apply, 300)
  }

  function toggleRoom(n: number) {
    if (rooms.value.includes(n)) {
      rooms.value = rooms.value.filter((r) => r !== n)
    } else {
      rooms.value.push(n)
    }
    apply()
  }

  function saveState() {
    if (typeof window === 'undefined') return

    const state = {
      rooms: rooms.value,
      priceRange: priceRange.value,
      areaRange: areaRange.value,
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save filter state:', error)
    }
  }

  function restoreState() {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        return
      }
      if (saved) {
        const state = JSON.parse(saved)

        if (Array.isArray(state.rooms)) {
          rooms.value = state.rooms.filter((n) => availableRooms.value.has(n))
        }

        if (Array.isArray(state.priceRange) && state.priceRange.length === 2) {
          const [min, max] = state.priceRange
          if (
            typeof min === 'number' &&
            typeof max === 'number' &&
            min >= adjustedPriceMin.value &&
            max <= adjustedPriceMax.value &&
            min < max
          ) {
            priceRange.value = [min, max]
          }
        }

        if (Array.isArray(state.areaRange) && state.areaRange.length === 2) {
          const [min, max] = state.areaRange
          if (
            typeof min === 'number' &&
            typeof max === 'number' &&
            min >= adjustedAreaMin.value &&
            max <= adjustedAreaMax.value &&
            min < max
          ) {
            areaRange.value = [min, max]
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore filter state:', error)
    }
  }

  function resetFilters() {
    rooms.value = []

    priceRange.value = [adjustedPriceMin.value, adjustedPriceMax.value]
    areaRange.value = [adjustedAreaMin.value, adjustedAreaMax.value]

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }

    apply()
  }

  async function apply() {
    const filter = {
      minPrice: minPrice.value,
      maxPrice: maxPrice.value,
      areaMin: areaMin.value,
      areaMax: areaMax.value,
      rooms: rooms.value,
    }

    try {
      await store.applyFilters(filter)
      saveState()
    } catch (error) {
      console.error('Failed to apply filter:', error)
    }
  }

  onMounted(() => {
    initializeSliders()
    const saved = localStorage.getItem(STORAGE_KEY)

    nextTick(() => {
      setTimeout(() => {
        restoreState()
        apply()
      }, 100)
    })
  })

  watch([minMaxPrice, minMaxArea], () => {
    if (hasValidData()) {
      initializeSliders()
    }
  })

  function hasValidData(): boolean {
    return (
      typeof minMaxPrice.value.min === 'number' &&
      typeof minMaxPrice.value.max === 'number' &&
      typeof minMaxArea.value.min === 'number' &&
      typeof minMaxArea.value.max === 'number' &&
      adjustedPriceMax.value > adjustedPriceMin.value &&
      adjustedAreaMax.value > adjustedAreaMin.value
    )
  }

  function initializeSliders() {
    const priceMin = adjustedPriceMin.value
    const priceMax = adjustedPriceMax.value
    const priceIntervalVal = priceInterval.value

    const areaMin = adjustedAreaMin.value
    const areaMax = adjustedAreaMax.value
    const areaIntervalVal = areaInterval.value

    const finalPriceMin = priceMin
    const finalPriceMax =
      priceMax > priceMin ? priceMax : priceMin + 10 * priceIntervalVal

    const finalAreaMin = areaMin
    const finalAreaMax =
      areaMax > areaMin ? areaMax : areaMin + 10 * areaIntervalVal

    priceRange.value = [finalPriceMin, finalPriceMax]
    areaRange.value = [finalAreaMin, finalAreaMax]

    isPriceSliderReady.value = true
    isAreaSliderReady.value = true
  }

  if (hasValidData()) {
    initializeSliders()
  }
</script>
