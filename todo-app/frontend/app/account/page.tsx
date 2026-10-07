"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { changePassword, tokenStorage } from "@/services/authService";
import { useStoredUser } from "@/lib/useStoredUser";
import { Bezel, ErrorNote, Eyebrow, Field, Icon, PasswordToggle, PillButton, Reveal } from "@/components/ui";

const MAX_PASSWORD_BYTES = 72; // bcrypt limit, enforced by the backend too

export default function AccountPage() {
  const router = useRouter();
  const user = useStoredUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!tokenStorage.getToken()) router.push("/login");
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }
    if (new TextEncoder().encode(newPassword).length > MAX_PASSWORD_BYTES) {
      setError(`New password is too long (max ${MAX_PASSWORD_BYTES} bytes)`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from the current one");
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword({ current_password: currentPassword, new_password: newPassword });
      setSuccess(result.message === "Password updated" ? "Your password has been updated." : result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : null;
  const initial = user ? (user.full_name || user.email).charAt(0).toUpperCase() : "";

  return (
    <main className="mx-auto max-w-5xl px-4 pb-32 pt-28 md:px-8 md:pt-32">
      <Reveal>
        <Eyebrow>Account</Eyebrow>
      </Reveal>
      <Reveal delay={60}>
        <h1 className="mt-5 font-display text-4xl leading-[1.05] tracking-[-0.03em] md:text-5xl">
          Your <em className="text-sage">account.</em>
        </h1>
      </Reveal>
      <Reveal delay={120}>
        <p className="mt-3 text-ink-soft">Your profile details, and a safe place to change your password.</p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start">
        {/* Profile */}
        <Reveal delay={160} className="md:col-span-5">
          <Bezel coreClassName="p-6 sm:p-7">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted">Profile</span>
            <div className="mt-5 flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sage-soft font-display text-2xl text-sage">
                {initial || <Icon name="user" className="w-5 h-5" />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-medium tracking-tight">{user?.full_name || "No name set"}</p>
                <p className="truncate text-sm text-ink-soft">{user?.email ?? "—"}</p>
              </div>
            </div>
            <dl className="mt-6 space-y-3 border-t border-ink/[0.06] pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Email</dt>
                <dd className="truncate text-ink-soft">{user?.email ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Member since</dt>
                <dd className="text-ink-soft">{memberSince ?? "—"}</dd>
              </div>
            </dl>
          </Bezel>
        </Reveal>

        {/* Change password */}
        <Reveal delay={220} className="md:col-span-7">
          <Bezel coreClassName="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted">Security</span>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">Change password</h2>
                <p className="mt-1 text-sm text-muted">Enter your current password, then choose a new one.</p>
              </div>

              {error && <ErrorNote>{error}</ErrorNote>}
              {success && (
                <div role="status" className="animate-rise flex items-start gap-3 rounded-2xl bg-sage-soft px-4 py-3 text-sm text-sage ring-1 ring-sage/20">
                  <Icon name="check" className="mt-0.5 w-4 h-4 shrink-0" strokeWidth={1.75} />
                  <span>{success}</span>
                </div>
              )}

              <Field
                id="currentPassword"
                label="Current password"
                icon="lock"
                type={show.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                trailing={<PasswordToggle shown={show.current} onToggle={() => setShow({ ...show, current: !show.current })} disabled={loading} />}
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  id="newPassword"
                  label="New password"
                  hint="6+ chars"
                  icon="lock"
                  type={show.next ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  autoComplete="new-password"
                  trailing={<PasswordToggle shown={show.next} onToggle={() => setShow({ ...show, next: !show.next })} disabled={loading} />}
                />
                <Field
                  id="confirmPassword"
                  label="Confirm new"
                  icon="check"
                  type={show.confirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  autoComplete="new-password"
                  trailing={<PasswordToggle shown={show.confirm} onToggle={() => setShow({ ...show, confirm: !show.confirm })} disabled={loading} />}
                />
              </div>

              <PillButton
                type="submit"
                icon="lock"
                loading={loading}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full !mt-7"
              >
                {loading ? "Updating…" : "Update password"}
              </PillButton>
            </form>
          </Bezel>
        </Reveal>
      </div>
    </main>
  );
}
