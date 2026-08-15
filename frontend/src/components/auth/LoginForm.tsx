import { useState, type FormEvent } from "react";
import { loginSchema } from "@mohini-artistry/shared";
import { useAuthStore } from "../../store/authStore";
import { ApiClientError } from "../../api/client";

export default function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }
    setIsSubmitting(true);
    try {
      await login(parsed.data);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-teal">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-teal">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-hairline px-3 py-2 text-sm focus:border-magenta focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-magenta py-2.5 text-sm font-semibold text-white transition-colors hover:bg-magenta-hover disabled:opacity-50"
      >
        {isSubmitting ? "Logging in…" : "Log In"}
      </button>
    </form>
  );
}
