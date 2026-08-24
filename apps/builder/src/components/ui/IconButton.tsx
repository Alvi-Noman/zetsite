import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={clsx(
        'inline-flex items-center justify-center rounded-md p-1.5 text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
IconButton.displayName = 'IconButton';

export default IconButton;
