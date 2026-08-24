import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Select } from '@/components/ui';

interface PickerOption {
  handle: string;
  label: string;
}

export default function PickerField({
  label,
  resource,
  value,
  onChange,
}: {
  label: string;
  resource: 'products' | 'collections';
  value: string;
  onChange: (value: string) => void;
}) {
  const [options, setOptions] = useState<PickerOption[]>([]);

  useEffect(() => {
    api.get(`/${resource}`).then((res) => {
      const items = resource === 'products' ? res.data.products : res.data.collections;
      setOptions(
        (items ?? [])
          .filter((item: any) => item.handle)
          .map((item: any) => ({ handle: item.handle, label: item.title ?? item.name })),
      );
    });
  }, [resource]);

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-secondary">{label}</span>
      <Select value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full">
        <option value="">— None —</option>
        {options.map((opt) => (
          <option key={opt.handle} value={opt.handle}>
            {opt.label}
          </option>
        ))}
      </Select>
    </label>
  );
}
