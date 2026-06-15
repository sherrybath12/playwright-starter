/**
 * Simple S3 upload helpers for the project.
 *
 * Install runtime dependencies if you haven't already:
 *   npm install @aws-sdk/client-s3 mime-types
 *
 * For large/multipart uploads (recommended for big files), install:
 *   npm install @aws-sdk/lib-storage
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import mime from "mime-types";

const REGION = process.env.AWS_REGION || "us-east-1";

// The SDK reads credentials from the environment or the default credential
// provider chain (shared credentials file, EC2/ECS/Container role, etc.).
const s3Client = new S3Client({ region: REGION });

/**
 * Upload a local file to S3 using PutObject (single request).
 * Suitable for small-to-medium files.
 *
 * @param filePath Local path to the file to upload
 * @param bucket Target S3 bucket name
 * @param key Optional S3 object key (defaults to the basename of filePath)
 * @returns The uploaded object's `Bucket` and `Key`
 */
export async function uploadFileToS3(
    filePath: string,
    bucket: string,
    key?: string
): Promise<{ Bucket: string; Key: string }> {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) throw new Error(`File not found: ${resolved}`);

    const fileStream = fs.createReadStream(resolved);
    const objectKey = key ?? path.basename(resolved);
    const contentType = mime.lookup(resolved) || "application/octet-stream";

    const cmd = new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: fileStream,
        ContentType: contentType,
    });

    await s3Client.send(cmd);
    return { Bucket: bucket, Key: objectKey };
}

/**
 * Multipart / resumable upload using @aws-sdk/lib-storage if available.
 * This function dynamically imports the library so it's optional at runtime.
 * It falls back to `uploadFileToS3` if `@aws-sdk/lib-storage` is not installed.
 */
export async function uploadFileMultipart(
    filePath: string,
    bucket: string,
    key?: string
): Promise<{ Bucket: string; Key: string }> {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) throw new Error(`File not found: ${resolved}`);

    const objectKey = key ?? path.basename(resolved);

    try {
        // dynamic import so we don't require the optional dependency unless used
        // @ts-ignore - optional dependency may not be installed
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Upload } = await import("@aws-sdk/lib-storage");
        const fileStream = fs.createReadStream(resolved);

        const parallelUpload = new Upload({
            client: s3Client,
            params: { Bucket: bucket, Key: objectKey, Body: fileStream },
        });

        await parallelUpload.done();
        return { Bucket: bucket, Key: objectKey };
    } catch (err: any) {
        // If lib-storage isn't installed, fall back to a simple PutObject
        if (err && /Cannot find module|ERR_MODULE_NOT_FOUND/.test(String(err.message))) {
            return uploadFileToS3(filePath, bucket, key);
        }
        throw err;
    }
}

export default {
    uploadFileToS3,
    uploadFileMultipart,
};
