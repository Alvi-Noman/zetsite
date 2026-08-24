import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary transition-colors',
        'focus:border-link focus:outline-none focus:shadow-focus',
        'disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-ink-tertiary',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export default Input;
