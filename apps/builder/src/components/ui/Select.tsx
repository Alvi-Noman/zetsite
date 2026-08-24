import { forwardRef, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={clsx(
        'rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-ink transition-colors',
        'focus:border-link focus:outline-none focus:shadow-focus',
        className,
      )}
      {...props}
    />
  ),
);
Select.displayName = 'Select';

export default Select;
