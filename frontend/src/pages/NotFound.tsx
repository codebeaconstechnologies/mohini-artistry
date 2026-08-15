import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-bold text-teal">404</h1>
      <p className="text-secondary">We couldn't find the page you were looking for.</p>
      <Link to="/" className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-hover">
        Back to Home
      </Link>
    </div>
  );
}
