"use client";

import { useState } from "react";
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
  Eye,
  Globe,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Settings2,
  Shield,
  SlidersHorizontal,
  Smartphone,
  User,
  UserCircle,
} from "lucide-react";

// ─── Connected account tile ───────────────────────────────────────────────────
function ConnectedTile({ label, connected, color }: { label: string; connected: boolean; color?: string }) {
  return (
    <div className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center text-[11px] font-bold cursor-pointer transition-all
      ${connected
        ? `${color ?? "bg-brand-navy border-brand-navy"} text-white`
        : "border-dashed border-border text-slate-400 hover:border-brand-blue hover:text-brand-blue"
      }`}>
      {connected ? label[0] : <Plus className="h-3.5 w-3.5" />}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, color = "text-brand-navy" }: { icon: React.ReactNode; title: string; color?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className={`${color}`}>{icon}</span>
      <h2 className={`text-lg font-bold ${color}`}>{title}</h2>
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 mb-4 last:mb-0">
      {icon && <span className="mt-0.5 text-brand-subtitle shrink-0">{icon}</span>}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-brand-dark">{value}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Profile() {
  const [twoFactor,      setTwoFactor]      = useState(true);
  const [emailNotif,     setEmailNotif]     = useState(true);
  const [pushNotif,      setPushNotif]      = useState(true);
  const [smsAlerts,      setSmsAlerts]      = useState(false);
  const [visibility,     setVisibility]     = useState("public");
  const [darkMode,       setDarkMode]       = useState<"light" | "dark">("light");
  const [language,       setLanguage]       = useState("en-us");
  const [deleteOpen,     setDeleteOpen]     = useState(false);

  return (
    <div className="min-h-full bg-surface p-6 space-y-5">

      {/* ── Profile header card ── */}
      <div className="rounded-2xl border border-border bg-white px-7 py-6 flex items-center gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-200">
            <div className="h-full w-full bg-linear-to-br from-brand-navy to-brand-blue flex items-center justify-center">
              <span className="text-2xl font-bold text-white">AJ</span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-brand-blue flex items-center justify-center border-2 border-white">
            <Settings2 className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Name + role */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-brand-dark">Alex Johnson</h1>
          <p className="text-sm text-brand-subtitle mt-0.5">Senior Student / Teacher</p>
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
          <SectionHeader icon={<UserCircle className="h-5 w-5" />} title="Personal Info" />
          <InfoRow label="Full Name"      value="Alex Johnson"                    icon={<User      className="h-3.5 w-3.5" />} />
          <InfoRow label="Email Address"  value="alex.j@institution.edu"          icon={<Mail      className="h-3.5 w-3.5" />} />
          <InfoRow label="Phone"          value="+1 (555) 012-3456"               icon={<Phone     className="h-3.5 w-3.5" />} />
          <InfoRow label="Institution"    value="Global Institute of Technology"  icon={<Building2 className="h-3.5 w-3.5" />} />
        </div>

        {/* Account Security */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <SectionHeader icon={<Shield className="h-5 w-5" />} title="Account Security" />

          {/* Password management */}
          <div className="flex items-center justify-between py-3.5 border-b border-border">
            <div>
              <p className="text-sm font-semibold text-brand-dark">Password Management</p>
              <p className="text-xs text-brand-subtitle mt-0.5">Last changed: 42 days ago</p>
            </div>
            <Link href="/profile/edit">
              <button className="text-sm font-semibold text-brand-blue hover:opacity-70 transition-opacity">Change</button>
            </Link>
          </div>

          {/* 2FA */}
          <div className="flex items-center justify-between py-3.5 border-b border-border">
            <div>
              <p className="text-sm font-semibold text-brand-dark">Two-Factor Auth</p>
              <p className="text-xs text-brand-subtitle mt-0.5">Secure your account with SMS/Email</p>
            </div>
            <Switch
              checked={twoFactor}
              onCheckedChange={setTwoFactor}
              className="data-[state=checked]:bg-brand-navy"
            />
          </div>

          {/* Connected accounts */}
          <div className="pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle mb-3">Connected Accounts</p>
            <div className="flex items-center gap-2">
              <ConnectedTile label="Google"    connected={true}  color="bg-slate-200 border-slate-200 text-slate-500" />
              <ConnectedTile label="Microsoft" connected={true}  color="bg-brand-navy border-brand-navy" />
              <ConnectedTile label="Add"       connected={false} />
            </div>
          </div>
        </div>
      </div>

      {/* ── System Preferences ── */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <SectionHeader icon={<SlidersHorizontal className="h-5 w-5" />} title="System Preferences" />

        <div className="grid grid-cols-2 gap-10">
          {/* Notification Settings */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-brand-subtitle" />
              <p className="text-sm font-bold text-brand-dark">Notification Settings</p>
            </div>
            <div className="space-y-3.5">
              {[
                { label: "Email Notifications", checked: emailNotif, onChange: setEmailNotif, icon: <Mail        className="h-3.5 w-3.5 text-brand-subtitle" /> },
                { label: "Push Notifications",  checked: pushNotif,  onChange: setPushNotif,  icon: <Smartphone  className="h-3.5 w-3.5 text-brand-subtitle" /> },
                { label: "SMS Alerts",          checked: smsAlerts,  onChange: setSmsAlerts,  icon: <MessageSquare className="h-3.5 w-3.5 text-brand-subtitle" /> },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <Checkbox
                    id={item.label}
                    checked={item.checked}
                    onCheckedChange={v => item.onChange(!!v)}
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
              <Eye className="h-4 w-4 text-brand-subtitle" />
              <p className="text-sm font-bold text-brand-dark">Privacy & Display</p>
            </div>
            <div className="space-y-4">
              {/* Profile Visibility */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Profile Visibility</p>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="h-8 text-sm border-border rounded-xl w-32 focus:ring-brand-blue">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="institution">Institution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Dark Mode</p>
                <div className="flex items-center rounded-xl border border-border overflow-hidden text-xs font-semibold h-8">
                  <button
                    onClick={() => setDarkMode("light")}
                    className={`px-3 h-full transition-colors ${darkMode === "light" ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                    Light
                  </button>
                  <button
                    onClick={() => setDarkMode("dark")}
                    className={`px-3 h-full border-l border-border transition-colors ${darkMode === "dark" ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-slate-50"}`}>
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
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-8 text-sm border-border rounded-xl w-36 focus:ring-brand-blue">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-us">English (US)</SelectItem>
                    <SelectItem value="en-gb">English (UK)</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="rounded-2xl border border-red-200 bg-white p-6">
        <SectionHeader icon={<AlertTriangle className="h-5 w-5" />} title="Danger Zone" color="text-red-500" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-dark">Delete Account</p>
            <p className="text-xs text-brand-subtitle mt-0.5 max-w-sm">
              Once you delete your account, there is no going back. Please be certain about this action.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(true)}
            className="border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500 font-semibold text-sm h-10 px-5 rounded-xl transition-colors">
            Delete QuizFlow Account
          </Button>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Account?</DialogTitle>
            <DialogDescription>
              This is permanent and irreversible. All your data, quizzes, and certificates will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white">Yes, Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}