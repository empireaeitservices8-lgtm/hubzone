"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";

const OFFICIAL_EMAIL = "hubzone6767@gmail.com";

const TOPICS = [
  "General Enquiry",
  "HubCare (Ayurvedic Wellness)",
  "HubNoir (Perfumes & Fragrances)",
  "HubCook (Cookware & Kitchen)",
  "HubCof (Pure Wayanad Coffee)",
  "HubWash (Home Cleaning)",
  "Job Enquiry",
];

const FIELD =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 transition focus:border-neutral-900 focus:outline-none focus:ring-4 focus:ring-neutral-900/10";

type Errors = {
  name?: string;
  email?: string;
  message?: string;
};

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!name.trim()) errs.name = "Please enter your full name.";
    if (!email.trim()) {
      errs.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    if (!message.trim()) errs.message = "Please enter your message.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_5k8a0f7";
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_9qhv7ng";
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "rSGEEv0ew-yZxWYso";

    const formattedTime = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const fullMessage = phone.trim()
      ? `${message.trim()}\n\n-------------------------\nCustomer Phone: ${phone.trim()}`
      : message.trim();

    const templateParams = {
      name: name.trim(),
      from_name: name.trim(),
      email: email.trim(),
      from_email: email.trim(),
      reply_to: email.trim(),
      phone: phone.trim() || "Not provided",
      topic: topic,
      title: topic,
      message: fullMessage,
      time: formattedTime,
      to_name: "HubZone Team",
    };

    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      toast.success("Mail sent successfully!");
      setSentSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setErrors({});
    } catch (err: any) {
      console.error("EmailJS Error:", err);
      toast.error(err?.text || "Failed to send email. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      {sentSuccess && (
        <div className="sm:col-span-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Mail sent successfully! We will reply to your email address shortly.</span>
          </div>
          <button
            type="button"
            onClick={() => setSentSuccess(false)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
          >
            Send another
          </button>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="c-name" className="mb-2 block text-sm font-medium text-neutral-700">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="c-name"
          name="from_name"
          placeholder="e.g. Rahul Nair"
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          aria-invalid={!!errors.name}
          className={`${FIELD} ${errors.name ? "border-red-500 ring-2 ring-red-500/10" : ""}`}
        />
        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="c-email" className="mb-2 block text-sm font-medium text-neutral-700">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="c-email"
          name="from_email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          aria-invalid={!!errors.email}
          className={`${FIELD} ${errors.email ? "border-red-500 ring-2 ring-red-500/10" : ""}`}
        />
        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="c-phone" className="mb-2 block text-sm font-medium text-neutral-700">
          Phone Number <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <input
          id="c-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="+91 98765 43210"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={FIELD}
        />
      </div>

      {/* Topic */}
      <div>
        <label htmlFor="c-topic" className="mb-2 block text-sm font-medium text-neutral-700">
          Subject / Topic
        </label>
        <select
          id="c-topic"
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={FIELD}
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div className="sm:col-span-2">
        <label htmlFor="c-message" className="mb-2 block text-sm font-medium text-neutral-700">
          Your Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="c-message"
          name="message"
          rows={5}
          placeholder="Write your enquiry or question here..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
          }}
          aria-invalid={!!errors.message}
          className={`${FIELD} ${errors.message ? "border-red-500 ring-2 ring-red-500/10" : ""} resize-y`}
        />
        {errors.message && <p className="mt-2 text-sm text-red-600">{errors.message}</p>}
      </div>

      {/* Submit Button */}
      <div className="sm:col-span-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0e1a15] px-9 py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending Email...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Send Email
            </>
          )}
        </button>
      </div>
    </form>
  );
}
