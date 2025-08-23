<template>
  <div class="apartments__card">
    <div class="apartments__card-image">
      <img :src="apartment.image" alt="Квартира" loading="lazy" />
    </div>

    <div class="apartments__card-info">
      <p class="apartments__card-info-description">
        {{ apartment.description }}
      </p>
      <div class="apartments__card-info-details">
        <div>{{ apartment.area }} м²</div>
        <div>{{ `${floorParts.first} ` }}<span v-if="floorParts.second"> {{ floorParts.second }}</span></div>
        <div>{{ formattedPrice }} ₽</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
    apartment: {
      id: number
      description: string
      rooms: number
      floor: string
      area: string
      price: string
      image: string
    }
  }>()

const floorParts = computed(() => {
  const s = props.apartment.floor || ''
  const i = s.indexOf(' ')
  if (i === -1) return { first: s, second: '' }
  return { first: s.slice(0, i), second: s.slice(i + 1) }
})

const formattedPrice = computed(() => {
  const price = props.apartment.price
  let num = 0

  if (price === null || price === undefined) return '0'

  if (typeof price === 'number') {
    num = price
  } else if (typeof price === 'string') {
    num = parseFloat(price.replace(/\s/g, ''))
  } else {
    console.warn('Unexpected price type:', typeof price, price)
    return '0'
  }

  return isNaN(num) ? '0' : num.toLocaleString('ru-RU').replace(/\u00A0/g, ' ')
})
</script>
