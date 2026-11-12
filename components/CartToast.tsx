import Link from "next/link";

export default function CartToast({ show, text }: { show: boolean; text: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "fixed bottom-6 left-4 right-[88px] z-[60] flex items-center gap-3.5 rounded-full bg-[#2a231e] py-2.5 pl-5 pr-2.5 text-sm font-medium text-[#f6e9d0] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.45)] transition duration-500 sm:left-1/2 sm:right-auto sm:max-w-[calc(100vw-32px)] sm:-translate-x-1/2",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0",
      ].join(" ")}
    >
      <span className="min-w-0 truncate">{text}</span>
      <Link href="/cart" tabIndex={show ? 0 : -1} className="shrink-0 rounded-full bg-[#f6e9d0] px-[18px] py-[9px] font-semibold text-[#2a231e]">
        View cart
      </Link>
    </div>
  );
}
