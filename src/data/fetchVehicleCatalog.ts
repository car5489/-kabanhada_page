import type { VehicleCatalog } from '@/types/vehicle'

export function withBaseUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

export async function fetchVehicleCatalog(
  dataPath = 'data/vehicle-catalog.json',
): Promise<VehicleCatalog> {
  const response = await fetch(withBaseUrl(dataPath), { cache: 'no-cache' })

  if (!response.ok) {
    throw new Error('카반하다 차량 데이터가 로드되지 않았습니다.')
  }

  return response.json() as Promise<VehicleCatalog>
}
