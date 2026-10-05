import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  StorageConfig,
  CreatePresignedUploadInput,
  PresignedUploadResult,
  PresignedDownloadResult,
  FileMetadata,
} from "./types";
import { normalizeContentType, classifyMedia } from "./mime.utils";

export class R2StorageService {
  private client: S3Client;
  private publicDomain: string;
  private bucketName: string;

  constructor(private config: StorageConfig) {
    this.bucketName = config.bucketName;
    // Normalize public domain (strip trailing slash)
    this.publicDomain = config.publicDomain.replace(/\/+$/, "");

    const endpoint = config.endpoint || `https://${config.accountId}.r2.cloudflarestorage.com`;

    this.client = new S3Client({
      region: config.region || "auto",
      endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /**
   * Generates a unique sanitized file key partitioned by user and date.
   */
  public generateFileKey(userId: string, fileName: string, folder = "media"): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "_")
      .replace(/_+/g, "_");
    const randomSuffix = Math.random().toString(36).substring(2, 8);

    return `${folder}/${userId}/${timestamp}-${randomSuffix}-${sanitizedFileName}`;
  }

  /**
   * Generates a signed PUT URL for the frontend/client to upload directly to Cloudflare R2.
   * Auto-resolves and enforces MIME Content-Type using standard mime-types database.
   */
  public async createPresignedUploadUrl(
    input: CreatePresignedUploadInput,
  ): Promise<PresignedUploadResult> {
    const fileKey = this.generateFileKey(input.userId, input.fileName, input.folder);
    const expiresInSec = input.expiresInSec || 900;
    const resolvedContentType = normalizeContentType(input.fileName, input.contentType);
    const mediaClassification = classifyMedia(input.fileName, resolvedContentType);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: resolvedContentType,
      Metadata: {
        userId: input.userId,
        originalName: encodeURIComponent(input.fileName),
        mediaType: mediaClassification.isVideo
          ? "video"
          : mediaClassification.isAudio
            ? "audio"
            : mediaClassification.isImage
              ? "image"
              : "document",
        ...(input.metadata || {}),
      },
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: expiresInSec,
    });

    return {
      uploadUrl,
      fileKey,
      publicUrl: this.getPublicUrl(fileKey),
      expiresInSec,
      contentType: resolvedContentType,
    };
  }

  /**
   * Generates a temporary signed GET URL for downloading private assets.
   */
  public async createPresignedDownloadUrl(
    fileKey: string,
    expiresInSec = 3600,
  ): Promise<PresignedDownloadResult> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    const downloadUrl = await getSignedUrl(this.client, command, {
      expiresIn: expiresInSec,
    });

    return {
      downloadUrl,
      fileKey,
      expiresInSec,
    };
  }

  /**
   * Formats the public CDN URL for a given file key.
   */
  public getPublicUrl(fileKey: string): string {
    return `${this.publicDomain}/${fileKey.replace(/^\/+/, "")}`;
  }

  /**
   * Retrieves an object stream directly from R2.
   * Useful for backend AI processing (whisper transcription, vision alt-text, thumbnail transcoding).
   */
  public async getFileStream(fileKey: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    const response = await this.client.send(command);
    return {
      stream: response.Body,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  }

  /**
   * Checks file metadata in R2 bucket (size, content type, ETag).
   */
  public async getFileMetadata(fileKey: string): Promise<FileMetadata | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const response = await this.client.send(command);
      return {
        fileKey,
        sizeBytes: response.ContentLength || 0,
        contentType: response.ContentType || "application/octet-stream",
        lastModified: response.LastModified,
        eTag: response.ETag,
      };
    } catch {
      return null;
    }
  }

  /**
   * Deletes a file from R2.
   */
  public async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Factory function to create an instance from environment variables.
   */
  public static fromEnv(env: Record<string, string | undefined> = process.env): R2StorageService {
    const accountId = env.CLOUDFLARE_R2_ACCOUNT_ID || env.R2_ACCOUNT_ID || "";
    const accessKeyId = env.CLOUDFLARE_R2_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID || "";
    const secretAccessKey = env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || env.R2_SECRET_ACCESS_KEY || "";
    const bucketName = env.CLOUDFLARE_R2_BUCKET_NAME || env.R2_BUCKET_NAME || "socioconnect-media";
    const publicDomain =
      env.CLOUDFLARE_R2_PUBLIC_DOMAIN || env.R2_PUBLIC_DOMAIN || "https://cdn.socioconnect.app";

    return new R2StorageService({
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicDomain,
      endpoint: env.CLOUDFLARE_R2_ENDPOINT,
      region: env.CLOUDFLARE_R2_REGION || "auto",
    });
  }
}
