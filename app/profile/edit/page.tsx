"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  ArrowLeft,
  BadgeCheck,
  Camera,
  CheckCheck,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Link2,
  Mail,
  Pencil,
  Phone,
  QrCode,
  Smartphone,
  User,
  X,
  AlertCircle,
} from "lucide-react";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, kind, onDismiss }: { message: string; kind: "success" | "error"; onDismiss: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-xl text-sm font-semibold text-white
      ${kind === "success" ? "bg-emerald-600" : "bg-red-500"}`}
      style={{ animation: "slideUp .2s ease" }}>
      {kind === "success" ? <CheckCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {message}
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

// ─── Field label ─────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle block mb-1.5">
      {children}
    </label>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="h-8 w-8 rounded-lg bg-brand-light flex items-center justify-center text-brand-blue shrink-0">
          {icon}
        </div>
        <h2 className="text-base font-bold text-brand-dark">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Linked account row ───────────────────────────────────────────────────────
function LinkedAccountRow({ name, email, connected, onToggle }: {
  name: string; email: string; connected: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-bold
          ${connected ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-400"}`}>
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-dark">{name}</p>
          <p className="text-xs text-brand-subtitle">{connected ? email : "Not connected"}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors
          ${connected
            ? "text-red-500 hover:bg-red-50"
            : "text-brand-blue bg-brand-light hover:bg-blue-100"}`}>
        {connected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EditProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [avatarSrc,    setAvatarSrc]    = useState<string | null>(null);
  const [firstName,    setFirstName]    = useState("Alexander");
  const [lastName,     setLastName]     = useState("Hamilton");
  const [email,        setEmail]        = useState("alexander.h@quizflow.pro");
  const [phone,        setPhone]        = useState("+1 (555) 000-1234");
  const [bio,          setBio]          = useState("Passionate learner focusing on data science and advanced mathematics. Currently pursuing certifications in cloud computing architecture.");
  const [institution,  setInstitution]  = useState("Global Institute of Technology");
  const [timezone,     setTimezone]     = useState("utc+0");

  // Security state
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [currentPw,    setCurrentPw]    = useState("••••••••••••");
  const [newPw,        setNewPw]        = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");

  // 2FA + linked accounts
  const [twoFactor,    setTwoFactor]    = useState(true);
  const [twoFaMethod,  setTwoFaMethod]  = useState<"sms" | "email" | "app">("sms");
  const [googleLinked, setGoogleLinked] = useState(true);
  const [msLinked,     setMsLinked]     = useState(false);

  // Sessions dialog
  const [sessionsOpen, setSessionsOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; kind: "success" | "error" } | null>(null);
  const showToast = (message: string, kind: "success" | "error" = "success") => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarSrc(URL.createObjectURL(file));
  };

  const handleSave = () => {
    if (newPw && newPw !== confirmPw) {
      showToast("Passwords do not match.", "error"); return;
    }
    if (newPw && newPw.length < 12) {
      showToast("Password must be at least 12 characters.", "error"); return;
    }
    showToast("Profile saved successfully!");
  };

  const pwStrength = (() => {
    if (!newPw) return null;
    const score = [newPw.length >= 12, /[A-Z]/.test(newPw), /[0-9]/.test(newPw), /[^A-Za-z0-9]/.test(newPw)].filter(Boolean).length;
    if (score <= 1) return { label: "Weak",   color: "bg-red-400",   width: "25%" };
    if (score === 2) return { label: "Fair",   color: "bg-amber-400", width: "50%" };
    if (score === 3) return { label: "Good",   color: "bg-blue-400",  width: "75%" };
    return                { label: "Strong", color: "bg-emerald-500",width: "100%"};
  })();

  return (
    <div className="min-h-full bg-surface pb-24">
      {/* Back + title */}
      <div className="px-6 pt-6 pb-0">
        <Link href="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-subtitle hover:text-brand-navy transition-colors group mb-4">
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Profile
        </Link>
        <h1 className="text-2xl font-bold text-brand-navy">Edit Personal Information</h1>
        <p className="text-sm text-brand-subtitle mt-1">Manage your account details and security preferences.</p>
      </div>

      <div className="px-6 pt-6 grid grid-cols-[280px_1fr] gap-5 items-start">
        {/* ── Left: Profile photo ── */}
        <div className="rounded-2xl border border-border bg-white p-6 text-center sticky top-6">
          <p className="text-sm font-bold text-brand-dark mb-5">Profile Photo</p>

          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="h-28 w-28 rounded-full overflow-hidden bg-linear-to-br from-brand-navy to-brand-blue mx-auto">
              {avatarSrc
                ? <Image src={avatarSrc} alt="avatar" className="h-full w-full object-cover" />
                : <div className="h-full w-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">AJ</span>
                  </div>
              }
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-brand-blue border-2 border-white flex items-center justify-center hover:bg-brand-navy transition-colors">
              <Pencil className="h-3.5 w-3.5 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <p className="text-xs text-brand-subtitle leading-relaxed mb-5">
            Upload a new photo.<br />Recommended size is 400×400px.
          </p>

          <Button
            onClick={() => fileRef.current?.click()}
            className="w-full bg-brand-light hover:bg-blue-100 text-brand-navy font-semibold text-sm h-9 rounded-xl transition-colors mb-2">
            <Camera className="h-3.5 w-3.5 mr-2" /> Change Photo
          </Button>
          {avatarSrc && (
            <button
              onClick={() => setAvatarSrc(null)}
              className="w-full text-sm font-semibold text-red-500 hover:opacity-70 transition-opacity py-1.5">
              Remove Current
            </button>
          )}
        </div>

        {/* ── Right: Forms ── */}
        <div className="space-y-5">

          {/* Personal Details */}
          <SectionCard icon={<User className="h-4 w-4" />} title="Personal Details">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <FieldLabel>First Name</FieldLabel>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="h-10 text-sm border-border focus-visible:ring-brand-blue rounded-xl" />
              </div>
              <div>
                <FieldLabel>Last Name</FieldLabel>
                <Input value={lastName} onChange={e => setLastName(e.target.value)}
                  className="h-10 text-sm border-border focus-visible:ring-brand-blue rounded-xl" />
              </div>
            </div>
            <div className="mb-4">
              <FieldLabel>Email Address</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email"
                  className="h-10 text-sm pl-9 border-border focus-visible:ring-brand-blue rounded-xl" />
              </div>
            </div>
            <div className="mb-4">
              <FieldLabel>Phone Number</FieldLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input value={phone} onChange={e => setPhone(e.target.value)}
                  className="h-10 text-sm pl-9 border-border focus-visible:ring-brand-blue rounded-xl" />
              </div>
            </div>
            <div className="mb-4">
              <FieldLabel>Institution</FieldLabel>
              <Input value={institution} onChange={e => setInstitution(e.target.value)}
                className="h-10 text-sm border-border focus-visible:ring-brand-blue rounded-xl" />
            </div>
            <div className="mb-4">
              <FieldLabel>Timezone</FieldLabel>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="h-10 text-sm border-border rounded-xl focus:ring-brand-blue">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc-8">UTC-8 (Pacific)</SelectItem>
                  <SelectItem value="utc-5">UTC-5 (Eastern)</SelectItem>
                  <SelectItem value="utc+0">UTC+0 (London)</SelectItem>
                  <SelectItem value="utc+1">UTC+1 (Paris)</SelectItem>
                  <SelectItem value="utc+5">UTC+5 (Karachi)</SelectItem>
                  <SelectItem value="utc+8">UTC+8 (Singapore)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>Bio</FieldLabel>
              <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                className="text-sm border-border focus-visible:ring-brand-blue rounded-xl resize-none"
                placeholder="Tell us about yourself…" />
              <p className="text-[11px] text-slate-400 mt-1 text-right">{bio.length}/300 characters</p>
            </div>
          </SectionCard>

          {/* Security — Password */}
          <SectionCard icon={<KeyRound className="h-4 w-4" />} title="Security">
            <div className="mb-4">
              <FieldLabel>Current Password</FieldLabel>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  className="h-10 text-sm border-border focus-visible:ring-brand-blue rounded-xl pr-10" />
                <button onClick={() => setShowCurrent(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <FieldLabel>New Password</FieldLabel>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="Enter new password"
                    className="h-10 text-sm border-border focus-visible:ring-brand-blue rounded-xl pr-10" />
                  <button onClick={() => setShowNew(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <FieldLabel>Confirm New Password</FieldLabel>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    className={`h-10 text-sm border-border focus-visible:ring-brand-blue rounded-xl pr-10
                      ${confirmPw && confirmPw !== newPw ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
                  <button onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password strength */}
            {pwStrength && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Password strength</span>
                  <span className={`font-semibold ${pwStrength.label === "Weak" ? "text-red-500" : pwStrength.label === "Fair" ? "text-amber-500" : pwStrength.label === "Good" ? "text-blue-500" : "text-emerald-500"}`}>
                    {pwStrength.label}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${pwStrength.color}`} style={{ width: pwStrength.width }} />
                </div>
              </div>
            )}

            {/* Hint */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-brand-light">
              <Info className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" />
              <p className="text-xs text-brand-subtitle leading-relaxed">
                Password must be at least 12 characters long and include a mix of uppercase letters, numbers, and symbols for maximum security.
              </p>
            </div>
          </SectionCard>

          {/* Two-Factor Authentication */}
          <SectionCard icon={<Smartphone className="h-4 w-4" />} title="Two-Factor Authentication">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-semibold text-brand-dark">Enable 2FA</p>
                <p className="text-xs text-brand-subtitle mt-0.5">Add an extra layer of security to your account</p>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} className="data-[state=checked]:bg-brand-navy" />
            </div>

            {twoFactor && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-subtitle mb-3">Verification Method</p>
                {([
                  { id: "sms",   icon: <Smartphone className="h-4 w-4" />, label: "SMS Text Message",  desc: "Receive a code via text" },
                  { id: "email", icon: <Mail        className="h-4 w-4" />, label: "Email",             desc: "Receive a code via email" },
                  { id: "app",   icon: <QrCode      className="h-4 w-4" />, label: "Authenticator App", desc: "Use Google Auth or similar" },
                ] as const).map(opt => (
                  <button key={opt.id} onClick={() => setTwoFaMethod(opt.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left
                      ${twoFaMethod === opt.id ? "border-brand-blue bg-brand-light" : "border-border hover:border-slate-300"}`}>
                    <span className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0
                      ${twoFaMethod === opt.id ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}>
                      {opt.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-brand-dark">{opt.label}</p>
                      <p className="text-xs text-brand-subtitle">{opt.desc}</p>
                    </div>
                    {twoFaMethod === opt.id && <BadgeCheck className="h-4 w-4 text-brand-blue ml-auto shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Linked Accounts */}
          <SectionCard icon={<Link2 className="h-4 w-4" />} title="Linked Accounts">
            <p className="text-xs text-brand-subtitle mb-4">Connect external accounts for quick sign-in.</p>
            <LinkedAccountRow name="Google"    email="alex.j@gmail.com"    connected={googleLinked} onToggle={() => setGoogleLinked(p => !p)} />
            <LinkedAccountRow name="Microsoft" email="alex.j@outlook.com"  connected={msLinked}     onToggle={() => setMsLinked(p => !p)} />

            {/* Active sessions */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-dark">Active Sessions</p>
                <p className="text-xs text-brand-subtitle">2 devices currently signed in</p>
              </div>
              <button onClick={() => setSessionsOpen(true)}
                className="text-xs font-semibold text-brand-blue hover:opacity-70 transition-opacity flex items-center gap-1">
                Manage <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ── Sticky footer ── */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white/95 backdrop-blur-sm px-6 py-4 flex items-center justify-end gap-3 z-5">
        <Link href="/profile">
          <Button variant="ghost" className="text-sm font-semibold text-brand-subtitle h-10 px-5 rounded-xl hover:text-brand-dark">
            Cancel Changes
          </Button>
        </Link>
        <Button onClick={handleSave}
          className="bg-brand-navy hover:bg-brand-blue text-white font-semibold text-sm h-10 px-6 rounded-xl transition-colors">
          Save Changes
        </Button>
      </div>

      {/* Sessions dialog */}
      <Dialog open={sessionsOpen} onOpenChange={setSessionsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-brand-dark">Active Sessions</DialogTitle>
            <DialogDescription>Devices currently signed in to your account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 my-2">
            {[
              { device: "MacBook Pro", location: "Karachi, PK", time: "Now — Current device", current: true },
              { device: "iPhone 14",   location: "Karachi, PK", time: "2 hours ago",           current: false },
            ].map(s => (
              <div key={s.device} className={`flex items-center justify-between p-3 rounded-xl border ${s.current ? "border-brand-blue bg-brand-light" : "border-border"}`}>
                <div>
                  <p className="text-sm font-semibold text-brand-dark">{s.device}</p>
                  <p className="text-xs text-brand-subtitle">{s.location} · {s.time}</p>
                </div>
                {!s.current && (
                  <button className="text-xs font-semibold text-red-500 hover:opacity-70">Sign out</button>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast && <Toast message={toast.message} kind={toast.kind} onDismiss={() => setToast(null)} />}
    </div>
  );
}