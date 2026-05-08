import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendVerificationEmail(email: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const url = `${frontendUrl}/auth/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Validez votre adresse e-mail - OPSIDE',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Bienvenue chez OPSIDE</h2>
          <p>Merci de vous être inscrit ! Pour terminer la création de votre compte, veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Vérifier mon e-mail</a>
          </div>
          <p style="font-size: 14px; color: #666;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="font-size: 14px; color: #666; word-break: break-all;">${url}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">Si vous n'avez pas créé de compte sur OPSIDE, vous pouvez ignorer cet e-mail.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const url = `${frontendUrl}/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - OPSIDE',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé une réinitialisation de votre mot de passe pour votre compte OPSIDE. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Réinitialiser mon mot de passe</a>
          </div>
          <p style="font-size: 14px; color: #666;">Ce lien expirera dans une heure. Si vous n'avez pas demandé ce changement, vous pouvez ignorer cet e-mail.</p>
          <p style="font-size: 14px; color: #666;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="font-size: 14px; color: #666; word-break: break-all;">${url}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 OPSIDE. Tous droits réservés.</p>
        </div>
      `,
    });
  }

  async sendMatchConfirmationEmail(email: string, role: 'candidate' | 'client', partnerName: string) {
    const subject = role === 'candidate' ? 'Match confirmé - Entretien OPSIDE' : 'Match confirmé - Nouveau candidat';
    const message = role === 'candidate' 
      ? `Félicitations ! Votre match avec <strong>${partnerName}</strong> est confirmé. Voici le lien de l'entretien : <a href="https://calendly.com/opside">Calendly OPSIDE</a>`
      : `Le candidat <strong>${partnerName}</strong> a accepté votre invitation. Nous vous contacterons bientôt pour organiser l'entretien.`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Match Confirmé !</h2>
          <p>${message}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 OPSIDE. Tous droits réservés.</p>
        </div>
      `,
    });
  }

  async sendCandidatureRejectionEmail(email: string, jobTitle: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Mise à jour de votre candidature - ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Mise à jour de votre candidature</h2>
          <p>Bonjour,</p>
          <p>Nous vous remercions de l'intérêt que vous avez porté à l'offre <strong>${jobTitle}</strong>.</p>
          <p>Après étude de votre dossier, nous avons le regret de vous informer que votre candidature n'a pas été retenue pour ce poste.</p>
          <p>Nous conservons néanmoins votre profil dans notre base de données et n'hésiterons pas à vous recontacter si une opportunité correspondant à votre profil se présentait.</p>
          <p>Bonne chance dans vos recherches.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 OPSIDE. Tous droits réservés.</p>
        </div>
      `,
    });
  }
}
