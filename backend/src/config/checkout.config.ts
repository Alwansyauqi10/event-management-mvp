
export const CHECKOUT_CONFIG = {
  // Konversi poin ke rupiah
  POINT_VALUE_IN_RUPIAH: 1,

  // Batas tiket dalam satu transaksi
  MAX_TICKETS_PER_TRANSACTION: 10,

  // Batas gabungan diskon terhadap subtotal (persen)
  MAX_TOTAL_DISCOUNT_PERCENT: 100,

  // Tenggat pembayaran setelah transaksi dibuat
  PAYMENT_EXPIRY_MINUTES: 15,

  // Tenggat konfirmasi organizer setelah bukti pembayaran diunggah
  ADMIN_CONFIRMATION_HOURS: 24,

  // Aturan kombinasi promo
  ALLOW_COUPON_AND_VOUCHER: true,
  ALLOW_POINTS_WITH_PROMO: true,
} as const;
