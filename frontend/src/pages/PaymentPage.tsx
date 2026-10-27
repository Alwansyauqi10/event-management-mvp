import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { getTransactionStatus, uploadPaymentProof } from "@/services/transaction.service";

type PaymentTransaction = {
  id: string;
  transactionCode: string;
  status: string;
  totalAmount: string;
  paymentProofDeadline: string | null;
};

type PaymentPageState = {
  transaction?: PaymentTransaction;
};

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return "Upload bukti pembayaran gagal. Silakan coba lagi.";
};

const FINAL_TRANSACTION_STATUSES: string[] = [
  "DONE",
  "REJECTED",
  "EXPIRED",
  "CANCELED",
];

export default function PaymentPage() {
  const { transactionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const pageState = location.state as PaymentPageState | null;
  const transaction = pageState?.transaction;

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentStatus, setCurrentStatus] = useState(
    transaction?.status ?? "WAITING_FOR_PAYMENT",
  );

  useEffect(() => {
    if (!transactionId) return;

    if (FINAL_TRANSACTION_STATUSES.includes(currentStatus)) {
      return;
    }

    let isActive = true;

    const checkTransactionStatus = async () => {
      try {
        const latestTransaction = await getTransactionStatus(transactionId);

        if (!isActive) return;

        setCurrentStatus(latestTransaction.status);
      } catch {
        // Jika request gagal sementara, pertahankan status terakhir.
      }
    };

    void checkTransactionStatus();

    const intervalId = window.setInterval(() => {
      void checkTransactionStatus();
    }, 5000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [transactionId, currentStatus]);

  const deadline = transaction?.paymentProofDeadline
    ? new Date(transaction.paymentProofDeadline).getTime()
    : null;

  useEffect(() => {
    if (
      currentStatus !== "WAITING_FOR_PAYMENT" ||
      deadline === null ||
      !Number.isFinite(deadline)
    ) {
      setRemainingSeconds(null);
      return;
    }

    const updateCountdown = () => {
      setRemainingSeconds(
        Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
      );
    };

    updateCountdown();

    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(intervalId);
  }, [deadline, currentStatus]);

  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remaining = seconds % 60;

    return [hours, minutes, remaining]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };

  const handleFileChange = (file: File | null) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);
      setErrorMessage("File harus berformat JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);
      setErrorMessage("Ukuran file maksimal 5 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!transactionId || !transaction || !selectedFile) return;
    if (isUploading || currentStatus !== "WAITING_FOR_PAYMENT") return;

    if (deadline === null || !Number.isFinite(deadline)) {
      setErrorMessage("Deadline pembayaran tidak tersedia.");
      return;
    }

    if (Date.now() >= deadline) {
      setRemainingSeconds(0);
      setErrorMessage("Waktu pembayaran sudah habis.");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await uploadPaymentProof(transactionId, selectedFile);

      setCurrentStatus("WAITING_FOR_ADMIN_CONFIRMATION");
      setSelectedFile(null);
      setSuccessMessage(
        "Bukti pembayaran berhasil diunggah dan sedang menunggu konfirmasi admin.",
      );
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  if (!transaction || transaction.id !== transactionId) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 pb-16 pt-28">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Data pembayaran tidak tersedia
          </h1>
          <p className="mt-3 text-slate-600">
            Buka halaman pembayaran dari checkout. Jika halaman di-refresh, data
            transaksi mungkin perlu dimuat ulang dari riwayat transaksi.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Kembali ke Home
          </button>
        </div>
      </main>
    );
  }

  const isWaitingForPayment = currentStatus === "WAITING_FOR_PAYMENT";
  const isExpired = remainingSeconds !== null && remainingSeconds <= 0;
  const canUpload =
    isWaitingForPayment &&
    !isExpired &&
    remainingSeconds !== null &&
    !isUploading;

  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-16 pt-16">
      <div className="mx-auto max-w-2xl">

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Payment
        </h1>
        <p className="mt-2 text-slate-600">
          Selesaikan pembayaran dan unggah bukti transfer sebelum batas waktu.
        </p>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Kode transaksi</p>
          <p className="mt-1 break-all font-bold text-slate-900">
            {transaction.transactionCode}
          </p>

          <div className="my-5 border-t border-slate-200" />

          <p className="text-sm text-slate-500">Total pembayaran</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatPrice(transaction.totalAmount)}
          </p>

          <div className="mt-6 rounded-xl bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">
              Batas waktu pembayaran
            </p>

            {remainingSeconds === null ? (
              <p className="mt-2 text-sm text-blue-800">
                Deadline pembayaran tidak tersedia.
              </p>
            ) : (
              <p
                className={`mt-2 text-3xl font-bold tabular-nums ${
                  isExpired ? "text-red-600" : "text-blue-700"
                }`}
              >
                {formatCountdown(remainingSeconds)}
              </p>
            )}

            {isExpired && isWaitingForPayment && (
              <p className="mt-2 text-sm text-red-700">
                Waktu pembayaran telah habis. Transaksi akan mengikuti
                penanganan expiry di server.
              </p>
            )}
          </div>

          <div className="mt-6">
            <h2 className="font-semibold text-slate-900">Status transaksi</h2>
            <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
              {currentStatus}
            </p>
          </div>
        </section>

        {isWaitingForPayment && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Upload bukti pembayaran
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Unggah bukti transfer berupa gambar JPG, PNG, atau WEBP dengan
              ukuran maksimal 5 MB.
            </p>

            <label
              htmlFor="payment-proof"
              className="mt-5 block text-sm font-medium text-slate-700"
            >
              File bukti transfer
            </label>

            <input
              id="payment-proof"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={!canUpload}
              onChange={(event) =>
                handleFileChange(event.target.files?.[0] ?? null)
              }
              className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            {selectedFile && (
              <p className="mt-2 break-all text-sm text-slate-600">
                File dipilih: {selectedFile.name}
              </p>
            )}

            {errorMessage && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={!canUpload || !selectedFile}
              className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {isUploading ? "Mengunggah..." : "Upload Bukti Pembayaran"}
            </button>
          </section>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
          >
            {successMessage}
          </div>
        )}

        {currentStatus === "WAITING_FOR_ADMIN_CONFIRMATION" && (
          <section className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
            <h2 className="font-bold text-green-900">
              Bukti pembayaran sudah dikirim
            </h2>
            <p className="mt-2 text-sm leading-6 text-green-800">
              Transaksi sedang menunggu pemeriksaan admin. Status ini belum
              berarti pembayaran sudah disetujui.
            </p>
          </section>
        )}

        {currentStatus === "DONE" && (
          <section
            role="status"
            className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6"
          >
            <h2 className="font-bold text-green-900">
              Pembayaran berhasil dikonfirmasi
            </h2>
            <p className="mt-2 text-sm leading-6 text-green-800">
              Transaksi kamu sudah diterima oleh organizer.
            </p>
          </section>
        )}

        {currentStatus === "REJECTED" && (
          <section
            role="status"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <h2 className="font-bold text-red-900">Pembayaran ditolak</h2>
            <p className="mt-2 text-sm leading-6 text-red-800">
              Bukti pembayaran kamu ditolak oleh organizer. Silakan periksa
              detail transaksi atau hubungi organizer.
            </p>
          </section>
        )}

        {currentStatus === "EXPIRED" && (
          <section
            role="status"
            className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6"
          >
            <h2 className="font-bold text-amber-900">Transaksi kedaluwarsa</h2>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              Batas waktu pembayaran sudah berakhir dan transaksi tidak dapat
              dilanjutkan.
            </p>
          </section>
        )}

        {currentStatus === "CANCELED" && (
          <section
            role="status"
            className="mt-6 rounded-2xl border border-slate-200 bg-slate-100 p-6"
          >
            <h2 className="font-bold text-slate-900">Transaksi dibatalkan</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Transaksi ini sudah dibatalkan.
            </p>
          </section>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Kembali ke Home
          </button>

          <button
            type="button"
            onClick={() => navigate("/transaction/history")}
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Riwayat Transaksi
          </button>
        </div>
      </div>
    </main>
  );
}
