"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { forgotPassword } from "@/services/authService";
import AuthShell from "@/components/AuthShell";
import { ErrorNote, Field, Icon, PillButton } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email.trim());
      setSentTo(email.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Forgot password"
      title={
        <>
          It happens.
          <br />
          <em className="text-sage">Let’s reset it.</em>
        </>
      }
      lede="Enter the email you signed up with and we’ll send you a link to choose a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-ink underline decoration-ink/20 underline-offset-4 transition-colors duration-500 ease-spring hover:decoration-ink">
            Back to sign in
          </Link>
        </>
      }
    >
      {sentTo ? (
        <div className="space-y-5" role="status">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-soft text-sage">
            <Icon name="mail" className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Check your inbox</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              If an account exists for <span className="text-ink">{sentTo}</span>, a reset link is on its way. It works once
              and expires in 30 minutes. Don’t forget to check your spam folder.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="text-sm text-ink-soft underline decoration-ink/20 underline-offset-4 transition-colors duration-500 ease-spring hover:text-ink"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-semibold tracking-tight">Reset your password</h2>

          {error && <ErrorNote>{error}</ErrorNote>}

          <Field
            id="email"
            label="Email"
            icon="mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <PillButton type="submit" icon="mail" disabled={loading || !email.trim()} loading={loading} className="w-full">
            {loading ? "Sending…" : "Send reset link"}
          </PillButton>
        </form>
      )}
    </AuthShell>
  );
}
