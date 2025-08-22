export interface Apartment {
  id: number
  description: string
  rooms: number
  floor: string
  area: number
  price: number
  image: string
}

export enum SortField {
  PRICE = 'price',
  AREA = 'area',
  ROOMS = 'rooms',
  FLOOR = 'floor',
  DESCRIPTION = 'description'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export interface FilterState {
  minPrice: number
  maxPrice: number
  areaMin: number
  areaMax: number
  rooms: number[]
}

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

export interface ApartmentsActions {
  loadApartments(): Promise<void>
  applyFilter(filter: Partial<FilterState>): void
  setSort(field: SortField): void
  loadMore(): void
  resetFilter(): void
}
