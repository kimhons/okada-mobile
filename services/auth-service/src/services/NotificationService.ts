import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { logger } from '../../../shared/utils/logger';
import { Locale } from '../../../shared/types/common';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  templateData?: Record<string, any>;
}

export interface SMSOptions {
  to: string;
  message: string;
  locale?: Locale;
}

export interface NotificationTemplate {
  subject: { [key in Locale]: string };
  text: { [key in Locale]: string };
  html?: { [key in Locale]: string };
}

export class NotificationService {
  private static emailTransporter: nodemailer.Transporter;
  private static twilioClient: twilio.Twilio;

  static {
    this.initializeServices();
  }

  private static initializeServices(): void {
    // Initialize email transporter
    if (process.env.EMAIL_PROVIDER === 'smtp') {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }

    // Initialize Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  /**
   * Send email notification
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.emailTransporter) {
      logger.error('Email service not configured');
      return false;
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Okada Platform',
          address: process.env.EMAIL_FROM || 'noreply@okada.cm'
        },
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      const result = await this.emailTransporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email', error as Error, {
        to: options.to,
        subject: options.subject
      });
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  static async sendSMS(options: SMSOptions): Promise<boolean> {
    if (!this.twilioClient) {
      logger.error('SMS service not configured');
      return false;
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: options.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: options.to
      });

      logger.info('SMS sent successfully', {
        to: options.to,
        sid: result.sid
      });

      return true;
    } catch (error) {
      logger.error('Failed to send SMS', error as Error, {
        to: options.to
      });
      return false;
    }
  }

  /**
   * Send verification code via email
   */
  static async sendVerificationEmail(
    email: string,
    code: string,
    locale: Locale = Locale.FR
  ): Promise<boolean> {
    const template = this.getVerificationEmailTemplate(code, locale);

    return this.sendEmail({
      to: email,
      subject: template.subject[locale],
      text: template.text[locale],
      html: template.html?.[locale]
    });
  }

  /**
   * Send verification code via SMS
   */
  static async sendVerificationSMS(
    phone: string,
    code: string,
    locale: Locale = Locale.FR
  ): Promise<boolean> {
    const template = this.getVerificationSMSTemplate(code, locale);

    return this.sendSMS({
      to: phone,
      message: template[locale]
    });
  }

  /**
   * Send welcome email after registration
   */
  static async sendWelcomeEmail(
    email: string,
    firstName: string,
    locale: Locale = Locale.FR
  ): Promise<boolean> {
    const template = this.getWelcomeEmailTemplate(firstName, locale);

    return this.sendEmail({
      to: email,
      subject: template.subject[locale],
      text: template.text[locale],
      html: template.html?.[locale]
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    locale: Locale = Locale.FR
  ): Promise<boolean> {
    const template = this.getPasswordResetEmailTemplate(resetToken, locale);

    return this.sendEmail({
      to: email,
      subject: template.subject[locale],
      text: template.text[locale],
      html: template.html?.[locale]
    });
  }

  /**
   * Send password reset SMS
   */
  static async sendPasswordResetSMS(
    phone: string,
    code: string,
    locale: Locale = Locale.FR
  ): Promise<boolean> {
    const template = this.getPasswordResetSMSTemplate(code, locale);

    return this.sendSMS({
      to: phone,
      message: template[locale]
    });
  }

  /**
   * Send account locked notification
   */
  static async sendAccountLockedNotification(
    email: string,
    phone: string,
    unlockTime: Date,
    locale: Locale = Locale.FR
  ): Promise<void> {
    const template = this.getAccountLockedTemplate(unlockTime, locale);

    // Send both email and SMS
    await Promise.all([
      this.sendEmail({
        to: email,
        subject: template.email.subject[locale],
        text: template.email.text[locale],
        html: template.email.html?.[locale]
      }),
      this.sendSMS({
        to: phone,
        message: template.sms[locale]
      })
    ]);
  }

  /**
   * Send suspicious activity alert
   */
  static async sendSuspiciousActivityAlert(
    email: string,
    activity: string,
    ipAddress: string,
    locale: Locale = Locale.FR
  ): Promise<boolean> {
    const template = this.getSuspiciousActivityTemplate(activity, ipAddress, locale);

    return this.sendEmail({
      to: email,
      subject: template.subject[locale],
      text: template.text[locale],
      html: template.html?.[locale]
    });
  }

  // Template methods
  private static getVerificationEmailTemplate(code: string, locale: Locale): NotificationTemplate {
    return {
      subject: {
        en: 'Verify your Okada account',
        fr: 'Vérifiez votre compte Okada'
      },
      text: {
        en: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
        fr: `Votre code de vérification est : ${code}\n\nCe code expirera dans 10 minutes.\n\nSi vous n'avez pas demandé ce code, veuillez ignorer cet e-mail.`
      },
      html: {
        en: `
          <h1>Verify your Okada account</h1>
          <p>Your verification code is:</p>
          <h2 style="color: #007A5E; font-size: 32px; letter-spacing: 5px;">${code}</h2>
          <p>This code will expire in 10 minutes.</p>
          <p><small>If you didn't request this code, please ignore this email.</small></p>
        `,
        fr: `
          <h1>Vérifiez votre compte Okada</h1>
          <p>Votre code de vérification est :</p>
          <h2 style="color: #007A5E; font-size: 32px; letter-spacing: 5px;">${code}</h2>
          <p>Ce code expirera dans 10 minutes.</p>
          <p><small>Si vous n'avez pas demandé ce code, veuillez ignorer cet e-mail.</small></p>
        `
      }
    };
  }

  private static getVerificationSMSTemplate(code: string, locale: Locale): { [key in Locale]: string } {
    return {
      en: `Your Okada verification code is ${code}. Valid for 10 minutes. Don't share this code.`,
      fr: `Votre code de vérification Okada est ${code}. Valide pendant 10 minutes. Ne partagez pas ce code.`
    };
  }

  private static getWelcomeEmailTemplate(firstName: string, locale: Locale): NotificationTemplate {
    return {
      subject: {
        en: 'Welcome to Okada Platform!',
        fr: 'Bienvenue sur la plateforme Okada !'
      },
      text: {
        en: `Hello ${firstName},\n\nWelcome to Okada! Your account has been successfully created.\n\nStart exploring our quick commerce platform designed for Cameroon.\n\nBest regards,\nThe Okada Team`,
        fr: `Bonjour ${firstName},\n\nBienvenue sur Okada ! Votre compte a été créé avec succès.\n\nCommencez à explorer notre plateforme de commerce rapide conçue pour le Cameroun.\n\nCordialement,\nL'équipe Okada`
      },
      html: {
        en: `
          <h1>Welcome to Okada Platform!</h1>
          <p>Hello ${firstName},</p>
          <p>Welcome to Okada! Your account has been successfully created.</p>
          <p>Start exploring our quick commerce platform designed for Cameroon.</p>
          <p>Best regards,<br>The Okada Team</p>
        `,
        fr: `
          <h1>Bienvenue sur la plateforme Okada !</h1>
          <p>Bonjour ${firstName},</p>
          <p>Bienvenue sur Okada ! Votre compte a été créé avec succès.</p>
          <p>Commencez à explorer notre plateforme de commerce rapide conçue pour le Cameroun.</p>
          <p>Cordialement,<br>L'équipe Okada</p>
        `
      }
    };
  }

  private static getPasswordResetEmailTemplate(resetToken: string, locale: Locale): NotificationTemplate {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    return {
      subject: {
        en: 'Reset your Okada password',
        fr: 'Réinitialisez votre mot de passe Okada'
      },
      text: {
        en: `Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this reset, please ignore this email.`,
        fr: `Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :\n\n${resetUrl}\n\nCe lien expirera dans 1 heure.\n\nSi vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.`
      },
      html: {
        en: `
          <h1>Reset your Okada password</h1>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="background: #007A5E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>Or copy this link: ${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p><small>If you didn't request this reset, please ignore this email.</small></p>
        `,
        fr: `
          <h1>Réinitialisez votre mot de passe Okada</h1>
          <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
          <a href="${resetUrl}" style="background: #007A5E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser le mot de passe</a>
          <p>Ou copiez ce lien : ${resetUrl}</p>
          <p>Ce lien expirera dans 1 heure.</p>
          <p><small>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.</small></p>
        `
      }
    };
  }

  private static getPasswordResetSMSTemplate(code: string, locale: Locale): { [key in Locale]: string } {
    return {
      en: `Your Okada password reset code is ${code}. Valid for 10 minutes. Don't share this code.`,
      fr: `Votre code de réinitialisation Okada est ${code}. Valide pendant 10 minutes. Ne partagez pas ce code.`
    };
  }

  private static getAccountLockedTemplate(unlockTime: Date, locale: Locale) {
    const unlockTimeStr = unlockTime.toLocaleString(locale === Locale.FR ? 'fr-FR' : 'en-US');

    return {
      email: {
        subject: {
          en: 'Your Okada account has been locked',
          fr: 'Votre compte Okada a été verrouillé'
        },
        text: {
          en: `Your account has been temporarily locked due to multiple failed login attempts.\n\nYour account will be automatically unlocked at: ${unlockTimeStr}\n\nIf this wasn't you, please contact support immediately.`,
          fr: `Votre compte a été temporairement verrouillé en raison de plusieurs tentatives de connexion échouées.\n\nVotre compte sera automatiquement déverrouillé à : ${unlockTimeStr}\n\nSi ce n'était pas vous, veuillez contacter le support immédiatement.`
        },
        html: {
          en: `
            <h1>Account Locked</h1>
            <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
            <p><strong>Unlock time:</strong> ${unlockTimeStr}</p>
            <p>If this wasn't you, please contact support immediately.</p>
          `,
          fr: `
            <h1>Compte verrouillé</h1>
            <p>Votre compte a été temporairement verrouillé en raison de plusieurs tentatives de connexion échouées.</p>
            <p><strong>Heure de déverrouillage :</strong> ${unlockTimeStr}</p>
            <p>Si ce n'était pas vous, veuillez contacter le support immédiatement.</p>
          `
        }
      },
      sms: {
        en: `Okada: Your account is locked until ${unlockTimeStr} due to failed login attempts. Contact support if this wasn't you.`,
        fr: `Okada: Votre compte est verrouillé jusqu'à ${unlockTimeStr} en raison de tentatives de connexion échouées. Contactez le support si ce n'était pas vous.`
      }
    };
  }

  private static getSuspiciousActivityTemplate(activity: string, ipAddress: string, locale: Locale): NotificationTemplate {
    return {
      subject: {
        en: 'Suspicious activity detected on your Okada account',
        fr: 'Activité suspecte détectée sur votre compte Okada'
      },
      text: {
        en: `We detected suspicious activity on your account:\n\nActivity: ${activity}\nIP Address: ${ipAddress}\nTime: ${new Date().toISOString()}\n\nIf this was you, you can ignore this message. Otherwise, please secure your account immediately.`,
        fr: `Nous avons détecté une activité suspecte sur votre compte :\n\nActivité : ${activity}\nAdresse IP : ${ipAddress}\nHeure : ${new Date().toISOString()}\n\nSi c'était vous, vous pouvez ignorer ce message. Sinon, veuillez sécuriser votre compte immédiatement.`
      },
      html: {
        en: `
          <h1>Suspicious Activity Detected</h1>
          <p>We detected suspicious activity on your account:</p>
          <ul>
            <li><strong>Activity:</strong> ${activity}</li>
            <li><strong>IP Address:</strong> ${ipAddress}</li>
            <li><strong>Time:</strong> ${new Date().toISOString()}</li>
          </ul>
          <p>If this was you, you can ignore this message. Otherwise, please secure your account immediately.</p>
        `,
        fr: `
          <h1>Activité suspecte détectée</h1>
          <p>Nous avons détecté une activité suspecte sur votre compte :</p>
          <ul>
            <li><strong>Activité :</strong> ${activity}</li>
            <li><strong>Adresse IP :</strong> ${ipAddress}</li>
            <li><strong>Heure :</strong> ${new Date().toISOString()}</li>
          </ul>
          <p>Si c'était vous, vous pouvez ignorer ce message. Sinon, veuillez sécuriser votre compte immédiatement.</p>
        `
      }
    };
  }
}