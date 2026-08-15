import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";

export default function Register() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-center font-display text-3xl font-bold text-teal">Create Your Account</h1>
      <p className="mt-2 text-center text-sm text-secondary">Join Mohini Artistry for a faster checkout and order tracking.</p>
      <div className="mt-8 rounded-2xl border border-hairline p-6">
        <RegisterForm onSuccess={() => navigate("/account")} />
      </div>
      <p className="mt-6 text-center text-sm text-secondary">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-turquoise underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
