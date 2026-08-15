import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-center font-display text-3xl font-bold text-teal">Welcome Back</h1>
      <p className="mt-2 text-center text-sm text-secondary">Log in to your Mohini Artistry account.</p>
      <div className="mt-8 rounded-2xl border border-hairline p-6">
        <LoginForm onSuccess={() => navigate("/account")} />
      </div>
      <p className="mt-6 text-center text-sm text-secondary">
        New here?{" "}
        <Link to="/register" className="font-semibold text-turquoise underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
