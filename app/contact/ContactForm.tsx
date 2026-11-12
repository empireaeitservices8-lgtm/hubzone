"use client";

import { useState } from "react";

/* Sends the enquiry to HubZone's WhatsApp with the message pre-filled (no backend needed). */
const WHATSAPP_NUMBER = "918714410040";

const TOPICS = ["General enquiry", "HubCare", "HubCook", "HubCof", "HubWash"];

const FIELD =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 transition focus:border-neutral-900 focus:outline-none focus:ring-4 focus:ring-neutral-900/10";

type Errors = { name?: string; message?: string };

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!message.trim()) next.message = "Please write a short message.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const parts = [
      `Hi HubZone, I'm ${name.trim()}.`,
      topic !== TOPICS[0] ? `Topic: ${topic}` : null,
      "",
      message.trim(),
      phone.trim() ? `\nMy number: ${phone.trim()}` : null,
    ].filter((x): x is string => x !== null);

    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(parts.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="c-name" className="mb-2 block text-sm font-medium text-neutral-700">
          Name
        </label>
        <input
          id="c-name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "c-name-err" : undefined}
          className={FIELD}
        />
        {errors.name && (
          <p id="c-name-err" className="mt-2 text-sm text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="c-phone" className="mb-2 block text-sm font-medium text-neutral-700">
          Phone <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <input
          id="c-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={FIELD}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="c-topic" className="mb-2 block text-sm font-medium text-neutral-700">
          Topic
        </label>
        <select id="c-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={FIELD}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="c-message" className="mb-2 block text-sm font-medium text-neutral-700">
          Message
        </label>
        <textarea
          id="c-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "c-message-err" : undefined}
          className={`${FIELD} resize-y`}
        />
        {errors.message && (
          <p id="c-message-err" className="mt-2 text-sm text-red-600">
            {errors.message}
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="w-full rounded-full bg-[#0e1a15] px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800 active:scale-[0.99] sm:w-auto"
        >
          Send Message
        </button>
        <p role="status" aria-live="polite" className="mt-3 text-sm text-neutral-500">
          {sent ? "WhatsApp opened in a new tab. Press send there to reach us." : ""}
        </p>
      </div>
    </form>
  );
}
