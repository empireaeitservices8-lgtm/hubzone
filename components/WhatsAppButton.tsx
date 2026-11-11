const PHONE = "918714410040"; // country code + number, no "+" or spaces
const MESSAGE = "Hi HubZone, I'd like to know more about your products.";

const WhatsAppIcon = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.27.65 4.4 1.78 6.2L4 29l8.03-1.74a12.1 12.1 0 0 0 4 .68C22.68 27.94 28 22.58 28 15.97 28 9.36 22.68 3 16.04 3zm0 22.9c-1.3 0-2.56-.28-3.72-.82l-.67-.31-4.77 1.03 1.05-4.62-.35-.7a9.7 9.7 0 0 1-1.5-5.2c0-5.4 4.4-9.8 9.82-9.8 5.4 0 9.8 4.4 9.8 9.8 0 5.4-4.4 9.8-9.66 9.8zm5.4-7.3c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.38-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.48.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
  </svg>
);

export default function WhatsAppButton() {
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex items-center sm:bottom-7 sm:right-7"
    >
      {/* label, desktop hover only */}
      <span className="pointer-events-none mr-3 hidden translate-x-2 whitespace-nowrap rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
        Chat on WhatsApp
      </span>

      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-xl shadow-black/25 transition-transform duration-300 group-hover:scale-110 group-active:scale-95 sm:h-16 sm:w-16">
        {/* soft pulse ring */}
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366] opacity-40 [animation-duration:2.5s] motion-reduce:animate-none"
        />
        <WhatsAppIcon />
      </span>
    </a>
  );
}