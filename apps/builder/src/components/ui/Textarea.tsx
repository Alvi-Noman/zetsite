import { forwardRef, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={clsx(
        'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary transition-colors',
        'focus:border-link focus:outline-none focus:shadow-focus',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export default Textarea;
