"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/services/authService";
import AuthShell from "@/components/AuthShell";
import { ErrorNote, Field, Icon, PasswordToggle, PillButton, PillLink } from "@/components/ui";

const MAX_PASSWORD_BYTES = 72; // bcrypt limit, enforced by the backend too

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="New password"
      title={
        <>
          Choose a
          <br />
          <em className="text-sage">new password.</em>
        </>
      }
      lede="Pick something you haven’t used here before. You’ll sign in with it right after."
      footer={
        <>
          Link not working?{" "}
          <Link href="/forgot-password" className="text-ink underline decoration-ink/20 underline-offset-4 transition-colors duration-500 ease-spring hover:decoration-ink">
            Request a new one
          </Link>
        </>
      }
    >
      {/* useSearchParams needs a Suspense boundary for static rendering */}
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState({ next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="space-y-5">
        <ErrorNote>This page needs the link from your reset email. Please request a new one.</ErrorNote>
        <PillLink href="/forgot-password" icon="mail" className="w-full">Request a reset link</PillLink>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-5" role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-soft text-sage">
          <Icon name="check" className="w-5 h-5" strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Password updated</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">You can now sign in with your new password.</p>
        </div>
        <PillLink href="/login" className="w-full">Go to sign in</PillLink>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
      setError(`Password is too long (max ${MAX_PASSWORD_BYTES} bytes)`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-semibold tracking-tight">Set a new password</h2>

      {error && <ErrorNote>{error}</ErrorNote>}

      <Field
        id="newPassword"
        label="New password"
        hint="6+ chars"
        icon="lock"
        type={show.next ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        disabled={loading}
        autoComplete="new-password"
        trailing={<PasswordToggle shown={show.next} onToggle={() => setShow({ ...show, next: !show.next })} disabled={loading} />}
      />
      <Field
        id="confirmPassword"
        label="Confirm password"
        icon="check"
        type={show.confirm ? "text" : "password"}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        minLength={6}
        disabled={loading}
        autoComplete="new-password"
        trailing={<PasswordToggle shown={show.confirm} onToggle={() => setShow({ ...show, confirm: !show.confirm })} disabled={loading} />}
      />

      <PillButton
        type="submit"
        icon="lock"
        loading={loading}
        disabled={loading || !password || !confirm}
        className="w-full !mt-7"
      >
        {loading ? "Saving…" : "Save new password"}
      </PillButton>
    </form>
  );
}
