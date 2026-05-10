import { z } from 'zod'

export const VehicleStatusSchema = z.enum(['available', 'reserved', 'sold', 'hidden'])
export const VehicleImageKindSchema = z.enum(['thumbnail', 'gallery'])

export const VehicleProfileSchema = z.object({
  vehicleType: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900),
  mileageKm: z.number().int().nonnegative(),
  fuel: z.string().optional(),
  transmission: z.string().optional(),
  color: z.string().optional(),
  shortDescription: z.string().min(1),
  detailDescription: z.string().min(1),
})

export const VehicleImageSchema = z.object({
  id: z.string().min(1),
  kind: VehicleImageKindSchema,
  src: z.string().min(1),
  alt: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
})

export const VehicleVideoSchema = z.object({
  youtubeId: z.string().min(1),
  title: z.string().min(1),
})

export const VehicleContactSchema = z.object({
  label: z.string().min(1),
  phoneDisplay: z.string().min(1),
  phoneRaw: z.string().regex(/^[0-9]+$/),
})

export const VehicleSchema = z.object({
  id: z.string().min(1),
  status: VehicleStatusSchema,
  title: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
  thumbnail: z.string().min(1),
  profile: VehicleProfileSchema,
  images: z.array(VehicleImageSchema).min(1),
  video: VehicleVideoSchema.optional(),
  contact: VehicleContactSchema.optional(),
})

export const VehicleCatalogSchema = z.object({
  schemaVersion: z.string().min(1),
  generatedAt: z.string().min(1),
  vehicles: z.array(VehicleSchema),
})

export type VehicleCatalogSchemaType = z.infer<typeof VehicleCatalogSchema>
