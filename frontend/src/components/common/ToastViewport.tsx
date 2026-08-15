import { useUiStore, type ToastType } from "../../store/uiStore";

const TYPE_CLASSES: Record<ToastType, string> = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-teal",
};

export default function ToastViewport() {
  const toasts = useUiStore((s) => s.toasts);
  const dismissToast = useUiStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-[70] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:left-5 sm:translate-x-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          onClick={() => dismissToast(toast.id)}
          className={`cursor-pointer rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${TYPE_CLASSES[toast.type]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
