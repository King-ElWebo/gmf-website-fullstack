"use client";

import React, { useState, useEffect } from "react";
import { useConsent } from "./ConsentContext";
import { X, Check, Info } from "lucide-react";

export function CookieBanner() {
  const {
    consent,
    hasInteracted,
    isModalOpen,
    openModal,
    closeModal,
    saveConsent,
    acceptAll,
    acceptNecessary,
  } = useConsent();

  // Settings modal local state before saving
  const [localAnalytics, setLocalAnalytics] = useState(consent.analytics);
  const [localMarketing, setLocalMarketing] = useState(consent.marketing);

  // Sync local state when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setLocalAnalytics(consent.analytics);
      setLocalMarketing(consent.marketing);
    }
  }, [isModalOpen, consent]);

  const handleSaveSettings = () => {
    saveConsent({
      analytics: localAnalytics,
      marketing: localMarketing,
    });
  };

  // Do not show banner at all if interacted and modal is closed
  if (hasInteracted && !isModalOpen) return null;

  return (
    <>
      {/* 1. The small popup banner at the bottom */}
      {!hasInteracted && !isModalOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 md:p-8 flex justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-4xl rounded-[24px] bg-white p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1),0_0_20px_0_rgba(0,0,0,0.05)] ring-1 ring-slate-200/50 flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-bottom-8 duration-500 fade-in">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900">Ihre Privatsphäre ist uns wichtig</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Wir nutzen Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. 
                Einige sind für den reibungslosen Betrieb essenziell, während andere uns helfen, diese Website 
                und Ihre Erfahrung zu verbessern. Sie können Ihre Auswahl jederzeit anpassen.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={openModal}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[14px] transition-colors"
              >
                Einstellungen
              </button>
              <button
                onClick={acceptNecessary}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[14px] transition-colors"
              >
                Nur notwendige
              </button>
              <button
                onClick={acceptAll}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[14px] transition-colors shadow-sm"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. The Settings Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-[24px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Cookie-Einstellungen</h2>
              <button 
                onClick={hasInteracted ? closeModal : acceptNecessary}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <p className="text-sm text-slate-600">
                Hier können Sie verschiedene Kategorien von Cookies aktivieren oder deaktivieren. 
                Weitere Informationen finden Sie in unserer Datenschutzerklärung.
              </p>

              {/* Essential */}
              <div className="flex gap-4 p-4 rounded-[16px] bg-slate-50 border border-slate-100">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Essenziell</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Diese Cookies sind für die grundlegenden Funktionen der Website zwingend erforderlich (z.B. für Ihren Anfragekorb und den sicheren Admin-Login). Sie können nicht deaktiviert werden.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex gap-4 p-4 rounded-[16px] border border-slate-100 transition-colors hover:bg-slate-50/50">
                <div className="mt-1">
                  <button
                    onClick={() => setLocalAnalytics(!localAnalytics)}
                    className={`w-10 h-6 rounded-full transition-colors relative flex items-center ${localAnalytics ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm absolute transition-transform duration-200 ${localAnalytics ? 'translate-x-[20px]' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Analytics & Statistiken</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem Informationen anonym gesammelt und ausgewertet werden.
                  </p>
                </div>
              </div>

              {/* Marketing */}
              <div className="flex gap-4 p-4 rounded-[16px] border border-slate-100 transition-colors hover:bg-slate-50/50">
                <div className="mt-1">
                  <button
                    onClick={() => setLocalMarketing(!localMarketing)}
                    className={`w-10 h-6 rounded-full transition-colors relative flex items-center ${localMarketing ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm absolute transition-transform duration-200 ${localMarketing ? 'translate-x-[20px]' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Marketing</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Werden verwendet, um Besuchern relevante Werbung auf anderen Websites anzuzeigen (z.B. Google Ads oder Meta Pixel).
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 justify-end rounded-b-[24px]">
              <button
                onClick={acceptNecessary}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-[14px] transition-colors"
              >
                Nur notwendige
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-[14px] transition-colors"
              >
                Auswahl speichern
              </button>
              <button
                onClick={acceptAll}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[14px] transition-colors shadow-sm"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
