import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export async function saveUpload(
  file: File,
  subdir: string,
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".bin";
  const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
  const name = `${crypto.randomUUID()}${safeExt}`;
  const dir = path.join(UPLOAD_ROOT, subdir);
  await fs.mkdir(dir, { recursive: true });
  const fullPath = path.join(dir, name);
  await fs.writeFile(fullPath, buffer);
  return `/uploads/${subdir}/${name}`;
}
