import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../services/authService";
import { Button } from "../components/ui/Button";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const onGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-sky-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[2rem] border border-amber-200/80 bg-white/90 p-8 shadow-soft backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">
            Hostel Expense Manager
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with Google to access your expense dashboard.
          </p>
        </div>
        {error && (
          <p className="mb-6 text-center text-sm text-rose-500">{error}</p>
        )}
        <Button
          type="button"
          variant="primary"
          className="w-full"
          onClick={onGoogleSignIn}
        >
          <span className="text-base font-semibold">Sign in with Google</span>
        </Button>
      </div>
    </main>
  );
}
