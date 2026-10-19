import { Link } from "react-router";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
      {/* Ilustrasi atau Angka 404 Besar */}
      <h1 className="text-9xl font-extrabold text-indigo-600 tracking-widest animate-pulse">
        404
      </h1>

      <div className="bg-indigo-500 px-2 text-sm rounded rotate-12 absolute text-white font-semibold">
        Halaman Tidak Ditemukan
      </div>

      {/* Pesan Penjelasan */}
      <div className="mt-8">
        <h2 className="text-3xl font-bold text-gray-800 md:text-4xl">
          Oops! Tersesat di dunia digital?
        </h2>
        <p className="mt-3 text-gray-600 max-w-md mx-auto">
          Sepertinya halaman yang Anda cari telah dipindahkan, dihapus, atau
          mungkin tidak pernah ada.
        </p>
      </div>

      {/* Tombol Navigasi Kembali */}
      <div className="mt-8 flex gap-4">
        <Link
          to="/"
          className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Kembali ke Beranda
        </Link>

        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg shadow-sm hover:bg-indigo-50 transition duration-200"
        >
          Halaman Sebelumnya
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
