<template>
  <main class="page">
    <section>
      <TableHeader @sort="onSort" />
      <div class="apartments">
        <ApartmentCard
          v-for="ap in store.filteredApartments"
          :key="ap.id"
          :apartment="ap"
        />
      </div>
      <button v-if="store.hasMore" @click="store.showMore" class="button">
        Загрузить еще
      </button>
    </section>

    <section>
      <FilterForm @apply="onApplyFilter" />
    </section>

    <button
      v-show="showScrollTop"
      @click="scrollTop"
      class="upward"
      style="position: fixed; bottom: 20px; right: 20px"
    >
      <span>↑</span>
    </button>
  </main>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useApartmentsStore } from '@/stores/apartments'
  import FilterForm from '@/components/Filter/FilterForm.vue'
  import ApartmentCard from '@/components/Apartments/ApartmentCard.vue'
  import TableHeader from "@/components/Apartments/TableHeader.vue";

  const store = useApartmentsStore()
  const showScrollTop = ref(false)

  onMounted((): void => {
    store.loadApartments()
    window.addEventListener('scroll', () => {
      showScrollTop.value = window.scrollY > 400
    })
  })

  const onSort = ({ field, order }: { field: string; order: 'asc' | 'desc' }) => {
    store.sortApartments(field, order)
  }

  function onApplyFilter(filter: any) {
    store.setFilter(filter)
  }
  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
</script>
