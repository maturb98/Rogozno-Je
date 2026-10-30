import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  // Show button on Android/Chrome or iOS
  return (
    <>
      <button
        onClick={handleInstallClick}
        aria-label="Zainstaluj aplikację Rogoźno Je"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-900 bg-red-100/90 hover:bg-red-200/90 active:scale-95 transition rounded-xl border border-red-200 whitespace-nowrap min-h-[36px]"
      >
        <Download className="w-3.5 h-3.5 text-red-700" />
        <span>Zainstaluj PWA</span>
      </button>

      {/* iOS Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-700 inline-block"></span>
                Zainstaluj na iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-sm text-stone-600">
              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="p-2 rounded-xl bg-red-50 text-red-700 shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900">1. Dotknij Udostępnij</p>
                  <p className="text-xs text-stone-500">W dolnym pasku przeglądarki Safari dotknij ikony udostępniania (kwadrat ze strzałką).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="p-2 rounded-xl bg-red-50 text-red-700 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900">2. Do ekranu początkowego</p>
                  <p className="text-xs text-stone-500">Przewiń listę opcji w dół i wybierz <strong>Do ekranu początkowego</strong>.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 px-4 bg-red-800 hover:bg-red-900 text-white font-semibold text-sm rounded-xl shadow transition"
            >
              Rozumiem, zamknij
            </button>
          </div>
        </div>
      )}
    </>
  );
};
