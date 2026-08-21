import { useState, type FormEvent } from "react";
import { registerSchema } from "@mohini-artistry/shared";
import { useAuthStore } from "../../store/authStore";
import { ApiClientError } from "../../api/client";

export default function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const register = useAuthStore((s) => s.register);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = registerSchema.safeParse({
      fullName,
      email,
      password,
      phone: phone.trim() || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }
    setIsSubmitting(true);
    try {
      await register(parsed.data);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="register-name" className="mb-1 block text-sm font-medium text-teal">
          Full name
        </label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="register-email" className="mb-1 block text-sm font-medium text-teal">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="register-phone" className="mb-1 block text-sm font-medium text-teal">
          Phone <span className="font-normal text-secondary">(optional)</span>
        </label>
        <input
          id="register-phone"
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          maxLength={10}
          pattern="[6-9]\d{9}"
          className="w-full rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-teal">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none"
        />
        <p className="mt-1 text-xs text-secondary">At least 8 characters.</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-magenta py-2.5 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover disabled:opacity-50"
      >
        {isSubmitting ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
