"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Check, Camera, Store, KeyRound, User as UserIcon } from "lucide-react";
import { clearSession } from "@/lib/auth";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { api } from "@/lib/api";
import { avatarUrl } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { user, mutate } = useCurrentUser();

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [isBusiness, setIsBusiness] = useState(false);
  const [avatar, setAvatar] = useState("");
  
  // Password form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setBio(user.bio || "");
      setIsBusiness(user.is_business);
      setAvatar(avatarUrl(user));
    }
  }, [user]);

  function handleLogout() {
    clearSession();
    router.push("/login");
    router.refresh();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await api.uploadMedia(file, "avatars");
      const updated = await api.updateMe({ avatar_url: url });
      mutate(updated);
      setAvatar(avatarUrl(updated));
    } catch {
      setProfileMsg("Failed to upload avatar.");
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    setProfileMsg("");
    try {
      const updated = await api.updateMe({
        full_name: fullName,
        bio,
        is_business: isBusiness,
      });
      mutate(updated);
      setProfileMsg("Profile updated successfully!");
      setTimeout(() => setProfileMsg(""), 3000);
    } catch {
      setProfileMsg("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSavePassword() {
    if (!oldPassword || !newPassword) return;
    setSavingPassword(true);
    setPasswordMsg("");
    try {
      await api.changePassword({ old_password: oldPassword, new_password: newPassword });
      setPasswordMsg("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordMsg(""), 3000);
    } catch (err: any) {
      setPasswordMsg(err.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  }

  if (!user) return <div className="p-8 text-center text-muted">Loading...</div>;

  return (
    <main className="flex-1 max-w-md mx-auto w-full pb-12">
      <div className="flex items-center justify-between px-4 pt-5 pb-4 sticky top-0 bg-background z-10">
        <Link href="/" className="h-9 w-9 rounded-full bg-surface border border-border flex items-center justify-center">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-base font-bold">Settings</h1>
        <div className="w-9" />
      </div>

      <div className="px-4 flex flex-col gap-8 mt-2">
        {/* Profile Settings */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <UserIcon size={18} className="text-brand" />
            <h2 className="text-sm font-bold text-muted">Profile Settings</h2>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-border">
              <Image src={avatar} alt="Avatar" fill className="object-cover" unoptimized />
              <button 
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white"
              >
                <Camera size={24} />
              </button>
            </div>
            <button onClick={() => fileRef.current?.click()} className="text-xs font-semibold text-brand">Change Photo</button>
            <input type="file" accept="image/*" ref={fileRef} onChange={handleAvatarChange} className="hidden" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted ml-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted ml-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand resize-none"
            />
          </div>

          <label className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3 cursor-pointer">
            <div className="flex items-center gap-2">
              <Store size={18} className="text-muted" />
              <span className="text-sm font-semibold">Professional Account</span>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${isBusiness ? 'bg-brand' : 'bg-border'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isBusiness ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <input 
              type="checkbox" 
              checked={isBusiness}
              onChange={(e) => setIsBusiness(e.target.checked)}
              className="hidden" 
            />
          </label>

          {profileMsg && <p className="text-xs text-brand font-semibold text-center">{profileMsg}</p>}

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="flex items-center justify-center gap-2 bg-brand text-pill font-bold rounded-xl py-3 text-sm mt-2 disabled:opacity-50"
          >
            {savingProfile ? "Saving..." : <><Check size={16} /> Save Profile</>}
          </button>
        </section>

        <div className="h-px bg-border w-full" />

        {/* Password Settings */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={18} className="text-brand" />
            <h2 className="text-sm font-bold text-muted">Security</h2>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted ml-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted ml-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>

          {passwordMsg && <p className="text-xs text-brand font-semibold text-center">{passwordMsg}</p>}

          <button
            onClick={handleSavePassword}
            disabled={savingPassword || !oldPassword || !newPassword}
            className="flex items-center justify-center gap-2 bg-surface border border-border text-foreground font-semibold rounded-xl py-3 text-sm mt-2 disabled:opacity-50"
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </section>

        <div className="h-px bg-border w-full" />

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 font-bold rounded-xl py-3 text-sm mt-2"
        >
          <LogOut size={16} />
          Log out of {user.username}
        </button>
      </div>
    </main>
  );
}
