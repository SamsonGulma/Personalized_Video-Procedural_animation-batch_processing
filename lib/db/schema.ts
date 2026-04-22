import * as z from 'zod'

export const jobStatusSchema = z.enum(['queued', 'rendering', 'completed', 'failed', 'cancelled'])
export type JobStatus = z.infer<typeof jobStatusSchema>

export const jobSchema = z.object({
  id: z.string(),
  name: z.string(),
  message: z.string(),
  templateId: z.string(),
  personalization: z.record(z.any()).optional(),
  status: jobStatusSchema,
  priority: z.number().default(0),
  createdAt: z.string(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  errorMessage: z.string().nullable(),
  retryCount: z.number(),
})

export type Job = z.infer<typeof jobSchema>

export const createJobSchema = z.object({
  name: z.string().min(1),
  message: z.string().min(1),
  templateId: z.string().min(1),
  personalization: z.record(z.any()).optional(),
})

export type CreateJobInput = z.infer<typeof createJobSchema>

export const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  config: z.record(z.any()).nullable(),
  active: z.boolean(),
  createdAt: z.string(),
})

export type Template = z.infer<typeof templateSchema>

export const outputAssetSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  variantId: z.string().nullable(),
  assetType: z.enum(['mp4', 'gif', 'preview']),
  filePath: z.string(),
  fileSizeBytes: z.number().nullable(),
  durationSeconds: z.number().nullable(),
  createdAt: z.string(),
})

export type OutputAsset = z.infer<typeof outputAssetSchema>
