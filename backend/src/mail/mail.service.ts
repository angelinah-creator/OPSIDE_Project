import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) { }

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

  async sendMatchConfirmationEmail(email: string, role: 'candidate' | 'client', partnerName: string, projectName?: string) {
    const subject = role === 'candidate' ? 'Match confirmé ! — OPSIDE' : 'Match confirmé — Nouveau candidat';
    const message = role === 'candidate'
      ? `Félicitations ! Votre match avec <strong>${partnerName}</strong> est confirmé${projectName ? ` pour le projet <strong>${projectName}</strong>` : ''}.<br/><br/>Le client va prochainement vous contacter pour la suite du processus. Restez disponible !`
      : `Le candidat <strong>${partnerName}</strong> a accepté votre invitation${projectName ? ` pour le projet <strong>${projectName}</strong>` : ''}.<br/><br/>Vous pouvez maintenant envoyer un test technique ou vous fier au score plateforme pour valider le profil. Connectez-vous à votre dashboard pour la suite.`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;"> Match Confirmé !</h2>
          <p>${message}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get('FRONTEND_URL')}/${role === 'candidate' ? 'candidat' : 'client'}/dashboard" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accéder à mon dashboard</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 OPSIDE. Tous droits réservés.</p>
        </div>
      `,
    });
  }

  async sendCustomTestInvitationEmail(
    email: string,
    companyName: string,
    projectName: string,
    skillsTested: string[],
    durationMinutes: number,
    customInstructions?: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Test technique reçu — ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Test technique envoyé par ${companyName}</h2>
          <p>Bonjour,</p>
          <p>Dans le cadre du projet <strong>${projectName}</strong>, <strong>${companyName}</strong> vous a envoyé un test technique à réaliser.</p>
          <ul>
            <li><strong>Compétences évaluées :</strong> ${skillsTested.join(', ')}</li>
            <li><strong>Durée :</strong> ${durationMinutes} minutes</li>
            ${customInstructions ? `<li><strong>Instructions :</strong> ${customInstructions}</li>` : ''}
          </ul>
          <p>Connectez-vous à votre dashboard pour démarrer le test.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get('FRONTEND_URL')}/candidat/dashboard" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Voir le test</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 OPSIDE. Tous droits réservés.</p>
        </div>
      `,
    });
  }

  async sendCustomTestResultEmail(
    email: string,
    role: 'candidate' | 'client',
    score: number,
    passed: boolean,
    partnerName: string,
    projectName?: string,
  ) {
    const subject = passed
      ? `  Test réussi — ${projectName || 'OPSIDE'}`
      : `❌ Test non validé — ${projectName || 'OPSIDE'}`;

    const message = role === 'candidate'
      ? passed
        ? `Félicitations ! Vous avez obtenu un score de <strong>${score}%</strong> au test technique pour le projet <strong>${projectName || ''}</strong>. Le client va vous contacter très prochainement pour fixer un entretien.`
        : `Vous avez obtenu un score de <strong>${score}%</strong> au test technique (seuil : 75%). Malheureusement, votre candidature pour le projet <strong>${projectName || ''}</strong> n'a pas pu être retenue. Bon courage pour la suite !`
      : passed
        ? `Le candidat a réussi le test avec un score de <strong>${score}%</strong> pour le projet <strong>${projectName || ''}</strong>. Un lien de prise de rendez-vous a été envoyé au candidat.`
        : `Le candidat n'a pas atteint le seuil de 75% (score : <strong>${score}%</strong>) pour le projet <strong>${projectName || ''}</strong>. Vous pouvez proposer un retest (1 seule fois) depuis votre dashboard.`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: ${passed ? '#16a34a' : '#dc2626'}; text-align: center;">${passed ? '  Test Réussi !' : '❌ Test Non Validé'}</h2>
          <p>${message}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get('FRONTEND_URL')}/${role === 'candidate' ? 'candidat' : 'client'}/dashboard" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Mon dashboard</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 OPSIDE. Tous droits réservés.</p>
        </div>
      `,
    });
  }

  async sendCalendlyLinkEmail(
    candidateEmail: string,
    companyName: string,
    projectName?: string,
    calendlyUrl?: string,
  ) {
    const link = calendlyUrl || 'https://calendly.com/opside';
    await this.mailerService.sendMail({
      to: candidateEmail,
      subject: ` Prenez rendez-vous avec ${companyName} — OPSIDE`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Planifiez votre entretien !</h2>
          <p>Bonjour,</p>
          <p>Suite à votre validation du test technique${projectName ? ` pour le projet <strong>${projectName}</strong>` : ''}, <strong>${companyName}</strong> vous invite à planifier un entretien.</p>
          <p>Cliquez sur le bouton ci-dessous pour choisir un créneau :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">Prendre rendez-vous</a>
          </div>
          <p style="font-size: 14px; color: #666;">Si le bouton ne fonctionne pas, copiez ce lien : ${link}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 OPSIDE. Tous droits réservés.</p>
        </div>
      `,
    });
  }

  async sendWorkspaceInvitationEmail(
    candidateEmail: string,
    companyName: string,
    projectName?: string,
  ) {
    await this.mailerService.sendMail({
      to: candidateEmail,
      subject: `Bienvenue dans le Workspace de ${companyName} !`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #16a34a; text-align: center;">Collaboration démarrée !</h2>
          <p>Bonjour,</p>
          <p>Excellente nouvelle ! Suite à vos entretiens, <strong>${companyName}</strong> a décidé de collaborer avec vous${projectName ? ` sur le projet <strong>${projectName}</strong>` : ''}.</p>
          <p>Votre espace <strong>Workspace</strong> vient d'être débloqué sur la plateforme OPSIDE.</p>
          <p>Vous pouvez dès maintenant y accéder pour gérer votre Time Tracking, vos factures et vos contrats liés à cette mission.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get('FRONTEND_URL')}/candidat/workspace" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">Accéder à mon Workspace</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 OPSIDE. Tous droits réservés.</p>
        </div>
      `,
    });
  }


  async sendSourcingInvitationEmail(email: string, clientName: string, projectName: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Invitation pour le projet : ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Nouvelle opportunité sur OPSIDE</h2>
          <p>Bonjour,</p>
          <p>L'entreprise <strong>${clientName}</strong> a été séduite par votre profil et souhaite vous inviter à découvrir leur projet : <strong>${projectName}</strong>.</p>
          <p>Connectez-vous à votre dashboard pour accepter ou refuser cette invitation.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get('FRONTEND_URL')}/candidat/dashboard" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Voir l'invitation</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 OPSIDE. Tous droits réservés.</p>
        </div>
      `,
    });
  }

  async sendMatchDecisionEmail(email: string, partnerName: string, decision: 'accepted' | 'refused', projectName?: string) {
    const subject = decision === 'accepted' ? 'Invitation acceptée !' : 'Invitation déclinée';
    const message = decision === 'accepted'
      ? `Le candidat <strong>${partnerName}</strong> a accepté votre invitation pour le projet <strong>${projectName || 'votre offre'}</strong>.`
      : `Le candidat <strong>${partnerName}</strong> a décliné votre invitation pour le projet <strong>${projectName || 'votre offre'}</strong>.`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">${subject}</h2>
          <p>${message}</p>
          <p>Connectez-vous à votre dashboard pour plus de détails.</p>
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

  async sendNewCandidatureEmail(email: string, candidateName: string, jobTitle: string, message?: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Nouvelle candidature pour : ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Nouvelle candidature reçue</h2>
          <p>Bonjour,</p>
          <p>Le candidat <strong>${candidateName}</strong> vient de postuler à votre offre : <strong>${jobTitle}</strong>.</p>
          <p>Connectez-vous à votre dashboard pour consulter son profil et prendre une décision.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get('FRONTEND_URL')}/client/dashboard" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Voir la candidature</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 OPSIDE. Tous droits réservés.</p>
        </div>
      `,
    });
  }
}
