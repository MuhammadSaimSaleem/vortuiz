"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  Bell,
  Building2,
  Drama,
  Eye,
  Globe,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Shield,
  SlidersHorizontal,
  Smartphone,
  SunMoon,
  User,
  UserCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toTitleCase } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  institution: string | null;
  role: string | null;
  avatar_initials: string | null;
  // Security / preferences stored in the same row
  two_factor_enabled: boolean | null;
  email_notifications: boolean | null;
  push_notifications: boolean | null;
  sms_alerts: boolean | null;
  profile_visibility: string | null;
  dark_mode: string | null;
  language: string | null;
  // Connected accounts (stored as simple booleans / metadata)
  connected_google: boolean | null;
  connected_microsoft: boolean | null;
  password_last_changed_days: number | null;
}

// ─── Connected account tile ───────────────────────────────────────────────────
function ConnectedTile({
  label,
  connected = false,
  color,
}: {
  label: string;
  connected: boolean;
  color?: string;
}) {
  return (
    <div
      className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center text-[11px] font-bold cursor-pointer transition-all
      ${ connected
          ? `${color ?? "bg-brand-navy border-brand-navy"} text-white`
          : "border-dashed border-border text-slate-400 hover:border-brand-blue hover:text-brand-blue"
      }`}
    >
      {connected ? label[0] : <Plus className="h-3.5 w-3.5" />}
    </div>
)}

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
      <span className={`${color}`}>{icon}</span>
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
      {icon && (
        <span className="mt-0.5 text-brand-subtitle shrink-0">{icon}</span>
      )}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-brand-dark">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Profile() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Local preference state (synced from profile on load)
  const [twoFactor, setTwoFactor] = useState(false);
  const [emailNotif, setEmailNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [darkMode, setDarkMode] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("en-us");

  // ── Fetch profile ──────────────────────────────────────────────────────────
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

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        const p = data as Profile;
        setProfile(p);
        setTwoFactor(p.two_factor_enabled ?? false);
        setEmailNotif(p.email_notifications ?? false);
        setPushNotif(p.push_notifications ?? false);
        setSmsAlerts(p.sms_alerts ?? false);
        setVisibility(p.profile_visibility ?? "public");
        setDarkMode((p.dark_mode as "light" | "dark") ?? "light");
        setLanguage(p.language ?? "en-us");
      }

      setLoading(false);
    }

    fetchProfile();
  }, [supabase]);

  // ── Save preferences helper ────────────────────────────────────────────────
  async function savePreferences(patch: Partial<Profile>) {
    if (!profile) return;
    setSaving(true);
    await supabase.from("profiles").update(patch).eq("id", profile.id);
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
    setSaving(false);
  }

  // ── Delete account ─────────────────────────────────────────────────────────
  async function handleDeleteAccount() {
    if (!profile) return;
    await supabase.from("profiles").delete().eq("id", profile.id);
    await supabase.auth.signOut();
    setDeleteOpen(false);
    // Redirect to home / login after deletion
    window.location.href = "/";
  }

  const passwordNote =
    profile?.password_last_changed_days != null
      ? `Last changed: ${profile.password_last_changed_days} days ago`
      : "N/A";

  if (loading) {
    return (
      <div className="min-h-full bg-surface flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-surface p-6 space-y-5">

      {/* ── Profile header card ── */}
      <div className="rounded-2xl border border-border bg-white px-7 py-6 flex items-center gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-200">
            <div className="h-full w-full bg-linear-to-br from-brand-navy to-brand-blue flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{profile?.avatar_initials}</span>
            </div>
          </div>
        </div>

        {/* Name + role */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-brand-dark">
            {profile?.full_name || "N/A"}
          </h1>
          <p className="text-sm text-brand-subtitle mt-0.5">
            {toTitleCase(profile?.role) || "N/A"}
          </p>
        </div>

        {/* Edit profile link */}
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
          <SectionHeader
            icon={<UserCircle className="h-5 w-5" />}
            title="Personal Info"
          />
          <InfoRow
            label="Full Name"
            value={profile?.full_name}
            icon={<User className="h-3.5 w-3.5" />}
          />
          <InfoRow
            label="Email Address"
            value={profile?.email}
            icon={<Mail className="h-3.5 w-3.5" />}
          />
          <InfoRow
            label="Phone"
            value={profile?.phone}
            icon={<Phone className="h-3.5 w-3.5" />}
          />
          <InfoRow
            label="Institution"
            value={profile?.institution}
            icon={<Building2 className="h-3.5 w-3.5" />}
          />
        </div>

        {/* Account Security */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <SectionHeader
            icon={<Shield className="h-5 w-5" />}
            title="Account Security"
          />

          {/* Password management */}
          <div className="flex items-center justify-between py-3.5 border-b border-border">
            <div>
              <p className="text-sm font-semibold text-brand-dark">
                Password Management
              </p>
              <p className="text-xs text-brand-subtitle mt-0.5">
                {passwordNote}
              </p>
            </div>
            <Link href="/profile/edit">
              <button className="text-sm font-semibold text-brand-blue hover:opacity-70 transition-opacity">
                Change
              </button>
            </Link>
          </div>

          {/* 2FA */}
          <div className="flex items-center justify-between py-3.5 border-b border-border">
            <div>
              <p className="text-sm font-semibold text-brand-dark">
                Two-Factor Auth
              </p>
              <p className="text-xs text-brand-subtitle mt-0.5">
                Secure your account with SMS/Email
              </p>
            </div>
            <Switch
              checked={twoFactor}
              onCheckedChange={(v) => {
                setTwoFactor(v);
                savePreferences({ two_factor_enabled: v });
              }}
              className="data-[state=checked]:bg-brand-navy"
            />
          </div>

          {/* Connected accounts */}
          <div className="pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle mb-3">
              Connected Accounts
            </p>
            <div className="flex items-center gap-2">
              {profile?.connected_google || profile?.connected_microsoft ? (
                <>
                  <ConnectedTile
                    label="Google"
                    connected={profile?.connected_google ?? false}
                    color="bg-slate-200 border-slate-200 text-slate-500"
                  />
                  <ConnectedTile
                    label="Microsoft"
                    connected={profile?.connected_microsoft ?? false}
                    color="bg-brand-navy border-brand-navy"
                  />
                </>
              ) : (
                <ConnectedTile label="Add" connected={false} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── System Preferences ── */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <SectionHeader
          icon={<SlidersHorizontal className="h-5 w-5" />}
          title="System Preferences"
        />

        <div className="grid grid-cols-2 gap-10">
          {/* Notification Settings */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Bell className="h-4 w-4 text-brand-subtitle" />
              <p className="text-sm font-bold text-brand-dark">
                Notification Settings
              </p>
            </div>
            <div className="space-y-8">
              {[
                {
                  label: "Email Notifications",
                  checked: emailNotif,
                  onChange: (v: boolean) => {
                    setEmailNotif(v);
                    savePreferences({ email_notifications: v });
                  },
                  icon: (
                    <Mail className="h-3.5 w-3.5 text-brand-subtitle" />
                  ),
                },
                {
                  label: "Push Notifications",
                  checked: pushNotif,
                  onChange: (v: boolean) => {
                    setPushNotif(v);
                    savePreferences({ push_notifications: v });
                  },
                  icon: (
                    <Smartphone className="h-3.5 w-3.5 text-brand-subtitle" />
                  ),
                },
                {
                  label: "SMS Alerts",
                  checked: smsAlerts,
                  onChange: (v: boolean) => {
                    setSmsAlerts(v);
                    savePreferences({ sms_alerts: v });
                  },
                  icon: (
                    <MessageSquare className="h-3.5 w-3.5 text-brand-subtitle" />
                  ),
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
                    <label
                      htmlFor={item.label}
                      className="text-sm text-slate-600 cursor-pointer select-none"
                    >
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
              <Eye className="h-4 w-4 text-brand-subtitle" />
              <p className="text-sm font-bold text-brand-dark">
                Privacy & Display
              </p>
            </div>
            <div className="space-y-4 ml-6">
              {/* Profile Visibility */}
              <div className="flex items-center gap-2">
                <Drama className="h-4 w-4 text-brand-subtitle" />
                <p className="text-sm text-slate-600">Profile Visibility</p>
                <div className="ml-auto">
                  <Select
                    value={visibility}
                    onValueChange={(v) => {
                      setVisibility(v);
                      savePreferences({ profile_visibility: v });
                    }}
                  >
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

              {/* Dark Mode */}
              <div className="flex items-center gap-2">
                <SunMoon className="h-4 w-4 text-brand-subtitle" />
                <p className="text-sm text-slate-600">Dark Mode</p>
                <div className="flex items-center rounded-xl border border-border overflow-hidden text-sm font-semibold h-8 ml-auto">
                  <button
                    onClick={() => {
                      setDarkMode("light");
                      savePreferences({ dark_mode: "light" });
                    }}
                    className={`px-3 h-full transition-colors ${darkMode === "light" ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => {
                      setDarkMode("dark");
                      savePreferences({ dark_mode: "dark" });
                    }}
                    className={`px-3 h-full border-l border-border transition-colors ${darkMode === "dark" ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-brand-subtitle" />
                  <p className="text-sm text-slate-600">Language</p>
                </div>
                <Select
                  value={language}
                  onValueChange={(v) => {
                    setLanguage(v);
                    savePreferences({ language: v });
                  }}
                >
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

        {/* Saving indicator */}
        {saving && (
          <div className="flex items-center gap-1.5 mt-4 text-xs text-brand-subtitle">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving…
          </div>
        )}
      </div>

      {/* ── Danger Zone ── */}
      <div className="rounded-2xl border border-red-200 bg-white p-6">
        <SectionHeader
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Danger Zone"
          color="text-red-500"
        />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-dark">
              Delete Account
            </p>
            <p className="text-xs text-brand-subtitle mt-0.5 max-w-sm">
              Once you delete your account, there is no going back. Please be
              certain about this action.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(true)}
            className="border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500 font-semibold text-sm h-10 px-5 rounded-xl transition-colors"
          >
            Delete Vortuiz Account
          </Button>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Account?</DialogTitle>
            <DialogDescription>
              This is permanent and irreversible. All your data, quizzes, and
              certificates will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDeleteAccount}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}