"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/services/authService";
import { tokenStorage } from "@/services/authService";
import AuthShell from "@/components/AuthShell";
import { ErrorNote, Field, PasswordToggle, PillButton } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = tokenStorage.getToken();
    if (token) {
      // User is already logged in, redirect to todo page
      router.push("/todo");
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await signIn({ email, password });

      // Store token and user data
      tokenStorage.setToken(response.access_token);
      tokenStorage.setUser(response.user);

      // Redirect to todo page
      router.push("/todo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title={
        <>
          Pick up
          <br />
          <em className="text-sage">where you left off.</em>
        </>
      }
      lede="Your list kept its place. Sign in and carry on with the day."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="text-ink underline decoration-ink/20 underline-offset-4 transition-colors duration-500 ease-spring hover:decoration-ink">
            Create an account
          </Link>
          <span className="mx-3 text-ink/20">·</span>
          <Link href="/" className="transition-colors duration-500 ease-spring hover:text-ink">
            Back to home
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">Sign in</h2>

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

        <Field
          id="password"
          label="Password"
          icon="lock"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          placeholder="Your password"
          autoComplete="current-password"
          trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} disabled={loading} />}
        />
        <div className="-mt-3 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-ink-soft underline decoration-ink/20 underline-offset-4 transition-colors duration-500 ease-spring hover:text-ink hover:decoration-ink"
          >
            Forgot password?
          </Link>
        </div>

        <PillButton type="submit" disabled={loading} loading={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </PillButton>
      </form>
    </AuthShell>
  );
}
