import nodemailer from 'nodemailer';

import { env } from '../config/env';
import { logger } from './logger';

export class EmailService {
  async sendPurchaseConfirmation(email: string, userName: string, total: number): Promise<void> {
    if (!env.smtp.host || !env.smtp.user || !env.smtp.password) {
      logger.info('SMTP not configured; skipping purchase confirmation email');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        password: env.smtp.password,
      },
    } as nodemailer.TransportOptions);

    await transporter.sendMail({
      from: env.smtp.from || env.smtp.user,
      to: email,
      subject: 'Confirmación de compra - Sports Ecommerce',
      html: `
        <h2>¡Gracias por tu compra, ${userName}!</h2>
        <p>Tu pedido fue confirmado correctamente.</p>
        <p>Total: $${total.toFixed(2)}</p>
      `,
    });
  }
}
