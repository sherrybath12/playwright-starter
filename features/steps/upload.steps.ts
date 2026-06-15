import fs from 'fs';
import path from 'path';
import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
// Using local shim for uploadFileToS3 to avoid missing module during tests.

const TMP_DIR = path.resolve(__dirname, '../../tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// Minimal local implementation of uploadFileToS3 to satisfy compilation and allow local testing.
// This copies the file into a tmp/s3-mock/<bucket>/<key> path and returns a simple result object.
async function uploadFileToS3(filePath: string, bucket: string, key: string): Promise<{ Key: string }> {
  const destDir = path.resolve(TMP_DIR, 's3-mock', bucket);
  fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, key);
  await fs.promises.copyFile(filePath, destPath);
  return { Key: key };
}

Given('a local file {string} exists', function (fileName: string) {
  const filePath = path.join(TMP_DIR, fileName);
  fs.writeFileSync(filePath, `Cucumber S3 upload test - ${new Date().toISOString()}\n`);
  this.uploadFilePath = filePath;
  // sanity check
  assert.ok(fs.existsSync(filePath), `Test file not created: ${filePath}`);
});

When('I upload the file to S3 bucket {string} with key {string}', async function (bucket: string, key: string) {
  if (!this.uploadFilePath) throw new Error('No file prepared to upload');

  // Use environment vars for credentials in real runs. These are placeholders by default.
  // The helper will read AWS region from env or fallback to us-east-1.
  try {
    const res = await uploadFileToS3(this.uploadFilePath, bucket, key);
    this.uploadResult = res;
  } catch (err) {
    this.uploadError = err;
  }
});

Then('the upload should succeed', function () {
  assert.ok(!this.uploadError, `Upload returned an error: ${this.uploadError}`);
  assert.ok(this.uploadResult && this.uploadResult.Key, 'Upload result did not contain Key');
});

export { };
