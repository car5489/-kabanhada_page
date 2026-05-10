export type VehicleStatus = 'available' | 'reserved' | 'sold' | 'hidden'

export type VehicleImageKind = 'thumbnail' | 'gallery'

export type VehicleProfile = {
  vehicleType: string
  brand: string
  model: string
  year: number
  mileageKm: number
  fuel?: string
  transmission?: string
  color?: string
  shortDescription: string
  detailDescription: string
}

export type VehicleImage = {
  id: string
  kind: VehicleImageKind
  src: string
  alt: string
  sortOrder: number
}

export type VehicleVideo = {
  youtubeId: string
  title: string
}

export type VehicleContact = {
  label: string
  phoneDisplay: string
  phoneRaw: string
}

export type Vehicle = {
  id: string
  status: VehicleStatus
  title: string
  sortOrder: number
  thumbnail: string
  profile: VehicleProfile
  images: VehicleImage[]
  video?: VehicleVideo
  contact?: VehicleContact
}

export type VehicleCatalog = {
  schemaVersion: string
  generatedAt: string
  vehicles: Vehicle[]
}
