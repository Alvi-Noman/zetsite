import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { SectionAnimation } from './types.js';

const ANIMATION_CLASS: Record<Exclude<SectionAnimation, 'none'>, { hidden: string; visible: string }> = {
  'fade-in': { hidden: 'opacity-0', visible: 'opacity-100' },
  'fade-up': { hidden: 'opacity-0 translate-y-6', visible: 'opacity-100 translate-y-0' },
  'fade-down': { hidden: 'opacity-0 -translate-y-6', visible: 'opacity-100 translate-y-0' },
  'fade-left': { hidden: 'opacity-0 -translate-x-6', visible: 'opacity-100 translate-x-0' },
  'fade-right': { hidden: 'opacity-0 translate-x-6', visible: 'opacity-100 translate-x-0' },
  'zoom-in': { hidden: 'opacity-0 scale-90', visible: 'opacity-100 scale-100' },
  'slide-up': { hidden: 'translate-y-12', visible: 'translate-y-0' },
};

export function ScrollReveal({ animation, children }: { animation?: SectionAnimation; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!animation || animation === 'none');

  useEffect(() => {
    if (!animation || animation === 'none') {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [animation]);

  if (!animation || animation === 'none') return <>{children}</>;

  const classes = ANIMATION_CLASS[animation];
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? classes.visible : classes.hidden}`}>
      {children}
    </div>
  );
}
