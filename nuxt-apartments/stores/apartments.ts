import { defineStore } from 'pinia'

/**
 * Represents an apartment listing
 */
export interface Apartment {
  id: number
  description: string
  rooms: number
  floor: string
  area: number
  price: number
  image: string
}

/**
 * Available sort fields for apartments
 */
export enum SortField {
  PRICE = 'price',
  AREA = 'area',
  ROOMS = 'rooms',
  FLOOR = 'floor',
  DESCRIPTION = 'description'
}

/**
 * Available sort orders
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Filter state for apartments
 */
export interface FilterState {
  minPrice: number
  maxPrice: number
  areaMin: number
  areaMax: number
  rooms: number[]
}

/**
 * Type guard to check if a value is a valid Apartment
 */
function isApartment(apt: unknown): apt is Apartment {
  return (
    typeof apt === 'object' &&
    apt !== null &&
    'id' in apt &&
    'description' in apt &&
    'rooms' in apt &&
    'floor' in apt &&
    'area' in apt &&
    'price' in apt &&
    'image' in apt
  )
}

/**
 * Type for the apartments store state
 */
interface ApartmentsState {
  apartments: Apartment[]
  filteredResult: Apartment[]
  visibleCount: number
  loading: boolean
  filter: FilterState
  sortField: SortField | null
  sortOrder: SortOrder
  filterCache: Map<string, Apartment[]>
  filterError: string | null
}

interface ApartmentsActions {
  parseArea(area: unknown): number
  parseApartmentData(data: unknown): Apartment[]
  loadApartments(): Promise<void>
  matchesFilter(apt: Apartment, filter: FilterState): boolean
  getCacheKey(filter: FilterState, sortField: SortField | null, sortOrder: SortOrder): string
  applyFilters(filter: FilterState): Promise<void>
  showMore(): void
  sortApartments(field: SortField, order: SortOrder): void
  sortApartmentsInternal(list: Apartment[]): Apartment[]
}

export const useApartmentsStore = defineStore('apartments', {
  state: (): ApartmentsState => ({
    apartments: [],
    filteredResult: [],
    visibleCount: 20,
    loading: false,
    filter: {
      minPrice: 0,
      maxPrice: 20_000_000,
      areaMin: 0,
      areaMax: 200,
      rooms: []
    },
    sortField: null,
    sortOrder: SortOrder.ASC,
    filterCache: new Map(),
    filterError: null
  }),

  actions: {
    /**
     * Parse area value from string to number
     */
    parseArea(area: unknown): number {
      try {
        const cleanValue = String(area || '')
          .replace(/\s+/g, '')
          .replace(',', '.')
        const num = Number(cleanValue)
        return isNaN(num) || num <= 0 ? 0 : num
      } catch {
        return 0
      }
    },

    /**
     * Parse apartment data from API response
     */
    parseApartmentData(data: unknown): Apartment[] {
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected an array')
      }

      return data.map((item, index) => {
        const apartment: Apartment = {
          id: Number(item?.id ?? index),
          description: String(item?.description ?? ''),
          rooms: Number(item?.rooms ?? 0),
          floor: String(item?.floor ?? ''),
          area: this.parseArea(item?.area),
          price: Math.max(0, Number(item?.price ?? 0)),
          image: String(item?.image ?? '')
        }

        if (!isApartment(apartment)) {
          throw new Error(`Invalid apartment data at index ${index}`)
        }

        return apartment
      })
    },

    /**
     * Check if apartment matches filter criteria
     */
    matchesFilter(apt: Apartment, filter: FilterState): boolean {
      return (
        apt.price >= filter.minPrice &&
        apt.price <= filter.maxPrice &&
        apt.area >= filter.areaMin &&
        apt.area <= filter.areaMax &&
        (filter.rooms.length === 0 || filter.rooms.includes(apt.rooms))
      )
    },

    /**
     * Generate cache key for filter state
     */
    getCacheKey(filter: FilterState, sortField: SortField | null, sortOrder: SortOrder): string {
      return JSON.stringify({
        minPrice: filter.minPrice,
        maxPrice: filter.maxPrice,
        areaMin: filter.areaMin,
        areaMax: filter.areaMax,
        rooms: [...filter.rooms].sort(),
        sortField,
        sortOrder
      })
    },

    /**
     * Internal method to sort apartments array
     */
    sortApartmentsInternal(list: Apartment[]): Apartment[] {
      if (!this.sortField) return [...list]

      const field = this.sortField
      const order = this.sortOrder

      return [...list].sort((a, b) => {
        // Get values to compare
        const aValue = a[field as keyof Apartment]
        const bValue = b[field as keyof Apartment]

        // Handle different field types
        if (field === SortField.FLOOR) {
          // Special handling for floor values (e.g., "2 из 5")
          const getFloorNumber = (s: string): number => {
            const match = String(s).match(/(\d+)/)
            return match ? parseInt(match[1], 10) : 0
          }
          
          const aNum = getFloorNumber(String(aValue))
          const bNum = getFloorNumber(String(bValue))
          return order === SortOrder.ASC ? aNum - bNum : bNum - aNum
        }
        
        // Handle numeric fields
        if (field === SortField.AREA || field === SortField.PRICE || field === SortField.ROOMS) {
          const aNum = Number(aValue) || 0
          const bNum = Number(bValue) || 0
          return order === SortOrder.ASC ? aNum - bNum : bNum - aNum
        }
        
        // Handle string fields
        const aStr = String(aValue).toLowerCase()
        const bStr = String(bValue).toLowerCase()
        
        return order === SortOrder.ASC 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
      })
    },

    /**
     * Load apartments from the API
     */
    async loadApartments() {
      this.loading = true
      this.filterError = null

      try {
        // In a real app, this would be an API call
        const response = await fetch('/apartments.json')
        const data = await response.json()
        this.apartments = this.parseApartmentData(data)
        this.filteredResult = [...this.apartments]
      } catch (error) {
        console.error('Failed to load apartments:', error)
        this.filterError = 'Failed to load apartments. Please try again later.'
        this.apartments = []
        this.filteredResult = []
      } finally {
        this.loading = false
      }
    },

    /**
     * Apply filters to apartments
     */
    async applyFilters(filter: FilterState) {
      this.loading = true
      this.filter = { ...filter }
      this.visibleCount = 20

      const cacheKey = this.getCacheKey(filter, this.sortField, this.sortOrder)
      
      // Check cache first
      if (this.filterCache.has(cacheKey)) {
        this.filteredResult = this.filterCache.get(cacheKey) || []
        this.loading = false
        return
      }

      try {
        // Apply filters
        let result = this.apartments.filter(apt => this.matchesFilter(apt, filter))
        
        // Apply sorting
        result = this.sortApartmentsInternal(result)
        
        // Update cache
        this.filterCache.set(cacheKey, result)
        this.filteredResult = result
      } catch (error) {
        console.error('Error applying filters:', error)
        this.filterError = 'Error applying filters. Please try again.'
        this.filteredResult = []
      } finally {
        this.loading = false
      }
    },

    /**
     * Load more apartments (pagination)
     */
    showMore() {
      this.visibleCount += 20
    },

    /**
     * Sort apartments by field and order
     */
    sortApartments(field: SortField, order: SortOrder) {
      this.sortField = field
      this.sortOrder = order
      this.filteredResult = this.sortApartmentsInternal(this.filteredResult)
    },
  },

  getters: {
    /**
     * Get paginated list of filtered apartments
     */
    filteredApartments: (state): Apartment[] => {
      return state.filteredResult.slice(0, state.visibleCount)
    },

    /**
     * Get unique set of available room counts
     */
    availableRooms: (state): Set<number> => {
      return new Set(state.apartments.map(apt => apt.rooms))
    },

    /**
     * Get object with room counts as keys
     */
    roomCounts: (state): Record<number, boolean> => {
      return state.apartments.reduce((acc, apt) => {
        acc[apt.rooms] = true
        return acc
      }, {} as Record<number, boolean>)
    },

    /**
     * Check if there are more apartments to load
     */
    hasMore: (state): boolean => {
      return state.visibleCount < state.filteredResult.length
    },

    /**
     * Get min and max price from all apartments
     */
    minMaxPrice: (state): { min: number; max: number } => {
      if (state.apartments.length === 0) {
        return { min: 0, max: 20_000_000 }
      }

      const prices = state.apartments.map(a => a.price)
      return {
        min: Math.max(0, Math.min(...prices)),
        max: Math.max(...prices),
      }
    },

    /**
     * Get min and max area from all apartments
     */
    minMaxArea: (state): { min: number; max: number } => {
      if (state.apartments.length === 0) {
        return { min: 0, max: 200 }
      }

      const areas = state.apartments.map(a => a.area)
      return {
        min: Math.max(0, Math.min(...areas)),
        max: Math.max(...areas),
      }
    },
  },
})
