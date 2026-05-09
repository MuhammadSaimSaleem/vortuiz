"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Building2,
  KeyRound,
  Loader2,
  Mail,
  Save,
  User,
  UserCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AvatarPicker } from "@/components/ui/AvatarPicker";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileForm {
  full_name: string;
  email: string;
  organization: string;
  role: string;
  avatar_initials: string;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
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
  const supabase = useMemo(() => createClient(), []);

  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    email: "",
    organization: "",
    role: "",
    avatar_initials: "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // ── Fetch profile ────────────────────────────────────────────────────────
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

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, organization, role, avatar_initials")
        .eq("id", user.id)
        .single();

      console.log("profile fetch →", { data, error, userId: user.id });

      if (!error && data) {
        setForm({
          full_name:        data.full_name        ?? "",
          email:            data.email            ?? "",
          organization:      data.organization      ?? "",
          role:             data.role             ?? "",
          avatar_initials:  data.avatar_initials  ?? "",
        });
      }

      setLoading(false);
    }

    fetchProfile();
  }, [supabase]);

  // ── Handle profile field change ──────────────────────────────────────────
  function handleChange(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ── Save profile ─────────────────────────────────────────────────────────
  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name:        form.full_name        || null,
        organization:     form.organization     || null,
        role:             form.role             || null,
        avatar_initials:  form.avatar_initials  || null,
        // Email is updated via Supabase Auth, not directly in profiles
      })
      .eq("id", userId);

    if (error) {
      setErrorMsg("Failed to save changes. Please try again.");
    } else {
      setSuccessMsg("Profile updated successfully.");
    }

    setSaving(false);
  }

  // ── Update email (via Supabase Auth) ─────────────────────────────────────
  async function handleEmailUpdate() {
    if (!form.email) return;
    await supabase.auth.updateUser({ email: form.email });
    // Also mirror it in the profiles table
    if (userId) {
      await supabase
        .from("profiles")
        .update({ email: form.email })
        .eq("id", userId);
    }
  }

  // ── Change password ──────────────────────────────────────────────────────
  async function handlePasswordChange() {
    setPasswordError("");
    setPasswordMsg("");

    if (!passwordForm.new_password) {
      setPasswordError("New password cannot be empty.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.new_password,
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      // Update password_last_changed_days to 0 in profiles
      if (userId) {
        await supabase
          .from("profiles")
          .update({ password_last_changed_days: 0 })
          .eq("id", userId);
      }
      setPasswordMsg("Password changed successfully.");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    }

    setSavingPassword(false);
  }

  if (loading) {
    return (
      <div className="min-h-full bg-surface flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
      </div>
    );
  }

  return (
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

      {/* ── Avatar preview + initials override ── */}
      <AvatarPicker
        initials={form.avatar_initials}
        onImageChange={async (file) => {
          if (!file) return;
          const formData = new FormData();
          formData.append("avatar", file);
          await fetch("/api/upload-avatar", { method: "POST", body: formData });
        }}
      />

      {/* ── Personal Info ── */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <SectionHeader
          icon={<UserCircle className="h-5 w-5" />}
          title="Personal Info"
        />

        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <FieldRow label="Full Name" icon={<User className="h-3 w-3" />}>
            <Input
              className="rounded-xl border-border focus-visible:ring-brand-blue"
              placeholder="N/A"
              value={form.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
            />
          </FieldRow>

          <FieldRow label="Role / Title" icon={<UserCircle className="h-3 w-3" />}>
            <Input
              className="rounded-xl border-border focus-visible:ring-brand-blue"
              placeholder="N/A"
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
            />
          </FieldRow>

          <FieldRow label="Email Address" icon={<Mail className="h-3 w-3" />}>
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
            label="Organization"
            icon={<Building2 className="h-3 w-3" />}
          >
            <Input
              className="rounded-xl border-border focus-visible:ring-brand-blue"
              placeholder="N/A"
              value={form.organization}
              onChange={(e) => handleChange("organization", e.target.value)}
            />
          </FieldRow>
        </div>

        {/* Status messages */}
        {successMsg && (
          <p className="mt-4 text-sm font-semibold text-green-600">
            {successMsg}
          </p>
        )}
        {errorMsg && (
          <p className="mt-4 text-sm font-semibold text-red-500">{errorMsg}</p>
        )}

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
      <div className="rounded-2xl border border-border bg-white p-6 flex flex-col gap-4">
        <SectionHeader
          icon={<KeyRound className="h-5 w-5" />}
          title="Change Password"
        />

        <div className="max-w-2xl">
          <FieldRow label="Current Password">
            <Input
              className="rounded-xl border-border focus-visible:ring-brand-blue"
              placeholder="Min. 8 characters"
              autoComplete="off"
              type="password"
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm((p) => ({
                  ...p,
                  current_password: e.target.value,
                }))
              }
            />
          </FieldRow>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-5 max-w-2xl">
          <FieldRow label="New Password">
            <Input
              className="rounded-xl border-border focus-visible:ring-brand-blue"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              type="password"
              value={passwordForm.new_password}
              onChange={(e) =>
                setPasswordForm((p) => ({
                  ...p,
                  new_password: e.target.value,
                }))
              }
            />
          </FieldRow>

          <FieldRow label="Confirm New Password">
            <Input
              className="rounded-xl border-border focus-visible:ring-brand-blue"
              placeholder="Repeat new password"
              autoComplete="new-password"
              type="password"
              value={passwordForm.confirm_password}
              onChange={(e) =>
                setPasswordForm((p) => ({
                  ...p,
                  confirm_password: e.target.value,
                }))
              }
            />
          </FieldRow>
        </div>

        {/* Status messages */}
        {passwordMsg && (
          <p className="mt-4 text-sm font-semibold text-green-600">
            {passwordMsg}
          </p>
        )}
        {passwordError && (
          <p className="mt-4 text-sm font-semibold text-red-500">
            {passwordError}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handlePasswordChange}
            disabled={savingPassword}
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
  );
}