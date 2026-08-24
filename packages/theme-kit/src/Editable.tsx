import { useRef, type ElementType, type FocusEvent, type KeyboardEvent } from 'react';

export interface EditableProps {
  as: ElementType;
  value: string;
  fieldKey: string;
  onFieldChange?: (key: string, value: string) => void;
  className?: string;
  multiline?: boolean;
  html?: boolean;
}

// Shared by every theme section component so text fields are click-to-edit
// directly on the builder canvas (contentEditable) while staying inert,
// static text on the read-only storefront (onFieldChange is undefined there).
export function Editable({
  as: Tag,
  value,
  fieldKey,
  onFieldChange,
  className,
  multiline = false,
  html = false,
}: EditableProps) {
  const ref = useRef<HTMLElement>(null);

  if (!onFieldChange) {
    const Component = Tag as any;
    return html ? (
      <Component className={className} dangerouslySetInnerHTML={{ __html: value }} />
    ) : (
      <Component className={className}>{value}</Component>
    );
  }

  function commit() {
    const node = ref.current;
    if (!node) return;
    const next = html ? node.innerHTML : (node.textContent ?? '');
    if (next !== value) onFieldChange!(fieldKey, next);
  }

  function handleBlur(_e: FocusEvent<HTMLElement>) {
    commit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
    if (e.key === 'Escape') {
      (e.target as HTMLElement).blur();
    }
  }

  const Component = Tag as any;
  return (
    <Component
      ref={ref}
      className={`${className ?? ''} outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-sm cursor-text`}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-editable-field={fieldKey}
      dangerouslySetInnerHTML={html ? { __html: value } : undefined}
    >
      {html ? undefined : value}
    </Component>
  );
}
