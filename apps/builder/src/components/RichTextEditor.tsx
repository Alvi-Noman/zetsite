import { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';
import clsx from 'clsx';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const COMMANDS = [
  { command: 'bold', icon: Bold, label: 'Bold' },
  { command: 'italic', icon: Italic, label: 'Italic' },
  { command: 'underline', icon: Underline, label: 'Underline' },
  { command: 'insertUnorderedList', icon: List, label: 'Bullet list' },
  { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered list' },
] as const;

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current && ref.current) {
      ref.current.innerHTML = value;
      isFirstRender.current = false;
    }
  }, [value]);

  function exec(command: string) {
    ref.current?.focus();
    document.execCommand(command);
    onChange(ref.current?.innerHTML ?? '');
  }

  return (
    <div className="rounded-md border border-border focus-within:border-link">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        {COMMANDS.map(({ command, icon: Icon, label }) => (
          <button
            key={command}
            type="button"
            aria-label={label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(command)}
            className="rounded p-1.5 text-ink-secondary hover:bg-surface-hover hover:text-ink"
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={() => onChange(ref.current?.innerHTML ?? '')}
        data-placeholder={placeholder}
        className={clsx(
          'min-h-[120px] px-3 py-2 text-sm text-ink focus:outline-none',
          'empty:before:text-ink-tertiary empty:before:content-[attr(data-placeholder)]',
        )}
      />
    </div>
  );
}
