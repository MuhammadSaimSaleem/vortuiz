"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Save,
  User,
  UserCircle,
  X,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { AvatarPicker } from "@/components/ui/AvatarPicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileForm {
  full_name: string;
  email: string;
  institution: string;
  role: string;
  avatar_initials: string;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

type Toast = { id: number; message: string; type: "success" | "error" };

// ─── Toast stack (matches profile page style) ─────────────────────────────────
function ToastStack({
  toasts,
  remove,
}: {
  toasts: Toast[];
  remove: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-100 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold pointer-events-auto animate-in slide-in-from-bottom-2 duration-200
            ${
              t.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {t.message}
          <button
            onClick={() => remove(t.id)}
            className="ml-1 opacity-60 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Password visibility toggle (from profile page) ───────────────────────────
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-10 rounded-xl border-border focus-visible:ring-brand-blue"
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-subtitle hover:text-brand-dark transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ─── Password strength bar (from profile page) ────────────────────────────────
function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const label = ["", "Weak", "Fair", "Good", "Strong"][score];
  const colors = [
    "",
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-emerald-500",
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-colors ${
              n <= score ? colors[score] : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p
        className={`text-xs font-semibold ${
          score <= 1
            ? "text-red-500"
            : score === 2
            ? "text-orange-500"
            : score === 3
            ? "text-yellow-600"
            : "text-emerald-600"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────
function FieldRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-subtitle">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className="text-brand-navy">{icon}</span>
      <h2 className="text-lg font-bold text-brand-navy">{title}</h2>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EditProfile() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Avatar URL stored in Supabase Storage
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    email: "",
    institution: "",
    role: "",
    avatar_initials: "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // ── Toast system (matches profile page) ──────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const avatarSaveFnRef = useRef<() => Promise<void>>(undefined);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++toastIdRef.current;
    
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []); // Empty dependency array keeps the function instance stable

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Fetch profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select(
          "full_name, email, institution_id, role, avatar_initials, avatar_url"
        )
        .eq("id", user.id)
        .single();

      const { data: institutionData } = await supabase
        .from('institutions')
        .select('id, name')
        .eq('id', profileData?.institution_id)
        .single();

      if (!error && profileData) {
        setForm({
          full_name: profileData.full_name ?? "",
          email: user.email ?? profileData.email ?? "",
          institution: institutionData?.name ?? "",
          role: profileData.role ?? "",
          avatar_initials: profileData.avatar_initials ?? "",
        });
        setInstitutionId(institutionData?.id);
        setAvatarUrl(profileData.avatar_url ?? null);
      } else if (error) {
        showToast("Failed to load profile data.", "error");
      }

      setLoading(false);
    }

    fetchProfile();
  }, [showToast]);

  // ── Handle profile field change ───────────────────────────────────────────
  function handleChange(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ── Save profile ──────────────────────────────────────────────────────────
  async function handleSave() {
    if (!userId) return;
    setSaving(true);

    await avatarSaveFnRef.current?.(); 

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name || null,
        role: form.role || null,
        avatar_initials: form.avatar_initials || null,
      })
      .eq("id", userId);

    const { error: institutionError } = await supabase
      .from('institutions')
      .update({name: form.institution})
      .eq("id", institutionId);

    if (error || institutionError) {
      showToast("Failed to save changes. Please try again.", "error");
    } else {
      showToast("Profile updated successfully.");
    }

    setSaving(false);
  }

  // ── Update email (via Supabase Auth) ──────────────────────────────────────
  async function handleEmailUpdate() {
    if (!form.email || !userId) return;

    // Update auth email (triggers confirmation email to new address)
    const { error: authError } = await supabase.auth.updateUser({
      email: form.email,
    });

    if (authError) {
      showToast(`Email update failed: ${authError.message}`, "error");
      return;
    }

    // Mirror in profiles table so InfoRow on Profile page stays in sync
    await supabase
      .from("profiles")
      .update({ email: form.email })
      .eq("id", userId);

    showToast(
      "Confirmation email sent. Check your inbox to verify the new address.",
      "success"
    );
  }

  // ── Change password ───────────────────────────────────────────────────────
  async function handlePasswordChange() {
    if (!passwordForm.new_password) {
      showToast("New password cannot be empty.", "error");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast("New passwords do not match.", "error");
      return;
    }
    if (passwordForm.new_password.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }

    setSavingPassword(true);

    // Re-authenticate with the current password first
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;

    if (!email) {
      showToast("Could not retrieve your email. Please sign in again.", "error");
      setSavingPassword(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: passwordForm.current_password,
    });

    if (signInError) {
      showToast("Current password is incorrect.", "error");
      setSavingPassword(false);
      return;
    }

    // Now update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordForm.new_password,
    });

    if (updateError) {
      showToast(updateError.message, "error");
      setSavingPassword(false);
      return;
    }

    // Store change timestamp (mirrors profile page behaviour)
    if (userId) {
      await supabase
        .from("profiles")
        .update({ password_last_changed_at: new Date().toISOString() })
        .eq("id", userId);
    }

    showToast("Password changed successfully.");
    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });

    setSavingPassword(false);
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-full bg-surface flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
      </div>
    );
  }

  return (
    <>
      <ToastStack toasts={toasts} remove={removeToast} />

      <div className="min-h-full bg-surface p-6 space-y-5">

        {/* ── Back + title bar ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-subtitle hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-brand-dark">Edit Profile</h1>
        </div>

        {/* ── Avatar picker ── */}
        <AvatarPicker
          avatarUrl={avatarUrl}
          initials={form.avatar_initials}
          userId={userId ?? ""}
          supabaseClient={supabase}
          onSaveFnReady={(fn) => { avatarSaveFnRef.current = fn; }}
          onSaved={(url) => {
            setAvatarUrl(url);
            if (userId) {
              supabase
                .from("profiles")
                .update({ avatar_url: url })
                .eq("id", userId);
            }
            showToast("Avatar updated successfully.");
          }}
          onRemoved={() => {
            setAvatarUrl(null);
            if (userId) {
              supabase
                .from("profiles")
                .update({ avatar_url: null })
                .eq("id", userId);
            }
          }}
        />

        {/* Fake field to catch browser autofill */}
        <input style={{ display: 'none' }} type="text" name="fake_username" autoComplete="email"/>
        <input style={{ display: 'none' }} type="password" name="fake_password" autoComplete="password"/>

        {/* ── Personal Info ── */}
        <div className="flex gap-6">
          <div className="w-1/2 rounded-2xl border border-border bg-white p-6">
            <SectionHeader
              icon={<UserCircle className="h-5 w-5" />}
              title="Personal Info"
            />
            <div className="flex flex-col gap-x-8 gap-y-5">
              <FieldRow label="Full Name" icon={<User className="h-3 w-3" />}>
                <Input
                  className="rounded-xl border-border focus-visible:ring-brand-blue"
                  placeholder="N/A"
                  value={form.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                />
              </FieldRow>
              <FieldRow
                label="Role / Title"
                icon={<UserCircle className="h-3 w-3" />}
              >
                <Select
                  value={form.role}
                  onValueChange={(value) => handleChange("role", value)}
                >
                  <SelectTrigger className="rounded-xl border-border focus:ring-brand-blue w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow
                label="Email Address"
                icon={<Mail className="h-3 w-3" />}
              >
                <div className="flex gap-2">
                  <Input
                    className="rounded-xl border-border focus-visible:ring-brand-blue flex-1"
                    placeholder="N/A"
                    autoComplete="off"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEmailUpdate}
                    className="rounded-xl border-brand-blue text-brand-blue hover:bg-brand-blue/5 text-sm font-semibold shrink-0"
                  >
                    Update Email
                  </Button>
                </div>
                <p className="text-[11px] text-brand-subtitle">
                  A confirmation link will be sent to the new address.
                </p>
              </FieldRow>
              <FieldRow
                label="institution"
                icon={<Building2 className="h-3 w-3" />}
              >
                <Input
                  className="rounded-xl border-border focus-visible:ring-brand-blue"
                  placeholder="N/A"
                  value={form.institution}
                  onChange={(e) => handleChange("institution", e.target.value)}
                  autoComplete="institution"
                />
              </FieldRow>
            </div>
            {/* Save button */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-navy hover:bg-brand-blue text-white font-semibold text-sm h-10 px-6 rounded-xl gap-2 transition-colors"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
          {/* ── Change Password ── */}
          <div className="w-1/2 rounded-2xl border border-border bg-white p-6 flex flex-col gap-4">
            <SectionHeader
              icon={<KeyRound className="h-5 w-5" />}
              title="Change Password"
            />
            <div className="max-w-2xl">
              <FieldRow label="Current Password">
                <PasswordInput
                  id="current-pw"
                  value={passwordForm.current_password}
                  onChange={(v) =>
                    setPasswordForm((p) => ({ ...p, current_password: v }))
                  }
                  placeholder="Enter current password"
                  disabled={savingPassword}
                  autoComplete="one-time-code"
                />
              </FieldRow>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 max-w-2xl mb-auto">
              <FieldRow label="New Password">
                <PasswordInput
                  id="new-pw"
                  value={passwordForm.new_password}
                  onChange={(v) =>
                    setPasswordForm((p) => ({ ...p, new_password: v }))
                  }
                  placeholder="Min. 8 characters"
                  disabled={savingPassword}
                  autoComplete="one-time-code"
                />
                <StrengthBar password={passwordForm.new_password} />
              </FieldRow>
              <FieldRow label="Confirm New Password">
                <PasswordInput
                  id="confirm-pw"
                  value={passwordForm.confirm_password}
                  onChange={(v) =>
                    setPasswordForm((p) => ({ ...p, confirm_password: v }))
                  }
                  placeholder="Repeat new password"
                  disabled={savingPassword}
                />
                {passwordForm.confirm_password &&
                  passwordForm.new_password !== passwordForm.confirm_password && (
                    <p className="text-xs font-medium text-red-500 mt-1">
                      Passwords do not match.
                    </p>
                  )}
              </FieldRow>
            </div>
            <div className="mt-2 flex justify-end">
              <Button
                onClick={handlePasswordChange}
                disabled={
                  savingPassword ||
                  !passwordForm.current_password ||
                  !passwordForm.new_password ||
                  !passwordForm.confirm_password
                }
                className="bg-brand-navy hover:bg-brand-blue text-white font-semibold text-sm h-10 px-6 rounded-xl gap-2 transition-colors"
              >
                {savingPassword ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <KeyRound className="h-3.5 w-3.5" />
                )}
                Update Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}