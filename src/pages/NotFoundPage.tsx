import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-amber-50 to-sky-100 px-4 py-12">
      <div className="max-w-xl rounded-[2rem] border border-amber-200 bg-white/90 p-10 text-center shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-600">
          404 error
        </p>
        <h1 className="mt-6 text-5xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The page you’re looking for does not exist or has been moved.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button type="button" variant="secondary">
              Back to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
