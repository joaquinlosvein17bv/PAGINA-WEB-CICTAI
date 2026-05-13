import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendVoucherEmail(email: string, nombre: string, voucherCode: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('MAIL_FROM'),
        to: email,
        subject: 'Confirmación de Inscripción — CICTAI 2026',
        html: `
          <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 0 20px rgba(0,0,0,0.1);font-family:Arial,sans-serif;">
            <div style="background:#002b5b;color:#d4a843;padding:30px;text-align:center;">
              <h1 style="margin:0;font-size:24px;color:#fff;"><span style="color:#d4a843;">CICTAI</span> 2026</h1>
              <p style="color:#fff;margin:5px 0 0;font-size:14px;">I Congreso Internacional — UNTELS</p>
            </div>
            <div style="padding:30px;color:#333;">
              <p>Estimado/a <strong>${nombre}</strong>,</p>
              <p>Su inscripción al <strong>CICTAI 2026</strong> ha sido confirmada exitosamente.</p>
              <div style="background:#f0f7ff;border:2px dashed #002b5b;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
                <p style="margin:0;font-size:14px;color:#666;">Su código de validación es:</p>
                <h2 style="font-size:28px;letter-spacing:3px;color:#002b5b;margin:10px 0;">${voucherCode}</h2>
                <p style="margin:10px 0 0;font-size:12px;color:#999;">Use este código para acceder a los recursos del evento.</p>
              </div>
              <p style="font-size:14px;color:#666;">Fecha del evento: <strong>25 y 26 de junio de 2026</strong></p>
              <p style="font-size:14px;color:#666;">Modalidad: <strong>Híbrida</strong></p>
            </div>
            <div style="background:#f8f8f8;padding:20px;text-align:center;font-size:12px;color:#999;">
              <p>© 2026 UNTELS — Facultad de Ingeniería de Sistemas Computacionales</p>
            </div>
          </div>
        `,
      });
      console.log(`Correo enviado a ${email} con código ${voucherCode}`);
    } catch (error) {
      console.error(`Error al enviar correo a ${email}:`, error.message);
    }
  }
}
