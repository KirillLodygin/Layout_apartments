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
 * Type for the apartments store state
 */
export interface ApartmentsState {
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

/**
 * Type guard to check if a value is a valid Apartment
 */
export function isApartment(apt: unknown): apt is Apartment;

/**
 * Apartments store actions
 */
export interface ApartmentsActions {
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
