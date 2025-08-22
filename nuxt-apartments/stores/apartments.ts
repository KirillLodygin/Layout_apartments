import { defineStore } from 'pinia'

export interface Apartment {
  id: number
  description: string
  rooms: number
  floor: string
  area: number
  price: number
  image: string
}

export interface FilterState {
  minPrice: number
  maxPrice: number
  areaMin: number
  areaMax: number
  rooms: number[]
}

export const useApartmentsStore = defineStore('apartments', {
  state: () => ({
    apartments: [] as Apartment[],
    filteredResult: [] as Apartment[],
    visibleCount: 20,
    loading: false,
    filter: {
      minPrice: 0,
      maxPrice: 20_000_000,
      areaMin: 0,
      areaMax: 200,
      rooms: [] as number[],
    } as FilterState,
    sortField: null as string | null,
    sortOrder: 'asc' as 'asc' | 'desc',
    filterCache: new Map<string, Apartment[]>(),
    filterError: null as string | null,
  }),

  actions: {
    async loadApartments() {
      this.loading = true
      try {
        const res = await fetch('/apartments.json')
        const data = await res.json()

        this.apartments = (data || []).map((a: any) => ({
          id: Number(a.id),
          description: String(a.description ?? ''),
          rooms: Number(a.rooms ?? 0),
          floor: String(a.floor ?? ''),
          area: (() => {
            try {
              const cleanValue = String(a.area || '')
                .replace(/\s+/g, '')
                .replace(',', '.')

              const num = Number(cleanValue)
              return isNaN(num) || num <= 0 ? 0 : num
            } catch (e) {
              return 0
            }
          })(),
          price: Number(a.price ?? 0),
          image: String(a.image ?? ''),
        }))

        this.filteredResult = [...this.apartments]
      } catch (e) {
        console.error('Failed to load apartments', e)
        this.apartments = []
        this.filteredResult = []
        this.filterError = 'Ошибка загрузки данных'
      } finally {
        this.loading = false
      }
    },

    async applyFilters(filter: FilterState) {
      this.loading = true
      this.filterError = null

      const cacheKey = JSON.stringify({
        ...filter,
        sortField: this.sortField,
        sortOrder: this.sortOrder,
      })

      try {
        if (this.filterCache.has(cacheKey)) {
          this.filteredResult = this.filterCache.get(cacheKey)!
          this.visibleCount = 20
          return
        }

        await new Promise((resolve) => setTimeout(resolve, 600))


        const filtered = this.apartments.filter((apt) => {
          const priceOk =
            apt.price >= filter.minPrice && apt.price <= filter.maxPrice
          const areaOk =
            apt.area >= filter.areaMin && apt.area <= filter.areaMax
          const roomsOk =
            filter.rooms.length === 0 || filter.rooms.includes(apt.rooms)
          return priceOk && areaOk && roomsOk
        })

        const sorted = this.sortApartmentsInternal(filtered)

        this.filteredResult = sorted
        this.visibleCount = 20
        this.filterCache.set(cacheKey, sorted)
      } catch (error) {
        console.error('Filtering failed:', error)
        this.filterError = 'Ошибка при фильтрации данных'
        throw error
      } finally {
        this.loading = false
      }
    },

    showMore() {
      this.visibleCount += 20
    },

    sortApartments(field: string, order: 'asc' | 'desc') {
      this.sortField = field
      this.sortOrder = order

      this.filteredResult = this.sortApartmentsInternal(this.filteredResult)
    },

    sortApartmentsInternal(list: Apartment[]): Apartment[] {
      if (!this.sortField) return [...list]

      const field = this.sortField
      const order = this.sortOrder || 'asc'

      return [...list].sort((left, right) => {
        let va: number | string = (left as any)[field]
        let vb: number | string = (right as any)[field]

        if (field === 'floor') {
          const getFirstNumber = (s: string) => {
            const m = String(s).match(/-?\d+/)
            return m ? parseInt(m[0], 10) : 0
          }
          va = getFirstNumber(String(va))
          vb = getFirstNumber(String(vb))
        } else if (field === 'area' || field === 'price' || field === 'rooms') {
          va = Number(va) || 0
          vb = Number(vb) || 0
        } else {
          va = String(va)
          vb = String(vb)
        }

        if (typeof va === 'number' && typeof vb === 'number') {
          if (va < vb) return order === 'asc' ? -1 : 1
          if (va > vb) return order === 'asc' ? 1 : -1
          return 0
        } else {
          return order === 'asc'
            ? String(va).localeCompare(String(vb))
            : String(vb).localeCompare(String(va))
        }
      })
    },
  },

  getters: {
    filteredApartments: (state) => {
      return state.filteredResult.slice(0, state.visibleCount)
    },

    availableRooms: (state) => {
      const counts = new Set<number>()
      for (const a of state.apartments) {
        counts.add(a.rooms)
      }
      return counts
    },

    roomCounts: (state) => {
      const counts: Record<number, boolean> = {}
      for (const a of state.apartments) {
        counts[a.rooms] = true
      }
      return counts
    },

    hasMore: (state) => state.visibleCount < state.filteredResult.length,

    minMaxPrice: (state) => {
      if (state.apartments.length === 0) return { min: 0, max: 20_000_000 }

      const prices = state.apartments.map((a) => a.price)
      return {
        min: Math.min(...prices),
        max: Math.max(...prices),
      }
    },

    minMaxArea: (state) => {
      if (state.apartments.length === 0) return { min: 0, max: 200 }

      const areas = state.apartments.map((a) => a.area)
      return {
        min: Math.min(...areas),
        max: Math.max(...areas),
      }
    },
  },
})
