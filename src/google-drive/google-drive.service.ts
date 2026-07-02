import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { put } from '@vercel/blob';
import { createReadStream, existsSync, unlinkSync, copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class GoogleDriveService {
  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
    _mimeType: string,
  ): Promise<{ fileId: string; webViewLink: string }> {
    // ─── Producción: Vercel Blob ────────────────────────────────
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
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
      } catch (error: any) {
        console.error('[UploadService] Error al subir a Vercel Blob:', error?.message ?? error);
        throw new InternalServerErrorException(
          `Error al subir el archivo a Vercel Blob: ${error?.message ?? 'desconocido'}. Verificá que BLOB_READ_WRITE_TOKEN sea válido.`,
        );
      }
    }

    // ─── En Vercel pero sin token → error claro ─────────────────
    if (process.env.VERCEL) {
      throw new InternalServerErrorException(
        'Falta configurar BLOB_READ_WRITE_TOKEN. Andá a Vercel Dashboard → Storage → Create Blob Database, copiá el token y agregalo en las Environment Variables del proyecto.',
      );
    }

    // ─── Desarrollo local: guardar en public/uploads/bouchers/ ──
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'bouchers');

    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const destPath = join(uploadsDir, fileName);

    try {
      copyFileSync(file.path, destPath);
    } catch (error: any) {
      console.error('[UploadService] Error al copiar archivo:', error?.message ?? error);
      throw new InternalServerErrorException(
        `Error al guardar el archivo localmente: ${error?.message ?? 'desconocido'}. ` +
        `Origen: ${file?.path}, destino: ${destPath}`,
      );
    }

    try { if (existsSync(file.path)) unlinkSync(file.path); } catch {}

    const url = `/uploads/bouchers/${fileName}`;

    return {
      fileId: url,
      webViewLink: url,
    };
  }
}
