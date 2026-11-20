"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import ShopShell, { ShopTop, WRAP } from "@/components/ShopShell";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const STATES = [
  "Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Telangana", "Maharashtra", "Goa", "Gujarat",
  "Rajasthan", "Delhi", "Uttar Pradesh", "Madhya Pradesh", "West Bengal", "Odisha", "Punjab", "Haryana",
  "Bihar", "Jharkhand", "Chhattisgarh", "Assam", "Uttarakhand", "Himachal Pradesh", "Jammu & Kashmir",
  "Puducherry", "Other",
];

const inputCls = (bad?: boolean) =>
  [
    "w-full rounded-[14px] bg-[#fbf6ea] px-4 py-3.5 text-[15px] text-[#2a231e] outline-none transition placeholder:text-[#6a5c4f]/60",
    "border-[1.5px] focus:border-[#2a231e] focus:bg-white",
    bad ? "border-[#b8613a]" : "border-[#2a231e]/15",
  ].join(" ");

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateProfile, isAdmin } = useAuth();

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Kerala");
  const [pin, setPin] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please sign in to view your profile.");
      router.replace("/login?redirect=/profile");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setCity(user.city || "");
      setState(user.state || "Kerala");
      setPin(user.pin || "");
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!username.trim()) {
      toast.error("Full name is required.");
      setErrorMsg("Full name is required.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Mobile number is required.");
      setErrorMsg("Mobile number is required.");
      return;
    }
    if (newPassword) {
      if (!currentPassword) {
        toast.error("Please enter your current password to set a new password.");
        setErrorMsg("Please enter your current password to set a new password.");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters.");
        setErrorMsg("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match.");
        setErrorMsg("New passwords do not match.");
        return;
      }
    }

    setSaving(true);
    try {
      await updateProfile({
        username: username.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state,
        pin: pin.trim(),
        ...(newPassword ? { currentPassword, newPassword } : {}),
      });

      toast.success("Your profile has been updated successfully!");
      setSuccessMsg("Your profile has been updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ShopShell>
        <ShopTop bottom="pb-10 sm:pb-14">
          <h1 className="mb-2.5 font-[family-name:var(--font-serif)] text-[length:clamp(40px,7vw,84px)] font-medium leading-[1.02]">
            Profile
          </h1>
        </ShopTop>
        <main className={`${WRAP} py-20 text-center text-[#6a5c4f]`}>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2a231e] border-t-transparent mx-auto" />
        </main>
      </ShopShell>
    );
  }

  if (!user) {
    return (
      <ShopShell>
        <ShopTop bottom="pb-10 sm:pb-14">
          <h1 className="mb-2.5 font-[family-name:var(--font-serif)] text-[length:clamp(40px,7vw,84px)] font-medium leading-[1.02]">
            Account Profile
          </h1>
        </ShopTop>
        <main className={`${WRAP} py-16 text-center`}>
          <div className="rounded-[28px] bg-white p-12 text-center shadow-[0_20px_50px_-30px_rgba(42,35,30,0.15)] max-w-lg mx-auto">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-medium">Please sign in</h2>
            <p className="mt-2 text-sm text-[#6a5c4f]">Sign in with your account to access and manage your profile details.</p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-[#2a231e] px-8 py-3.5 text-sm font-medium text-[#f6e9d0] transition hover:bg-[#b8613a]"
            >
              Sign in now
            </Link>
          </div>
        </main>
      </ShopShell>
    );
  }

  return (
    <ShopShell>
      <ShopTop bottom="pb-10 sm:pb-14">
        <h1 className="mb-2.5 font-[family-name:var(--font-serif)] text-[length:clamp(40px,7vw,84px)] font-medium leading-[1.02] tracking-[-0.01em]">
          Account Profile
        </h1>
        <p className="text-base text-[#f6e9d0]/65">
          {isAdmin ? "Manage administrator profile and credentials" : "Manage your delivery addresses and account details"}
        </p>
      </ShopTop>

      <main className={`${WRAP} py-12 sm:py-16`}>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[28px] bg-white p-6 sm:p-10 shadow-[0_25px_60px_-35px_rgba(42,35,30,0.15),inset_0_0_0_1px_rgba(42,35,30,0.06)]">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2a231e]/10 pb-6 mb-8">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#6a5c4f]">Signed in as</span>
                <p className="font-[family-name:var(--font-serif)] text-2xl font-medium text-[#2a231e]">
                  {user.username}
                </p>
                <p className="text-sm text-[#6a5c4f]">{user.email}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                  isAdmin ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                }`}>
                  {isAdmin ? "Admin Account" : "Customer"}
                </span>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-full bg-[#f08a24] text-black px-4 py-1 text-xs font-bold uppercase tracking-wider hover:bg-[#d97517] transition"
                  >
                    Open Dashboard
                  </Link>
                )}
                {!isAdmin && (
                  <Link
                    href="/orders"
                    className="rounded-full bg-[#2a231e] text-[#f6e9d0] px-4 py-1 text-xs font-medium uppercase tracking-wider hover:bg-[#b8613a] transition"
                  >
                    My Orders
                  </Link>
                )}
              </div>
            </div>

            {successMsg && (
              <div className="mb-6 rounded-[14px] bg-emerald-50 border border-emerald-200 p-4 text-sm font-medium text-emerald-800">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 rounded-[14px] bg-rose-50 border border-rose-200 p-4 text-sm font-medium text-rose-800">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Personal Details */}
              <div>
                <h3 className="font-[family-name:var(--font-serif)] text-xl font-medium text-[#2a231e] mb-4">
                  Personal Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={inputCls()}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] mb-1.5">
                      Email Address (Cannot change)
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className={`${inputCls()} bg-neutral-100 cursor-not-allowed opacity-75`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className={inputCls()}
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="border-t border-[#2a231e]/10 pt-6">
                <h3 className="font-[family-name:var(--font-serif)] text-xl font-medium text-[#2a231e] mb-4">
                  Default Delivery Address
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] mb-1.5">
                      Address / Street
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={inputCls()}
                      placeholder="House number or house name, apartment, street"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] mb-1.5">
                      Town / City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputCls()}
                      placeholder="Kochi, Calicut, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] mb-1.5">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className={inputCls()}
                      placeholder="682021"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] mb-1.5">
                      State
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className={inputCls()}
                    >
                      {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="border-t border-[#2a231e]/10 pt-6">
                <h3 className="font-[family-name:var(--font-serif)] text-xl font-medium text-[#2a231e]">
                  Change Password
                </h3>
                <p className="mt-1 text-xs text-[#6a5c4f] mb-4">
                  Leave blank if you do not wish to change your password.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={inputCls()}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputCls()}
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputCls()}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#2a231e] px-9 py-4 text-[15px] font-medium text-[#f6e9d0] transition duration-300 hover:bg-[#b8613a] active:scale-98 disabled:opacity-60"
                >
                  {saving ? "Saving Changes..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </ShopShell>
  );
}

