"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, signIn } from "@/services/authService";
import { tokenStorage } from "@/services/authService";
import AuthShell from "@/components/AuthShell";
import { ErrorNote, Field, PasswordToggle, PillButton } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Sign up the user
      const userData = {
        email,
        password,
        full_name: fullName.trim() || null,
      };

      await signUp(userData);

      // Automatically sign in the user after successful signup
      const response = await signIn({ email, password });

      // Store token and user data
      tokenStorage.setToken(response.access_token);
      tokenStorage.setUser(response.user);

      // Redirect to todo page
      router.push("/todo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="New account"
      title={
        <>
          Begin with
          <br />
          <em className="text-sage">a clean page.</em>
        </>
      }
      lede="One minute to set up. Then it's just you, your list, and an assistant that listens."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-ink underline decoration-ink/20 underline-offset-4 transition-colors duration-500 ease-spring hover:decoration-ink">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <h2 className="text-xl font-semibold tracking-tight">Create account</h2>

        {error && <ErrorNote>{error}</ErrorNote>}

        <Field
          id="fullName"
          label="Full name"
          hint="Optional"
          icon="user"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={loading}
          placeholder="Ada Lovelace"
          autoComplete="name"
        />

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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            id="password"
            label="Password"
            hint="6+ chars"
            icon="lock"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
            placeholder="••••••"
            autoComplete="new-password"
            trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} disabled={loading} />}
          />
          <Field
            id="confirmPassword"
            label="Confirm"
            icon="check"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
            placeholder="••••••"
            autoComplete="new-password"
            trailing={
              <PasswordToggle
                shown={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              />
            }
          />
        </div>

        <PillButton type="submit" disabled={loading} loading={loading} className="w-full !mt-8">
          {loading ? "Creating account…" : "Create account"}
        </PillButton>
      </form>
    </AuthShell>
  );
}
