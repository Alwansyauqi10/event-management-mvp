type LogoutButtonProps = {
  onClick: () => void;
};

function LogoutButton({ onClick }: LogoutButtonProps) {
  return (
    <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
      <button
        onClick={onClick}
        className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
      >
        Logout
      </button>
    </div>
  );
}

export default LogoutButton;
