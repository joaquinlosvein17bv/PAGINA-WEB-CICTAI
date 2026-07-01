import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';
import { createReadStream, existsSync, unlinkSync } from 'fs';

@Injectable()
export class GoogleDriveService {
  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
    _mimeType: string,
  ): Promise<{ fileId: string; webViewLink: string }> {
    // En Vercel: usamos Blob Storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(fileName, createReadStream(file.path), {
        access: 'public',
        contentType: 'application/pdf',
      });

      // Limpiar archivo temporal
      try { if (existsSync(file.path)) unlinkSync(file.path); } catch {}

      return {
        fileId: blob.url,
        webViewLink: blob.url,
      };
    }

    // Fallback: guardar localmente (solo para desarrollo)
    // En Vercel los archivos en /tmp son efímeros
    return {
      fileId: file.path || 'local',
      webViewLink: file.path || 'local',
    };
  }
}
