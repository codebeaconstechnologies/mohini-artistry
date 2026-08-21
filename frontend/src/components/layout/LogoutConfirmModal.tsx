export default function LogoutConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div className="relative w-full max-w-sm rounded-2xl bg-softwhite p-6 shadow-2xl">
        <h2 className="font-display text-lg font-semibold text-teal">Log out?</h2>
        <p className="mt-1 text-sm text-secondary">Are you sure you want to log out of your account?</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-hairline px-4 py-2 text-sm font-semibold text-secondary hover:bg-cream"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-magenta px-4 py-2 text-sm font-semibold text-white hover:bg-magenta-hover"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
