import {
  BadGatewayException,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dns from 'node:dns/promises';
import net from 'node:net';
import nodemailer, { Transporter } from 'nodemailer';

interface DietChartEmail {
  recipient: string;
  recipientName: string;
  date: string;
  filename: string;
  pdf: Buffer;
}

export interface DietChartEmailDelivery {
  accepted: string[];
  rejected: string[];
  messageId?: string;
  response?: string;
}

@Injectable()
export class DietChartMailService {
  private readonly logger = new Logger(DietChartMailService.name);
  private transporters?: Transporter[];

  constructor(private readonly config: ConfigService) {}

  async send({ recipient, recipientName, date, filename, pdf }: DietChartEmail) {
    const safeName = this.escapeHtml(recipientName);
    const from = this.config.get<string>('MAIL_FROM')?.trim() || 'Lose To Gain <no-reply@losetogain.app>';
    const content = this.emailContent(recipientName, safeName, date);
    const resendApiKey = this.config.get<string>('RESEND_API_KEY')?.trim();

    if (resendApiKey) {
      return this.sendWithResend({
        apiKey: resendApiKey,
        from,
        recipient,
        filename,
        pdf,
        ...content,
      });
    }

    let lastError: unknown;
    for (const transporter of this.getTransporters()) {
      try {
        const delivery = await transporter.sendMail({
          from,
          to: recipient,
          ...content,
          attachments: [{ filename, content: pdf, contentType: 'application/pdf' }],
        });
        const accepted = this.addressList(delivery.accepted);
        const rejected = this.addressList(delivery.rejected);
        if (!accepted.some((address) => address.toLowerCase() === recipient.toLowerCase())) {
          this.logger.error(
            `Diet chart email was not accepted by SMTP. Accepted: ${accepted.join(', ') || 'none'}; rejected: ${rejected.join(', ') || 'none'}`,
          );
          throw new BadGatewayException(
            'The email service did not accept the recipient address. Check the member email and SMTP settings.',
          );
        }
        if (rejected.length) {
          this.logger.warn(`SMTP rejected recipient(s): ${rejected.join(', ')}`);
        }
        this.logger.log(
          `Diet chart email accepted for ${recipient}. Message id: ${delivery.messageId || 'unavailable'}`,
        );
        return {
          accepted,
          rejected,
          messageId: delivery.messageId,
          response: delivery.response,
        } satisfies DietChartEmailDelivery;
      } catch (error) {
        if (error instanceof HttpException) throw error;
        lastError = error;
        this.logger.warn(
          `Diet chart email attempt failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    this.logger.error(
      'Unable to deliver diet chart email.',
      lastError instanceof Error ? lastError.stack : undefined,
    );
    throw new BadGatewayException(
      'The diet chart was created, but the email service could not deliver it. Try again shortly.',
    );
  }

  private async sendWithResend({
    apiKey,
    from,
    recipient,
    subject,
    text,
    html,
    filename,
    pdf,
  }: {
    apiKey: string;
    from: string;
    recipient: string;
    subject: string;
    text: string;
    html: string;
    filename: string;
    pdf: Buffer;
  }) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject,
        text,
        html,
        attachments: [
          {
            filename,
            content: pdf.toString('base64'),
          },
        ],
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { id?: string; message?: string; name?: string }
      | null;

    if (!response.ok || !payload?.id) {
      const message = payload?.message || payload?.name || response.statusText;
      this.logger.error(`Resend email API rejected the diet chart email: ${message}`);
      throw new BadGatewayException(
        `Email API could not deliver the diet chart: ${message}`,
      );
    }

    this.logger.log(`Diet chart email queued through Resend for ${recipient}. Message id: ${payload.id}`);
    return {
      accepted: [recipient],
      rejected: [],
      messageId: payload.id,
      response: `resend:${response.status}`,
    } satisfies DietChartEmailDelivery;
  }

  private emailContent(recipientName: string, safeName: string, date: string) {
    return {
      subject: `Your diet chart for ${date}`,
      text: `Hello ${recipientName}, your Lose To Gain diet chart for ${date} is attached as a PDF.`,
      html: `
      <div style="margin:0;background:#f5f8f7;padding:32px 16px;font-family:Arial,sans-serif;color:#172b2a">
        <div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dde7e5">
          <div style="background:#115e59;padding:28px 32px;color:#fff">
            <div style="font-size:11px;font-weight:700;letter-spacing:1.6px">LOSE TO GAIN</div>
            <h1 style="font-size:24px;line-height:1.25;margin:12px 0 0">Your diet chart is ready</h1>
          </div>
          <div style="padding:28px 32px">
            <p style="margin:0 0 14px">Hello ${safeName},</p>
            <p style="margin:0 0 20px;line-height:1.6;color:#657473">Your daily diet chart for <strong style="color:#172b2a">${date}</strong> is attached. It includes your meals, nutrition totals, and progress against your daily goals.</p>
            <div style="background:#dff4f0;border-radius:10px;padding:14px 16px;color:#115e59;font-size:13px">Open the attached PDF to view or print your chart.</div>
          </div>
        </div>
      </div>`,
    };
  }

  private getTransporters() {
    if (this.transporters) return this.transporters;

    const host = this.config.get<string>('MAIL_HOST');
    const port = this.config.get<number>('MAIL_PORT', 587);
    const secure = this.config.get<boolean>('MAIL_SECURE', false);
    const user = this.config.get<string>('MAIL_USER');
    const password = this.config.get<string>('MAIL_PASSWORD');
    const normalizedPassword =
      host?.includes('gmail.com') && password ? password.replace(/\s+/g, '') : password;

    if (!host) {
      throw new ServiceUnavailableException(
        'Email delivery is not configured. Set MAIL_HOST and the related SMTP settings.',
      );
    }
    if ((user && !password) || (!user && password)) {
      throw new ServiceUnavailableException(
        'Email delivery credentials are incomplete. Set both MAIL_USER and MAIL_PASSWORD.',
      );
    }

    const transportConfigs = [{ port, secure }];
    if (host.includes('gmail.com') && port === 587 && !secure) {
      transportConfigs.push({ port: 465, secure: true });
    }

    this.transporters = transportConfigs.map((transport) =>
      this.createTransporter(host, transport.port, transport.secure, user, normalizedPassword),
    );
    return this.transporters;
  }

  private createTransporter(
    host: string,
    port: number,
    secure: boolean,
    user?: string,
    password?: string,
  ) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS: !secure,
      ...(user && password ? { auth: { user, pass: password } } : {}),
      getSocket: (
        _options: unknown,
        callback: (
          error: Error | null,
          socketOptions?: { connection: net.Socket; servername: string },
        ) => void,
      ) => {
        this.openIpv4Socket(host, port)
          .then((connection) =>
            callback(null, {
              connection,
              servername: host,
            }),
          )
          .catch((error: unknown) =>
            callback(error instanceof Error ? error : new Error(String(error))),
          );
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }

  private async openIpv4Socket(host: string, port: number) {
    const addresses = net.isIP(host) === 4 ? [host] : await dns.resolve4(host);
    if (!addresses.length) {
      throw new ServiceUnavailableException(
        `Email delivery could not resolve an IPv4 address for ${host}.`,
      );
    }

    let lastError: unknown;
    for (const address of addresses) {
      try {
        return await this.connectSocket(address, port);
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `SMTP IPv4 connection to ${address}:${port} failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(`Unable to connect to ${host}:${port} over IPv4.`);
  }

  private connectSocket(address: string, port: number) {
    return new Promise<net.Socket>((resolve, reject) => {
      const socket = net.connect({ host: address, port, family: 4 });
      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error(`SMTP IPv4 connection to ${address}:${port} timed out.`));
      }, 10_000);

      socket.once('connect', () => {
        clearTimeout(timeout);
        socket.setKeepAlive(true);
        resolve(socket);
      });
      socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  private escapeHtml(value: string) {
    return value.replace(/[&<>'"]/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      };
      return entities[character];
    });
  }

  private addressList(value: unknown) {
    return Array.isArray(value)
      ? value.map((item) => String(item)).filter(Boolean)
      : [];
  }
}
