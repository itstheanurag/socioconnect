import { z } from "zod";

export const StorageConfigSchema = z.object({
  accountId: z.string().min(1, "Cloudflare account ID is required"),
  accessKeyId: z.string().min(1, "R2 Access Key ID is required"),
  secretAccessKey: z.string().min(1, "R2 Secret Access Key is required"),
  bucketName: z.string().min(1, "Bucket name is required"),
  publicDomain: z.string().url("Public domain must be a valid URL"),
  endpoint: z.string().optional(),
  region: z.string().default("auto"),
});

export type StorageConfig = z.infer<typeof StorageConfigSchema>;

export const CreatePresignedUploadInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  fileName: z.string().min(1, "File name is required"),
  contentType: z.string().min(1, "Content-Type is required"),
  sizeBytes: z.number().positive().optional(),
  folder: z.string().optional().default("media"),
  expiresInSec: z.number().int().min(60).max(86400).optional().default(900), // Default 15 mins
  metadata: z.record(z.string()).optional(),
});

export type CreatePresignedUploadInput = z.infer<typeof CreatePresignedUploadInputSchema>;

export interface PresignedUploadResult {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  expiresInSec: number;
  contentType: string;
}

export interface PresignedDownloadResult {
  downloadUrl: string;
  fileKey: string;
  expiresInSec: number;
}

export interface FileMetadata {
  fileKey: string;
  sizeBytes: number;
  contentType: string;
  lastModified?: Date;
  eTag?: string;
}
