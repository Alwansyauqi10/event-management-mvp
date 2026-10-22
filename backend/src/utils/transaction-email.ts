import { mailer } from "../lib/mailer.js";

type TransactionEmailParams = {
  to: string;
  customerName: string;
  eventName: string;
  transactionCode: string;
  status: "DONE" | "REJECTED";
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

export const sendTransactionStatusEmail = async ({
  to,
  customerName,
  eventName,
  transactionCode,
  status,
}: TransactionEmailParams) => {
  const accepted = status === "DONE";

  const subject = accepted
    ? `Pembayaran transaksi ${transactionCode} diterima`
    : `Transaksi ${transactionCode} ditolak`;

  const message = accepted
    ? "Pembayaran kamu telah dikonfirmasi oleh organizer. Selamat menikmati acara!"
    : "Mohon maaf, transaksi kamu ditolak oleh organizer. Silakan hubungi penyelenggara jika membutuhkan informasi lebih lanjut.";
  console.log("Mengirim email transaksi ke:", to);
  const info = await mailer.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    text: [
      `Halo ${customerName},`,
      "",
      message,
      `Nama acara: ${eventName}`,
      `Kode transaksi: ${transactionCode}`,
      `Status: ${status}`,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>${accepted ? "Transaksi Diterima" : "Transaksi Ditolak"}</h2>
        <p>Halo ${escapeHtml(customerName)},</p>
        <p>${message}</p>
        <p><strong>Nama acara:</strong> ${escapeHtml(eventName)}</p>
        <p><strong>Kode transaksi:</strong> ${escapeHtml(transactionCode)}</p>
        <p><strong>Status:</strong> ${status}</p>
      </div>
    `,
  });
  console.log("Email berhasil diserahkan ke SMTP:", info.messageId);
  console.log("Accepted:", info.accepted);
  console.log("Rejected:", info.rejected);
};
