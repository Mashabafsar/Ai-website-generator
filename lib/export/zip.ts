import archiver from "archiver";
import type { ProjectFile } from "@/lib/export/generate-project";

/** Compress a set of project files into a single ZIP buffer. */
export function filesToZip(files: ProjectFile[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("warning", (err) => {
      if ((err as { code?: string }).code !== "ENOENT") reject(err);
    });
    archive.on("error", reject);
    archive.on("end", () => resolve(Buffer.concat(chunks)));

    for (const file of files) {
      archive.append(file.content, { name: file.path });
    }

    archive.finalize().catch(reject);
  });
}
