"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Typings for GTM/Consent Mode
declare global {
  interface Window {
    dataLayer: any[];
  }
}

export type ConsentState = {
  essential: true; // Always true
  analytics: boolean;
  marketing: boolean;
  timestamp: string | null;
  version: number;
};

const CONSENT_VERSION = 1;
const CONSENT_KEY = "gmf_cookie_consent";

const DEFAULT_CONSENT: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
  timestamp: null,
  version: CONSENT_VERSION,
};

interface ConsentContextProps {
  consent: ConsentState;
  hasInteracted: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  saveConsent: (newConsent: Partial<ConsentState>) => void;
  acceptAll: () => void;
  acceptNecessary: () => void;
}

const ConsentContext = createContext<ConsentContextProps | undefined>(undefined);

// Helper to push to dataLayer for Google Consent Mode v2
function updateGtagConsent(consent: ConsentState) {
  if (typeof window === "undefined") return;

  // We ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }

  gtag("consent", "update", {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
  });
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ConsentState;
        // Check version. If version is old, ask again
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed);
          setHasInteracted(true);
          updateGtagConsent(parsed);
        }
      } catch (err) {
        console.error("Failed to parse consent data", err);
      }
    }
  }, []);

  const saveConsent = (updates: Partial<ConsentState>) => {
    const newConsent: ConsentState = {
      ...consent,
      ...updates,
      essential: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    setConsent(newConsent);
    setHasInteracted(true);
    setIsModalOpen(false);
    localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
    updateGtagConsent(newConsent);
  };

  const acceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
  };

  const acceptNecessary = () => {
    saveConsent({ analytics: false, marketing: false });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Prevent rendering anything until mounted so that we avoid hydration mismatches
  // (though returning context provider is fine, we just want to expose the state cleanly)
  
  return (
    <ConsentContext.Provider
      value={{
        consent,
        hasInteracted,
        isModalOpen,
        openModal,
        closeModal,
        saveConsent,
        acceptAll,
        acceptNecessary,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return context;
}
