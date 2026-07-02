import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { existsSync, copyFileSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class GoogleDriveService {
  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
    _mimeType: string,
  ): Promise<{ fileId: string; webViewLink: string }> {
    // ─── En Vercel → no hay disco persistente ───────────────────
    if (process.env.VERCEL) {
      throw new InternalServerErrorException(
        'En Vercel no se puede guardar archivos localmente porque no hay disco persistente. ' +
        'Configurá un servicio externo como Vercel Blob, Google Drive o Cloudinary y ajustá esta función.',
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

    // Limpiar archivo temporal de Multer
    try { if (existsSync(file.path)) unlinkSync(file.path); } catch {}

    const url = `/uploads/bouchers/${fileName}`;

    return {
      fileId: url,
      webViewLink: url,
    };
  }
}
