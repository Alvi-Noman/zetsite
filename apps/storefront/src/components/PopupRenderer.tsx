import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { renderSections } from '@zetsite/theme-kit';
import { fetchPublishedPage, type PublishedPage } from '../lib/api';
import { useThemeById } from '../hooks/useThemeById';

const DISMISSED_KEY = 'zetsite:popup-dismissed';

export function PopupRenderer({ storeSlug }: { storeSlug: string }) {
  const [popup, setPopup] = useState<PublishedPage | null>(null);
  const [visible, setVisible] = useState(false);
  const theme = useThemeById(popup?.themeId);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY) === '1') return;
    fetchPublishedPage(storeSlug, 'popup').then((data) => {
      if (data && data.sections.length > 0) setPopup(data);
    });
  }, [storeSlug]);

  useEffect(() => {
    if (!popup) return;
    const triggerType = popup.meta?.triggerType ?? 'delay';
    const triggerValue = popup.meta?.triggerValue ?? 5;

    if (triggerType === 'delay') {
      const timer = setTimeout(() => setVisible(true), triggerValue * 1000);
      return () => clearTimeout(timer);
    }

    if (triggerType === 'scroll') {
      function handleScroll() {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrolled >= triggerValue) setVisible(true);
      }
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    if (triggerType === 'exit_intent') {
      function handleMouseLeave(e: MouseEvent) {
        if (e.clientY <= 0) setVisible(true);
      }
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [popup]);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(DISMISSED_KEY, '1');
  }

  if (!popup || !visible || !theme) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={dismiss}>
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
        >
          <X size={14} />
        </button>
        {renderSections(popup.sections, theme, storeSlug)}
      </div>
    </div>
  );
}
