import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { join } from 'path';
import { createReadStream, existsSync, readFileSync } from 'fs';

@Injectable()
export class GoogleDriveService {
  private readonly drive: any;
  private readonly folderId: string;

  constructor() {
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

    const credentials = this.getCredentials();
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  private getCredentials(): any {
    // En Vercel: leemos de variable de entorno
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    }

    // En local: leemos del archivo en la raíz
    const filePath = join(process.cwd(), 'google-service-account.json');
    if (existsSync(filePath)) {
      const raw = readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }

    throw new Error(
      'No se encontraron las credenciales de Google Drive. ' +
      'En local: creá google-service-account.json en la raíz. ' +
      'En Vercel: agregá GOOGLE_SERVICE_ACCOUNT_JSON en Environment Variables.',
    );
  }

  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
    mimeType: string,
  ): Promise<{ fileId: string; webViewLink: string }> {
    if (!this.folderId) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID no está configurado en .env');
    }

    const response = await this.drive.files.create({
      requestBody: {
        name: fileName,
        parents: [this.folderId],
      },
      media: {
        mimeType,
        body: createReadStream(file.path),
      },
      fields: 'id, webViewLink, parents',
      supportsAllDrives: true,
    });

    return {
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
    };
  }
}
