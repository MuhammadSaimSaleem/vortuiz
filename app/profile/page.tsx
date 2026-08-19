"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  IdCard,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  QrCode,
  Shield,
  SlidersHorizontal,
  Smartphone,
  SunMoon,
  User,
  UserCircle,
  X,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import { useProfile } from "@/contexts/ProfileContext";
import type { Profile } from "@/lib/data";

type Toast = { id: number; message: string; type: "success" | "error" };

// ─── Toast system ─────────────────────────────────────────────────────────────
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
            ${t.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {t.message}
          <button onClick={() => remove(t.id)} className="ml-1 opacity-60 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Connected account tile ───────────────────────────────────────────────────
function ConnectedTile({
  label,
  connected = false,
  color,
  loading,
  onClick,
}: {
  label: string;
  connected: boolean;
  color?: string;
  loading?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={connected ? `Disconnect ${label}` : `Connect ${label}`}
      className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center text-[11px] font-bold transition-all
        ${
          connected
            ? `${color ?? "bg-brand-navy border-brand-navy"} text-white opacity-90 hover:opacity-70`
            : "border-dashed border-border text-slate-400 hover:border-brand-blue hover:text-brand-blue"
        }`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : connected ? (
        label[0]
      ) : (
        <Plus className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  color = "text-brand-navy",
}: {
  icon: React.ReactNode;
  title: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className={color}>{icon}</span>
      <h2 className={`text-lg font-bold ${color}`}>{title}</h2>
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 mb-4 last:mb-0">
      {icon && <span className="mt-0.5 text-brand-subtitle shrink-0">{icon}</span>}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-brand-dark">{value || "N/A"}</p>
      </div>
    </div>
  );
}

// ─── Password visibility toggle input ────────────────────────────────────────
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
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

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  function handleChange(i: number, char: string) {
    if (!/^\d*$/.test(char)) return;
    const next = [...digits];
    next[i] = char.slice(-1);
    onChange(next.join(""));
    if (char && i < 5) inputsRef.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="h-12 w-10 text-center text-lg font-bold rounded-xl border-2 border-border focus:border-brand-blue focus:ring-0 outline-none transition-colors disabled:opacity-50"
        />
      ))}
    </div>
  );
}

// ─── Strength bar ─────────────────────────────────────────────────────────────
function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const label = ["", "Weak", "Fair", "Good", "Strong"][score];
  const colors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];

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
      <p className={`text-xs font-semibold ${score <= 1 ? "text-red-500" : score === 2 ? "text-orange-500" : score === 3 ? "text-yellow-600" : "text-emerald-600"}`}>
        {label}
      </p>
    </div>
  );
}

// A sentinel that can never === the real `profile` value (null | undefined | object),
// so the sync block below is guaranteed to run on the very first render — even if
// ProfileContext's `profile` was already populated before this component mounted
// (e.g. navigating here via <Link> after visiting another page).
const NOT_SYNCED = Symbol('not-synced');

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { profile, isLoading: loading } = useProfile();

  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  // Preferences state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [twoFactor, setTwoFactor] = useState(false);
  const [emailNotif, setEmailNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [darkMode, setDarkMode] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("en-us");

  // Toast
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Modal states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [twoFaOpen, setTwoFaOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState<"google" | "microsoft" | null>(null);
  const [disconnectOpen, setDisconnectOpen] = useState<"google" | "microsoft" | null>(null);

  // Password change form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // 2FA flow — step 1: choose method; step 2: verify OTP
  const [twoFaStep, setTwoFaStep] = useState<"choose" | "verify" | "disable">("choose");
  const [twoFaMethod, setTwoFaMethod] = useState<"email" | "sms">("email");
  const [twoFaOtp, setTwoFaOtp] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState<string | null>(null);
  const [twoFaResendCountdown, setTwoFaResendCountdown] = useState(0);

  // Connect account loading
  const [connectLoading, setConnectLoading] = useState<"google" | "microsoft" | null>(null);

  // Delete confirmation input
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // ── Toast helpers ──────────────────────────────────────────────────────────
  function showToast(message: string, type: "success" | "error" = "success") {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Sync local state from the ProfileContext profile ───────────────────────
  // ProfileContext already fetches the profile (including institution name and
  // role-specific fields) on login, so we just mirror it into local state here
  // instead of re-fetching from Supabase.
  //
  // This mirrors an external value into local state, so it's adjusted during
  // render (comparing against the previous `profile` reference) rather than in
  // a useEffect. Doing it in an effect would render once with stale/default
  // state and then immediately re-render with the synced values; doing it
  // during render lets React apply the update before the screen paints.
  const [prevProfile, setPrevProfile] = useState<Profile | null | undefined | typeof NOT_SYNCED>(NOT_SYNCED);
  if (profile !== prevProfile) {
    setPrevProfile(profile);

    if (profile) {
      const combinedProfile = profile as unknown as Profile;

      setProfileData(combinedProfile);
      setTwoFactor(combinedProfile.two_factor_enabled ?? false);
      setEmailNotif(combinedProfile.email_notifications ?? false);
      setPushNotif(combinedProfile.push_notifications ?? false);
      setSmsAlerts(combinedProfile.sms_alerts ?? false);
      setVisibility(combinedProfile.profile_visibility ?? "public");
      setDarkMode((combinedProfile.dark_mode as "light" | "dark") ?? "light");
      setLanguage(combinedProfile.language ?? "en-us");
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profileData?.student_code ?? "").then(() => {
      setCopiedCode(profile?.student_code ?? "");
      //("Student Code copied to clipboard!", "success")
      setTimeout(() => setCopiedCode(prev => (prev === profile?.student_code ? null : prev)), 1500);
    })
  }

  // ── Save preferences helper ────────────────────────────────────────────────
  async function savePreferences(patch: Partial<Profile>) {
    if (!profileData) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", profileData.id);
    if (error) {
      showToast("Failed to save preferences.", "error");
    } else {
      setProfileData((prev) => (prev ? { ...prev, ...patch } : prev));
    }
    setSaving(false);
  }

  // ── Password change ────────────────────────────────────────────────────────
  async function handlePasswordChange() {
    setPwError(null);

    if (!currentPw) return setPwError("Please enter your current password.");
    if (newPw.length < 8) return setPwError("New password must be at least 8 characters.");
    if (newPw !== confirmPw) return setPwError("Passwords do not match.");

    setPwLoading(true);

    // Re-authenticate with current password
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;

    if (!email) {
      setPwError("Could not retrieve user email. Please sign in again.");
      setPwLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPw,
    });

    if (signInError) {
      setPwError("Current password is incorrect.");
      setPwLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPw,
    });

    if (updateError) {
      setPwError(updateError.message);
      setPwLoading(false);
      return;
    }

    // Store the change timestamp in profiles table
    await supabase
      .from("profiles")
      .update({ password_last_changed_at: new Date().toISOString() })
      .eq("id", profileData!.id);

    setProfileData((prev) =>
      prev ? { ...prev, password_last_changed_at: new Date().toISOString() } : prev
    );

    setPwLoading(false);
    setPwOpen(false);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    showToast("Password updated successfully.");
  }

  // ── 2FA ───────────────────────────────────────────────────────────────────
  function openTwoFaModal(enabling: boolean) {
    setTwoFaStep(enabling ? "choose" : "disable");
    setTwoFaOtp("");
    setTwoFaError(null);
    setTwoFaOpen(true);
  }

  async function sendTwoFaCode() {
    if (!profileData?.email) return;
    setTwoFaLoading(true);
    setTwoFaError(null);

    if (twoFaMethod === "email") {
      // Use Supabase's built-in OTP via email
      const { error } = await supabase.auth.signInWithOtp({
        email: profileData.email,
        options: { shouldCreateUser: false },
      });
      if (error) {
        setTwoFaError("Failed to send verification code. " + error.message);
        setTwoFaLoading(false);
        return;
      }
    }
    // For SMS: trigger your own edge function / Twilio etc.
    // await fetch("/api/send-sms-otp", { method: "POST", body: JSON.stringify({ userId: profileData.id }) })

    setTwoFaStep("verify");
    setTwoFaLoading(false);
    startResendCountdown();
  }

  function startResendCountdown() {
    setTwoFaResendCountdown(60);
    const interval = setInterval(() => {
      setTwoFaResendCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  async function verifyTwoFaOtp() {
    if (twoFaOtp.length !== 6) return;
    if (!profileData?.email) return;
    setTwoFaLoading(true);
    setTwoFaError(null);

    const { error } = await supabase.auth.verifyOtp({
      email: profileData.email,
      token: twoFaOtp,
      type: "email",
    });

    if (error) {
      setTwoFaError("Invalid or expired code. Please try again.");
      setTwoFaLoading(false);
      return;
    }

    await savePreferences({ two_factor_enabled: true, two_factor_method: twoFaMethod });
    setTwoFactor(true);
    setTwoFaLoading(false);
    setTwoFaOpen(false);
    showToast("Two-factor authentication enabled.");
  }

  async function disableTwoFa() {
    setTwoFaLoading(true);
    await savePreferences({ two_factor_enabled: false, two_factor_method: null });
    setTwoFactor(false);
    setTwoFaLoading(false);
    setTwoFaOpen(false);
    showToast("Two-factor authentication disabled.");
  }

  // ── Connected accounts ─────────────────────────────────────────────────────
  async function handleConnect(provider: "google" | "microsoft") {
    setConnectLoading(provider);

    const { data, error } = await supabase.auth.linkIdentity({
      provider: provider === "microsoft" ? "azure" : "google",
      options: {
        redirectTo: `${window.location.origin}/profile?connected=${provider}`,
        scopes: provider === "google" ? "email profile" : "email",
      },
    });

    if (error) {
      showToast(`Failed to connect ${provider}: ${error.message}`, "error");
      setConnectLoading(null);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  }

  async function handleDisconnect(provider: "google" | "microsoft") {
    setConnectLoading(provider);

    // Get current identities
    const { data: userData } = await supabase.auth.getUser();
    const identities = userData?.user?.identities ?? [];

    const identity = identities.find((id) =>
      provider === "google" ? id.provider === "google" : id.provider === "azure"
    );

    if (!identity) {
      showToast("Identity not found.", "error");
      setConnectLoading(null);
      setDisconnectOpen(null);
      return;
    }

    const { error } = await supabase.auth.unlinkIdentity(identity);

    if (error) {
      showToast(`Failed to disconnect: ${error.message}`, "error");
    } else {
      const field = provider === "google" ? "connected_google" : "connected_microsoft";
      await savePreferences({ [field]: false } as Partial<Profile>);
      setProfileData((prev) =>
        prev ? { ...prev, [field]: false } : prev
      );
      showToast(`${provider} disconnected.`);
    }

    setConnectLoading(null);
    setDisconnectOpen(null);
  }

  // Handle redirect back after OAuth connect.
  // We use an async IIFE so every setState call happens *after* the first await,
  // which moves them out of the synchronous effect body and avoids cascading renders.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected") as "google" | "microsoft" | null;
    if (!connected || !profileData) return;

    void (async () => {
      const field = connected === "google" ? "connected_google" : "connected_microsoft";
      // Await the DB write first — all setState calls inside savePreferences now
      // happen asynchronously, after at least one await boundary.
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: true })
        .eq("id", profileData.id);

      if (!error) {
        setProfileData((prev) => (prev ? { ...prev, [field]: true } : prev));
        showToast(`${connected} connected successfully.`);
      } else {
        showToast(`Failed to save connection: ${error.message}`, "error");
      }

      window.history.replaceState({}, "", "/profile");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData?.id]);

  // ── Delete account ─────────────────────────────────────────────────────────
  async function handleDeleteAccount() {
    if (!profileData) return;
    // Soft-delete: mark deleted in profiles, then sign out
    // (hard auth delete requires service_role key — do it in an Edge Function)
    await supabase.from("profiles").update({ deleted_at: new Date().toISOString() }).eq("id", profileData.id);
    await supabase.auth.signOut();
    setDeleteOpen(false);
    window.location.href = "/";
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const passwordNote = (() => {
    if (!profileData?.password_last_changed_at) return "Never changed";
    const days = Math.floor(
      (Date.now() - new Date(profileData.password_last_changed_at).getTime()) / 86_400_000
    );
    return days === 0 ? "Changed today" : `Last changed: ${days} day${days !== 1 ? "s" : ""} ago`;
  })();

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

        {/* ── Profile header card ── */}
        <div className="rounded-2xl border border-border bg-white px-7 py-6 flex items-center gap-6">
          <div className="relative shrink-0">
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-brand-navy border-2 border-slate-400 shadow-md">
              <div className="h-full w-full flex items-center justify-center">
                {profileData?.avatar_url ? (
                    <Image
                      src={profileData?.avatar_url || ""}
                      alt="Profile Image"
                      width={100}
                      height={100}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {profileData?.avatar_initials}
                    </span>
                  )}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-brand-dark">
              {profileData?.full_name || "N/A"}
            </h1>
            <p className="text-sm text-brand-subtitle mt-0.5 capitalize">
              {(profileData?.role) || "N/A"}
            </p>
          </div>

          <Link href="/profile/edit">
            <Button className="bg-brand-navy hover:bg-brand-blue text-white font-semibold text-sm h-10 px-5 rounded-xl gap-2 transition-colors">
              <Pencil className="h-3.5 w-3.5" /> Edit Profile
            </Button>
          </Link>
        </div>

        {/* ── Personal Info + Account Security ── */}
        <div className="grid grid-cols-2 gap-5">

          {/* Personal Info */} 
          <div className="rounded-2xl border border-border bg-white p-6">
            <SectionHeader icon={<UserCircle className="h-5 w-5" />} title="Personal Info" />
            <InfoRow label="Full Name" value={profileData?.full_name} icon={<User className="h-3.5 w-3.5" />} />
            <InfoRow label="Email Address" value={profileData?.email} icon={<Mail className="h-3.5 w-3.5" />} />
            <div className="flex justify-between">
              <InfoRow label="Student ID" value={profileData?.student_code} icon={<IdCard className="h-3.5 w-3.5" />} />
              <div>
                <Button variant={"outline"} onClick={handleCopyCode}>
                  {copiedCode ? 
                    <div className="flex gap-1 items-center text-green-600">
                      <Check size={10}/>
                      Copied
                    </div> : "Copy"}
                </Button>
              </div>
            </div>
            <InfoRow label="Institution" value={profileData?.institution} icon={<Building2 className="h-3.5 w-3.5" />} />
          </div>

          {/* Account Security */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <SectionHeader icon={<Shield className="h-5 w-5" />} title="Account Security" />

            {/* Password management — hide for OAuth-only users */}
            {!profileData?.connected_google && (
              <div className="flex items-center justify-between py-3.5 border-b border-border">
                <div>
                  <p className="text-sm font-semibold text-brand-dark">Password Management</p>
                  <p className="text-xs text-brand-subtitle mt-0.5">{passwordNote}</p>
                </div>
                <button
                  onClick={() => {
                    setPwError(null);
                    setCurrentPw("");
                    setNewPw("");
                    setConfirmPw("");
                    setPwOpen(true);
                  }}
                  className="text-sm font-semibold text-brand-blue hover:opacity-70 transition-opacity"
                >
                  Change
                </button>
              </div>
            )}

            {/* 2FA */}
            <div className="flex items-center justify-between py-3.5 border-b border-border">
              <div>
                <p className="text-sm font-semibold text-brand-dark">Two-Factor Auth</p>
                <p className="text-xs text-brand-subtitle mt-0.5">
                  {twoFactor
                    ? `Enabled via ${(profileData?.two_factor_method ?? "email")}`
                    : "Secure your account with SMS/Email"}
                </p>
              </div>
              <Switch
                checked={twoFactor}
                onCheckedChange={(v) => openTwoFaModal(v)}
                className="data-[state=checked]:bg-brand-navy"
              />
            </div>

            {/* Connected accounts */}
            <div className="flex flex-col pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle mb-3">
                Connected Accounts
              </p>
              <div className="flex items-center gap-2">
                <ConnectedTile
                  label="Google"
                  connected={profileData?.connected_google ?? false}
                  color="bg-slate-200 border-slate-200 text-slate-500"
                  loading={connectLoading === "google"}
                  onClick={() => {
                    if (profileData?.connected_google) setDisconnectOpen("google");
                    else setConnectOpen("google");
                  }}
                />
                <ConnectedTile
                  label="Microsoft"
                  connected={profileData?.connected_microsoft ?? false}
                  color="bg-brand-navy border-brand-navy"
                  loading={connectLoading === "microsoft"}
                  onClick={() => {
                    if (profileData?.connected_microsoft) setDisconnectOpen("microsoft");
                    else setConnectOpen("microsoft");
                  }}
                />
              </div>
              <p className="text-[10px] text-brand-subtitle mt-2">
                Click a tile to connect or disconnect an account.
              </p>
            </div>
          </div>
        </div>

        {/* ── System Preferences ── */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <SectionHeader icon={<SlidersHorizontal className="h-5 w-5" />} title="System Preferences" />

          <div className="grid grid-cols-2 gap-10">
            {/* Notification Settings */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <p className="text-sm font-bold text-brand-dark">Notification Settings</p>
              </div>
              <div className="space-y-8">
                {[
                  {
                    label: "Email Notifications",
                    checked: emailNotif,
                    onChange: (v: boolean) => { setEmailNotif(v); savePreferences({ email_notifications: v }); },
                    icon: <Mail className="h-3.5 w-3.5 text-brand-subtitle" />,
                  },
                  {
                    label: "Push Notifications",
                    checked: pushNotif,
                    onChange: (v: boolean) => { setPushNotif(v); savePreferences({ push_notifications: v }); },
                    icon: <Smartphone className="h-3.5 w-3.5 text-brand-subtitle" />,
                  },
                  {
                    label: "SMS Alerts",
                    checked: smsAlerts,
                    onChange: (v: boolean) => { setSmsAlerts(v); savePreferences({ sms_alerts: v }); },
                    icon: <MessageSquare className="h-3.5 w-3.5 text-brand-subtitle" />,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <Checkbox
                      id={item.label}
                      checked={item.checked}
                      onCheckedChange={(v) => item.onChange(!!v)}
                      className="data-[state=checked]:bg-brand-navy data-[state=checked]:border-brand-navy"
                    />
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <label htmlFor={item.label} className="text-sm text-slate-600 cursor-pointer select-none">
                        {item.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy & Display */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-sm font-bold text-brand-dark">Privacy & Display</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-brand-subtitle" />
                  <p className="text-sm text-slate-600">Profile Visibility</p>
                  <div className="ml-auto">
                    <Select value={visibility} onValueChange={(v) => { setVisibility(v); savePreferences({ profile_visibility: v }); }}>
                      <SelectTrigger className="h-8 text-sm border-border rounded-xl w-32 focus:ring-brand-blue">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="institution">Institution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <SunMoon className="h-4 w-4 text-brand-subtitle" />
                  <p className="text-sm text-slate-600">Dark Mode</p>
                  <div className="flex items-center rounded-xl border border-border overflow-hidden text-sm font-semibold h-8 ml-auto">
                    <button
                      onClick={() => { setDarkMode("light"); savePreferences({ dark_mode: "light" }); }}
                      className={`px-3 h-full transition-colors ${darkMode === "light" ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => { setDarkMode("dark"); savePreferences({ dark_mode: "dark" }); }}
                      className={`px-3 h-full border-l border-border transition-colors ${darkMode === "dark" ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-brand-subtitle" />
                    <p className="text-sm text-slate-600">Language</p>
                  </div>
                  <Select value={language} onValueChange={(v) => { setLanguage(v); savePreferences({ language: v }); }}>
                    <SelectTrigger className="h-8 text-sm border-border rounded-xl w-36 focus:ring-brand-blue">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-us">English</SelectItem>
                      <SelectItem value="urdu">Urdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {saving && (
            <div className="flex items-center gap-1.5 mt-4 text-xs text-brand-subtitle">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving…
            </div>
          )}
        </div>

        {/* ── Danger Zone ── */}
        <div className="rounded-2xl border border-red-200 bg-white p-6">
          <SectionHeader icon={<AlertTriangle className="h-5 w-5" />} title="Danger Zone" color="text-red-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-dark">Delete Account</p>
              <p className="text-xs text-brand-subtitle mt-0.5 max-w-sm">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => { setDeleteConfirm(""); setDeleteOpen(true); }}
              className="border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500 font-semibold text-sm h-10 px-5 rounded-xl transition-colors"
            >
              Delete Vortuiz Account
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════ */}

      {/* ── Password Change Modal ── */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-brand-navy" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="current-pw" className="text-xs font-bold uppercase tracking-widest text-brand-subtitle">
                Current Password
              </Label>
              <PasswordInput
                id="current-pw"
                value={currentPw}
                onChange={setCurrentPw}
                placeholder="Enter current password"
                disabled={pwLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-pw" className="text-xs font-bold uppercase tracking-widest text-brand-subtitle">
                New Password
              </Label>
              <PasswordInput
                id="new-pw"
                value={newPw}
                onChange={setNewPw}
                placeholder="At least 8 characters"
                disabled={pwLoading}
              />
              <StrengthBar password={newPw} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw" className="text-xs font-bold uppercase tracking-widest text-brand-subtitle">
                Confirm New Password
              </Label>
              <PasswordInput
                id="confirm-pw"
                value={confirmPw}
                onChange={setConfirmPw}
                placeholder="Repeat new password"
                disabled={pwLoading}
              />
              {confirmPw && newPw !== confirmPw && (
                <p className="text-xs text-red-500 font-medium">Passwords do not match.</p>
              )}
            </div>

            {pwError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <XCircle className="h-4 w-4 shrink-0" />
                {pwError}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPwOpen(false)} disabled={pwLoading} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={pwLoading || !currentPw || !newPw || !confirmPw}
              className="bg-brand-navy hover:bg-brand-blue text-white rounded-xl gap-2"
            >
              {pwLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Two-Factor Auth Modal ── */}
      <Dialog open={twoFaOpen} onOpenChange={setTwoFaOpen}>
        <DialogContent className="max-w-sm">
          {twoFaStep === "disable" ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-500">
                  <Lock className="h-5 w-5" />
                  Disable Two-Factor Auth
                </DialogTitle>
                <DialogDescription>
                  This will reduce the security of your account. Are you sure?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 pt-2">
                <Button variant="outline" onClick={() => setTwoFaOpen(false)} disabled={twoFaLoading} className="rounded-xl">
                  Keep Enabled
                </Button>
                <Button
                  onClick={disableTwoFa}
                  disabled={twoFaLoading}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl gap-2"
                >
                  {twoFaLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Yes, Disable
                </Button>
              </DialogFooter>
            </>
          ) : twoFaStep === "choose" ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-brand-navy" />
                  Enable Two-Factor Auth
                </DialogTitle>
                <DialogDescription>
                  Choose how you&apos;d like to receive your verification code.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                {(["email", "sms"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setTwoFaMethod(method)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all
                      ${twoFaMethod === method
                        ? "border-brand-navy bg-brand-navy/5"
                        : "border-border hover:border-brand-blue/50"}`}
                  >
                    <span className={`p-2 rounded-lg ${twoFaMethod === method ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-500"}`}>
                      {method === "email" ? <Mail className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-brand-dark">
                        {method === "email" ? "Email Code" : "SMS Code"}
                      </p>
                      <p className="text-xs text-brand-subtitle">
                        {method === "email" ? `Send to ${profileData?.email}` : "Send to your phone number"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {twoFaError && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {twoFaError}
                </p>
              )}

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setTwoFaOpen(false)} disabled={twoFaLoading} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  onClick={sendTwoFaCode}
                  disabled={twoFaLoading}
                  className="bg-brand-navy hover:bg-brand-blue text-white rounded-xl gap-2"
                >
                  {twoFaLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send Code
                </Button>
              </DialogFooter>
            </>
          ) : (
            // verify step
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-brand-navy" />
                  Enter Verification Code
                </DialogTitle>
                <DialogDescription>
                  {twoFaMethod === "email"
                    ? `We sent a 6-digit code to ${profileData?.email}`
                    : "We sent a 6-digit code to your phone."}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <OtpInput value={twoFaOtp} onChange={setTwoFaOtp} disabled={twoFaLoading} />

                {twoFaError && (
                  <p className="text-xs text-red-500 text-center">{twoFaError}</p>
                )}

                <div className="text-center">
                  {twoFaResendCountdown > 0 ? (
                    <p className="text-xs text-brand-subtitle">
                      Resend in {twoFaResendCountdown}s
                    </p>
                  ) : (
                    <button
                      onClick={sendTwoFaCode}
                      disabled={twoFaLoading}
                      className="text-xs font-semibold text-brand-blue hover:opacity-70 transition-opacity"
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setTwoFaStep("choose")}
                  disabled={twoFaLoading}
                  className="rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={verifyTwoFaOtp}
                  disabled={twoFaLoading || twoFaOtp.length !== 6}
                  className="bg-brand-navy hover:bg-brand-blue text-white rounded-xl gap-2"
                >
                  {twoFaLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verify & Enable
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Connect Account Modal ── */}
      <Dialog open={connectOpen !== null} onOpenChange={() => setConnectOpen(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand-navy" />
              Connect {(connectOpen ?? "")}
            </DialogTitle>
            <DialogDescription>
              You&apos;ll be redirected to {(connectOpen ?? "")} to authorise the connection.
              Your Vortuiz account stays fully functional.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConnectOpen(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => { if (connectOpen) handleConnect(connectOpen); setConnectOpen(null); }}
              className="bg-brand-navy hover:bg-brand-blue text-white rounded-xl"
            >
              Continue to {(connectOpen ?? "")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Disconnect Account Modal ── */}
      <Dialog open={disconnectOpen !== null} onOpenChange={() => setDisconnectOpen(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <XCircle className="h-5 w-5" />
              Disconnect {(disconnectOpen ?? "")}
            </DialogTitle>
            <DialogDescription>
              You&apos;ll no longer be able to sign in with {(disconnectOpen ?? "")}. Make
              sure you have a password set before disconnecting your only sign-in method.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDisconnectOpen(null)} disabled={connectLoading !== null} className="rounded-xl">
              Keep Connected
            </Button>
            <Button
              onClick={() => { if (disconnectOpen) handleDisconnect(disconnectOpen); }}
              disabled={connectLoading !== null}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl gap-2"
            >
              {connectLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Account Modal ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account?
            </DialogTitle>
            <DialogDescription>
              This is permanent and irreversible. All your data, quizzes, and certificates will be
              removed. Type <span className="font-semibold text-brand-dark">DELETE</span> to confirm.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="rounded-xl border-red-300 focus-visible:ring-red-400"
          />

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              disabled={deleteConfirm !== "DELETE"}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl disabled:opacity-40"
              onClick={handleDeleteAccount}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}