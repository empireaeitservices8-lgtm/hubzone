"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import ShopShell, { ShopTop, WRAP } from "@/components/ShopShell";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

type Mode = "login" | "register";
type Values = { name: string; phone: string; id: string; email: string; password: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = { name: "", phone: "", id: "", email: "", password: "" };

const EMAIL = /^\S+@\S+\.\S+$/;
const PHONE = /^[6-9]\d{9}$/;

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return s; // 0-4
}
const STRENGTH_LABEL = ["Too short", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["#2a231e33", "#b8613a", "#d4a24c", "#4caf50", "#2e7d32"];

function validate(mode: Mode, v: Values): Errors {
  const e: Errors = {};
  if (mode === "login") {
    if (!(EMAIL.test(v.id) || PHONE.test(v.id))) e.id = "Enter your email or 10-digit mobile number";
    if (!v.password) e.password = "Enter your password";
    return e;
  }
  if (v.name.trim().length < 2) e.name = "Enter your full name";
  if (!PHONE.test(v.phone)) e.phone = "Enter a 10-digit mobile number";
  if (!EMAIL.test(v.email)) e.email = "Enter a valid email address";
  if (v.password.length < 8) e.password = "Use at least 8 characters";
  return e;
}

const inputCls = (bad?: string) =>
  [
    "w-full rounded-[14px] bg-[#fbf6ea] px-4 py-3.5 text-[15px] text-[#2a231e] outline-none transition placeholder:text-[#6a5c4f]/60",
    "border-[1.5px] focus:border-[#2a231e] focus:bg-white",
    bad ? "border-[#b8613a]" : "border-[#2a231e]/15",
  ].join(" ");

function Field({ label, error, children, aside }: { label: string; error?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] font-medium">{label}</span>
        {aside}
      </div>
      {children}
      {error && (
        <span className="text-[13px] text-[#b8613a]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

const EyeIcon = ({ off }: { off: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
);

const CheckDot = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

/** Left panel: dark, with heading and perks. Desktop only. */
function Showcase({ mode }: { mode: Mode }) {
  const perks = ["Track every order in one place", "Save addresses for faster checkout", "See offers before everyone else"];
  return (
    <div className="relative hidden flex-col justify-center overflow-hidden bg-[#2a231e] p-12 text-[#f6e9d0] [background-image:radial-gradient(700px_420px_at_90%_0,#6b3a24_0,rgba(107,58,36,.35)_45%,transparent_80%)] lg:flex">
      <div>
        <h2 className="font-[family-name:var(--font-serif)] text-[length:clamp(36px,3.4vw,52px)] font-medium leading-[1.05] tracking-[-0.01em]">
          {mode === "login" ? "Good to see you again." : "Your shelf, restocked."}
        </h2>
        <ul className="mt-6 space-y-3 text-[15px] text-[#f6e9d0]/75">
          {perks.map((t) => (
            <li key={t} className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f6e9d0]/12 text-[#f6e9d0]">
                <CheckDot />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}

function AuthContent({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { login, register } = useAuth();
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const isLogin = mode === "login";
  const score = strength(v.password);

  const set =
    (k: keyof Values) =>
      (e: ChangeEvent<HTMLInputElement>) => {
        let val: string = e.target.value;
        if (k === "phone") val = val.replace(/\D/g, "").slice(0, 10);
        setV((c) => ({ ...c, [k]: val }));
        if (errors[k]) setErrors((c) => ({ ...c, [k]: undefined }));
        setFormError("");
      };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(mode, v);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`a-${first}`)?.focus();
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      if (isLogin) {
        const res = await login(v.id, v.password);
        toast.success(`Welcome back, ${res.user.username}!`);
        if (res.user.role === "admin") {
          router.push(redirectParam || "/admin");
        } else {
          router.push(redirectParam || "/shop");
        }
      } else {
        await register({
          name: v.name,
          phone: v.phone,
          email: v.email,
          password: v.password,
        });
        toast.success("Account created successfully! Welcome to HubZone.");
        router.push(redirectParam || "/shop");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Please verify your details.");
      setFormError(err.message || "Authentication failed. Please verify your details.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ShopShell>
      <ShopTop bottom="pb-10 sm:pb-14">
        <h1 className="mb-2.5 font-[family-name:var(--font-serif)] text-[length:clamp(44px,8vw,92px)] font-medium leading-[1.02] tracking-[-0.01em]">
          {isLogin ? "Sign in" : "Create account"}
        </h1>
        <p className="text-base text-[#f6e9d0]/65">
          {isLogin ? "Welcome back to HUBZONE" : "Join HUBZONE in under a minute"}
        </p>
      </ShopTop>

      <main className={`${WRAP} pb-16 pt-7 sm:pb-24 sm:pt-12`}>
        <div className="grid overflow-hidden rounded-[28px] bg-white shadow-[0_40px_80px_-44px_rgba(42,35,30,0.5),inset_0_0_0_1px_rgba(42,35,30,0.07)] sm:rounded-[36px] lg:min-h-[680px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <Showcase mode={mode} />

          <div className="relative px-5 py-9 sm:px-12 sm:py-12 lg:flex lg:items-center lg:px-14">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#4caf50_0%,#d4a24c_35%,#f08a24_65%,#2fa8e8_100%)]" />
            <div className="mx-auto w-full max-w-[420px]">
              {/* mode switch */}
              <div className="mb-8 grid grid-cols-2 rounded-full bg-[#f0e5d0] p-1 text-[14.5px] font-medium" role="tablist">
                <Link
                  href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login"}
                  role="tab"
                  aria-selected={isLogin}
                  className={`rounded-full py-2.5 text-center transition ${isLogin ? "bg-[#2a231e] text-[#f6e9d0]" : "text-[#6a5c4f] hover:text-[#2a231e]"}`}
                >
                  Sign in
                </Link>
                <Link
                  href={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : "/register"}
                  role="tab"
                  aria-selected={!isLogin}
                  className={`rounded-full py-2.5 text-center transition ${!isLogin ? "bg-[#2a231e] text-[#f6e9d0]" : "text-[#6a5c4f] hover:text-[#2a231e]"}`}
                >
                  Create account
                </Link>
              </div>

              <h2 className="font-[family-name:var(--font-serif)] text-[length:clamp(30px,3.6vw,40px)] font-medium leading-[1.05]">
                {isLogin ? "Welcome back" : "Your details"}
              </h2>
              <p className="mt-2 text-[15px] text-[#6a5c4f]">
                {isLogin ? "Sign in to see your orders and check out faster." : "It takes less than a minute."}
              </p>

              <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-5">
                {formError && (
                  <p role="alert" className="rounded-[14px] bg-[#b8613a]/10 px-4 py-3 text-[14px] text-[#9a4a27]">
                    {formError}
                  </p>
                )}

                {isLogin ? (
                  <Field label="Email or mobile number" error={errors.id}>
                    <input id="a-id" autoComplete="username" value={v.id} onChange={set("id")} className={inputCls(errors.id)} placeholder="you@example.com" />
                  </Field>
                ) : (
                  <>
                    <Field label="Full name" error={errors.name}>
                      <input id="a-name" autoComplete="name" value={v.name} onChange={set("name")} className={inputCls(errors.name)} placeholder="Anjali Menon" />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Mobile number" error={errors.phone}>
                        <div className="flex">
                          <span className="flex items-center rounded-l-[14px] border-[1.5px] border-r-0 border-[#2a231e]/15 bg-[#f0e5d0] px-3.5 text-[15px]">+91</span>
                          <input id="a-phone" inputMode="numeric" autoComplete="tel-national" value={v.phone} onChange={set("phone")} className={`${inputCls(errors.phone)} min-w-0 rounded-l-none`} placeholder="98765 43210" />
                        </div>
                      </Field>
                      <Field label="Email" error={errors.email}>
                        <input id="a-email" type="email" autoComplete="email" value={v.email} onChange={set("email")} className={inputCls(errors.email)} placeholder="you@example.com" />
                      </Field>
                    </div>
                  </>
                )}

                <Field
                  label="Password"
                  error={errors.password}
                  aside={
                    isLogin && (
                      <Link href="/forgot-password" className="text-[13px] text-[#6a5c4f] underline underline-offset-4 transition-colors hover:text-[#b8613a]">
                        Forgot password?
                      </Link>
                    )
                  }
                >
                  <div className="relative">
                    <input
                      id="a-password"
                      type={show ? "text" : "password"}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      value={v.password}
                      onChange={set("password")}
                      className={`${inputCls(errors.password)} pr-12`}
                      placeholder={isLogin ? "Your password" : "At least 8 characters"}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? "Hide password" : "Show password"}
                      className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[#6a5c4f] transition-colors hover:bg-[#f0e5d0] hover:text-[#2a231e]"
                    >
                      <EyeIcon off={show} />
                    </button>
                  </div>
                  {!isLogin && v.password && (
                    <div className="mt-1" aria-live="polite">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((n) => (
                          <span key={n} className="h-1.5 flex-1 rounded-full transition-colors duration-300" style={{ background: n <= score ? STRENGTH_COLOR[score] : "#2a231e1f" }} />
                        ))}
                      </div>
                      <span className="mt-1.5 block text-[12.5px] text-[#6a5c4f]">{STRENGTH_LABEL[score]}</span>
                    </div>
                  )}
                </Field>

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-1 flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#2a231e] text-[15px] font-medium text-[#f6e9d0] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b8613a] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
                >
                  {busy ? (isLogin ? "Signing in…" : "Creating account…") : isLogin ? "Sign in" : "Create account"}
                </button>
              </form>

              <p className="mt-8 border-t border-[#2a231e]/10 pt-6 text-center text-[14.5px] text-[#6a5c4f]">
                {isLogin ? "New to HUBZONE?" : "Already have an account?"}{" "}
                <Link href={isLogin ? "/register" : "/login"} className="font-medium text-[#2a231e] underline underline-offset-4 transition-colors hover:text-[#b8613a]">
                  {isLogin ? "Create an account" : "Sign in"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </ShopShell>
  );
}

export default function AuthPage({ mode }: { mode: Mode }) {
  return (
    <Suspense
      fallback={
        <ShopShell>
          <ShopTop bottom="pb-10 sm:pb-14">
            <div className="mb-2.5 h-12 w-60 animate-pulse rounded bg-[#f6e9d0]/15" />
            <div className="h-5 w-40 animate-pulse rounded bg-[#f6e9d0]/15" />
          </ShopTop>
          <main className={`${WRAP} pb-16 pt-7 sm:pb-24 sm:pt-12 text-center py-20`}>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2a231e] border-t-transparent mx-auto" />
          </main>
        </ShopShell>
      }
    >
      <AuthContent mode={mode} />
    </Suspense>
  );
}
