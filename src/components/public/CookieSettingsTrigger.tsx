"use client";

import { useConsent } from "./ConsentContext";

export function CookieSettingsTrigger() {
  const { openModal } = useConsent();

  return (
    <button
      onClick={openModal}
      className="font-['Nunito'] text-[12px] text-[#6d8fa8] transition-colors hover:text-[#fcd01b] underline-offset-2 hover:underline"
    >
      Cookie-Einstellungen
    </button>
  );
}
