import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "Alpha-Drivers <noreply@alpha-drivers.cm>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    // Email not configured — skip silently in dev
    return;
  }

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch {
    // Email delivery failure should not block operations
  }
}

// === Notification Templates ===

export async function sendBookingPaidNotification(params: {
  driverEmail: string;
  driverName: string;
  bookingId: string;
  clientName: string;
  date: string;
  amount: string;
}) {
  await sendEmail({
    to: params.driverEmail,
    subject: `Nouvelle réservation payée - ${params.clientName}`,
    html: `
      <h2>Bonjour ${params.driverName},</h2>
      <p>Une nouvelle réservation a été payée par <strong>${params.clientName}</strong>.</p>
      <ul>
        <li><strong>Date:</strong> ${params.date}</li>
        <li><strong>Montant:</strong> ${params.amount}</li>
        <li><strong>Réf:</strong> #${params.bookingId.slice(-6)}</li>
      </ul>
      <p>Connectez-vous à votre tableau de bord pour confirmer la réservation.</p>
      <p>— L'équipe Alpha-Drivers</p>
    `,
  });
}

export async function sendBookingConfirmedNotification(params: {
  clientEmail: string;
  clientName: string;
  driverName: string;
  date: string;
}) {
  await sendEmail({
    to: params.clientEmail,
    subject: `Réservation confirmée par ${params.driverName}`,
    html: `
      <h2>Bonjour ${params.clientName},</h2>
      <p>Votre réservation a été confirmée par <strong>${params.driverName}</strong>.</p>
      <p><strong>Date:</strong> ${params.date}</p>
      <p>Le chauffeur sera au point de rendez-vous à l'heure convenue.</p>
      <p>— L'équipe Alpha-Drivers</p>
    `,
  });
}

export async function sendPayoutCompleteNotification(params: {
  driverEmail: string;
  driverName: string;
  amount: string;
  bookingId: string;
}) {
  await sendEmail({
    to: params.driverEmail,
    subject: `Paiement reçu - ${params.amount}`,
    html: `
      <h2>Bonjour ${params.driverName},</h2>
      <p>Le paiement de <strong>${params.amount}</strong> pour la course #${params.bookingId.slice(-6)} a été transféré sur votre compte Mobile Money.</p>
      <p>— L'équipe Alpha-Drivers</p>
    `,
  });
}

export async function sendPasswordResetEmail(params: {
  email: string;
  name: string;
  resetUrl: string;
}) {
  await sendEmail({
    to: params.email,
    subject: "Réinitialisation de votre mot de passe - Alpha-Drivers",
    html: `
      <h2>Bonjour ${params.name},</h2>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p><a href="${params.resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;">Réinitialiser mon mot de passe</a></p>
      <p>Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      <p>— L'équipe Alpha-Drivers</p>
    `,
  });
}

export async function sendDriverVerifiedNotification(params: {
  driverEmail: string;
  driverName: string;
}) {
  await sendEmail({
    to: params.driverEmail,
    subject: "Votre profil a été vérifié - Alpha-Drivers",
    html: `
      <h2>Félicitations ${params.driverName} !</h2>
      <p>Votre profil chauffeur a été vérifié avec succès. Vous êtes maintenant visible par les clients sur Alpha-Drivers.</p>
      <p>Connectez-vous pour commencer à recevoir des réservations.</p>
      <p>— L'équipe Alpha-Drivers</p>
    `,
  });
}
