import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

// The one S3 client for the app (Garage on the VPS). Server-only: it holds the
// storage secret, so never import this into client components.

let client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (client) return client;
  if (!env.storage.enabled) {
    throw new Error(
      "S3 storage is not configured. Set S3_ENDPOINT, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY."
    );
  }
  client = new S3Client({
    endpoint: env.storage.endpoint,
    region: env.storage.region,
    credentials: {
      accessKeyId: env.storage.accessKeyId,
      secretAccessKey: env.storage.secretAccessKey,
    },
    // Garage serves buckets by path; virtual-host bucket names would need DNS.
    forcePathStyle: true,
    // Newer SDKs add CRC checksums to every request by default, which
    // S3-compatible stores do not all accept.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

function isNotFound(err: unknown): boolean {
  if (err instanceof S3ServiceException) {
    return (
      err.$metadata?.httpStatusCode === 404 || err.name === "NoSuchKey" || err.name === "NotFound"
    );
  }
  return false;
}

export async function putObject(params: {
  bucket: string;
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
  cacheControl?: string;
}): Promise<void> {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl,
    })
  );
}

export type StoredObject = {
  body: ReadableStream<Uint8Array>;
  contentType: string;
  contentLength?: number;
  etag?: string;
};

/** Streams one object. Returns null when the key does not exist. */
export async function getObject(bucket: string, key: string): Promise<StoredObject | null> {
  try {
    const res = await getS3Client().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!res.Body) return null;
    return {
      body: res.Body.transformToWebStream(),
      contentType: res.ContentType ?? "application/octet-stream",
      contentLength: res.ContentLength,
      etag: res.ETag,
    };
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

export async function objectExists(bucket: string, key: string): Promise<boolean> {
  try {
    await getS3Client().send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (err) {
    if (isNotFound(err)) return false;
    throw err;
  }
}

/** Throws when the bucket is missing or the store cannot be reached. */
export async function headBucket(bucket: string): Promise<void> {
  await getS3Client().send(new HeadBucketCommand({ Bucket: bucket }));
}

export type DeleteResult = {
  deleted: string[];
  failed: { key: string; message: string }[];
};

const DELETE_BATCH = 1000;

/**
 * Deletes keys in batches. Per-key failures are returned rather than thrown so
 * a caller cleaning up many files can report them; a transport failure throws.
 */
export async function deleteObjects(bucket: string, keys: string[]): Promise<DeleteResult> {
  const result: DeleteResult = { deleted: [], failed: [] };
  for (let i = 0; i < keys.length; i += DELETE_BATCH) {
    const batch = keys.slice(i, i + DELETE_BATCH);
    const res = await getS3Client().send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: false },
      })
    );
    for (const d of res.Deleted ?? []) if (d.Key) result.deleted.push(d.Key);
    for (const e of res.Errors ?? []) {
      result.failed.push({ key: e.Key ?? "", message: e.Message ?? e.Code ?? "Unknown error" });
    }
  }
  return result;
}

/** Every key under `prefix`, following pagination. */
export async function listKeys(bucket: string, prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const res = await getS3Client().send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token })
    );
    for (const obj of res.Contents ?? []) if (obj.Key) keys.push(obj.Key);
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

/** Public URL of a media-bucket object, served through `S3_PUBLIC_URL`. */
export function publicMediaUrl(key: string): string {
  if (!env.storage.publicUrl) throw new Error("S3_PUBLIC_URL is not set.");
  const path = key.split("/").map(encodeURIComponent).join("/");
  return `${env.storage.publicUrl}/${path}`;
}

/**
 * The media-bucket key behind a URL from `publicMediaUrl`. Null for any other
 * origin, so a foreign or legacy URL never maps onto one of our objects.
 */
export function mediaKeyFromUrl(url: string): string | null {
  const base = env.storage.publicUrl;
  if (!base || !url.startsWith(`${base}/`)) return null;
  let key: string;
  try {
    key = decodeURIComponent(url.slice(base.length + 1).split(/[?#]/)[0]);
  } catch (err) {
    console.warn("[storage] undecodable media URL:", url, err);
    return null;
  }
  if (!key || key.includes("..") || key.startsWith("/")) return null;
  return key;
}
