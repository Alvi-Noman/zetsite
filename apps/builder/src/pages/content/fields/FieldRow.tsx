import type { SettingField } from '@zetsite/theme-kit';
import { Input, Textarea, Select } from '@/components/ui';
import ColorField from './ColorField';
import ImageField from './ImageField';
import PickerField from './PickerField';
import RepeaterField from './RepeaterField';

function Counter({ text }: { text: string }) {
  const plain = text.replace(/<[^>]+>/g, ' ').trim();
  const words = plain ? plain.split(/\s+/).length : 0;
  return (
    <p className="mt-1 text-right text-[11px] text-ink-tertiary">
      {words} word{words === 1 ? '' : 's'} · {plain.length} chars
    </p>
  );
}

export default function FieldRow({
  field,
  value,
  onChange,
}: {
  field: SettingField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === 'repeater') {
    return (
      <RepeaterField
        label={field.label}
        itemFields={field.itemFields ?? []}
        itemDefault={field.itemDefault}
        value={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
        onChange={onChange}
      />
    );
  }
  if (field.type === 'color') {
    return <ColorField label={field.label} value={String(value)} onChange={onChange} />;
  }
  if (field.type === 'image') {
    return <ImageField label={field.label} value={String(value)} onChange={onChange} />;
  }
  if (field.type === 'product' || field.type === 'collection') {
    return (
      <PickerField
        label={field.label}
        resource={field.type === 'product' ? 'products' : 'collections'}
        value={String(value)}
        onChange={onChange}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-secondary">{field.label}</span>
        <Select value={String(value)} onChange={(e) => onChange(e.target.value)} className="w-full">
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </label>
    );
  }
  if (field.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-border"
        />
        {field.label}
      </label>
    );
  }
  if (field.type === 'richtext') {
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-secondary">{field.label}</span>
        <Textarea rows={5} value={String(value)} onChange={(e) => onChange(e.target.value)} />
        <Counter text={String(value)} />
      </label>
    );
  }
  if (field.type === 'number') {
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-secondary">{field.label}</span>
        <Input type="number" value={String(value)} onChange={(e) => onChange(Number(e.target.value))} />
      </label>
    );
  }
  if (field.type === 'text') {
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-secondary">{field.label}</span>
        <Input value={String(value)} onChange={(e) => onChange(e.target.value)} />
        <Counter text={String(value)} />
      </label>
    );
  }
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-secondary">{field.label}</span>
      <Input value={String(value)} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
