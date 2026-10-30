'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisible, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-slate-900/90 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xl backdrop-blur hover:scale-110 active:scale-95 transition-all duration-200 border border-slate-700 dark:border-amber-400 no-print"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
