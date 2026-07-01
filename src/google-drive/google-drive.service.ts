import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, copyFileSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class GoogleDriveService {
  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
    _mimeType: string,
  ): Promise<{ fileId: string; webViewLink: string }> {
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'bouchers');

    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const destPath = join(uploadsDir, fileName);

    copyFileSync(file.path, destPath);

    try { if (existsSync(file.path)) unlinkSync(file.path); } catch {}

    const url = `/uploads/bouchers/${fileName}`;

    return {
      fileId: url,
      webViewLink: url,
    };
  }
}
