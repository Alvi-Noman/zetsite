import { useEffect, useRef, useState } from 'react';
import { GripVertical, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';
import { Input, Button } from '@/components/ui';
import type { MediaFile } from '@/components/MediaDropzone';

function thumbOf(m: MediaFile) {
  return m.variants?.thumbnail ?? m.url;
}

export interface VariantOption {
  name: string;
  values: string[];
}

export interface VariantRow {
  label: string;
  values: string[];
  price: string;
  sku: string;
  available: string;
  image: string | null;
}

interface OptionState extends VariantOption {
  id: string;
  editing: boolean;
  draft: string;
}

interface InitialVariant {
  label: string;
  values: string[];
  price?: number | null;
  sku?: string;
  available?: number;
  image?: string | null;
}

interface VariantsEditorProps {
  initialOptions: VariantOption[];
  initialVariants: InitialVariant[];
  media: MediaFile[];
  onChange: (options: VariantOption[], variants: VariantRow[]) => void;
}

interface VariantData {
  price: string;
  sku: string;
  available: string;
  image: string | null;
}

type VariantDataMap = Record<string, VariantData>;

const EMPTY_VARIANT_DATA: VariantData = { price: '', sku: '', available: '0', image: null };

function cartesian(options: OptionState[]): string[][] {
  const withValues = options.filter((o) => o.name.trim() && o.values.length > 0);
  if (withValues.length === 0) return [];
  return withValues.reduce<string[][]>(
    (acc, option) => acc.flatMap((combo) => option.values.map((v) => [...combo, v])),
    [[]],
  );
}

function VariantImageCell({
  image,
  media,
  onSelect,
}: {
  image: string | null;
  media: MediaFile[];
  onSelect: (url: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const images = media.filter((m) => m.type === 'image');

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-secondary hover:border-border-strong"
      >
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon size={14} className="text-ink-tertiary" />
        )}
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-56 rounded-md border border-border bg-surface p-2 shadow-md">
          {images.length === 0 ? (
            <p className="px-1 py-2 text-xs text-ink-tertiary">
              Upload media above to assign an image.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {images.map((m) => {
                const thumb = thumbOf(m);
                return (
                  <button
                    key={m.url}
                    type="button"
                    onClick={() => {
                      onSelect(thumb);
                      setOpen(false);
                    }}
                    className={clsx(
                      'aspect-square overflow-hidden rounded border',
                      image === thumb ? 'border-link' : 'border-border hover:border-border-strong',
                    )}
                  >
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
          {image && (
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              className="mt-2 w-full rounded-md px-2 py-1 text-left text-xs text-danger hover:bg-danger-subtle"
            >
              Remove image
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function VariantsEditor({
  initialOptions,
  initialVariants,
  media,
  onChange,
}: VariantsEditorProps) {
  const [options, setOptions] = useState<OptionState[]>(() =>
    initialOptions.map((o) => ({ ...o, id: crypto.randomUUID(), editing: false, draft: '' })),
  );
  const [variantData, setVariantData] = useState<VariantDataMap>(() => {
    const map: VariantDataMap = {};
    initialVariants.forEach((v) => {
      map[v.values.join('|')] = {
        price: v.price !== undefined && v.price !== null ? String(v.price) : '',
        sku: v.sku ?? '',
        available: v.available !== undefined ? String(v.available) : '0',
        image: v.image ?? null,
      };
    });
    return map;
  });

  const combos = cartesian(options);

  useEffect(() => {
    const cleanOptions = options
      .filter((o) => o.name.trim() && o.values.length > 0)
      .map((o) => ({ name: o.name.trim(), values: o.values }));

    const variants: VariantRow[] = combos.map((combo) => {
      const key = combo.join('|');
      const data = variantData[key] ?? EMPTY_VARIANT_DATA;
      return { label: combo.join(' / '), values: combo, ...data };
    });

    onChange(cleanOptions, variants);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, variantData]);

  function addOption() {
    setOptions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', values: [], editing: true, draft: '' },
    ]);
  }

  function updateOption(id: string, patch: Partial<OptionState>) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function removeOption(id: string) {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }

  function addValue(id: string) {
    setOptions((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const value = o.draft.trim();
        if (!value || o.values.includes(value)) return { ...o, draft: '' };
        return { ...o, values: [...o.values, value], draft: '' };
      }),
    );
  }

  function updateValueAt(id: string, index: number, value: string) {
    setOptions((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, values: o.values.map((v, i) => (i === index ? value : v)) } : o,
      ),
    );
  }

  function removeValueAt(id: string, index: number) {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, values: o.values.filter((_, i) => i !== index) } : o)),
    );
  }

  function updateVariantField(key: string, field: 'price' | 'sku' | 'available', value: string) {
    setVariantData((prev) => {
      const current = prev[key] ?? EMPTY_VARIANT_DATA;
      return { ...prev, [key]: { ...current, [field]: value } };
    });
  }

  function updateVariantImage(key: string, url: string | null) {
    setVariantData((prev) => {
      const current = prev[key] ?? EMPTY_VARIANT_DATA;
      return { ...prev, [key]: { ...current, image: url } };
    });
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-ink-secondary">Variants</h3>

      {options.length === 0 && (
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-link"
        >
          <Plus size={15} />
          Add options like size or color
        </button>
      )}

      {options.length > 0 && (
        <div className="flex flex-col gap-3">
          {options.map((option) => (
            <div key={option.id} className="rounded-md border border-border">
              {option.editing ? (
                <div className="p-3">
                  <div className="mb-3 flex items-start gap-2">
                    <GripVertical size={16} className="mt-2 shrink-0 text-ink-tertiary" />
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-ink-secondary">
                        Option name
                      </label>
                      <Input
                        value={option.name}
                        onChange={(e) => updateOption(option.id, { name: e.target.value })}
                        placeholder="Size, Color, Material..."
                      />
                    </div>
                  </div>

                  <div className="ml-6">
                    <label className="mb-1 block text-xs font-medium text-ink-secondary">
                      Option values
                    </label>
                    <div className="flex flex-col gap-2">
                      {option.values.map((value, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GripVertical size={14} className="shrink-0 text-ink-tertiary" />
                          <Input
                            value={value}
                            onChange={(e) => updateValueAt(option.id, index, e.target.value)}
                          />
                          <button
                            type="button"
                            aria-label={`Remove ${value}`}
                            onClick={() => removeValueAt(option.id, index)}
                            className="shrink-0 rounded p-1.5 text-ink-tertiary hover:text-danger"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <GripVertical size={14} className="shrink-0 text-transparent" />
                        <Input
                          value={option.draft}
                          onChange={(e) => updateOption(option.id, { draft: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              addValue(option.id);
                            }
                          }}
                          onBlur={() => addValue(option.id)}
                          placeholder="Add a value"
                        />
                        <span className="w-[26px] shrink-0" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeOption(option.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={!option.name.trim() || option.values.length === 0}
                      onClick={() => updateOption(option.id, { editing: false })}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => updateOption(option.id, { editing: true })}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-surface-hover"
                >
                  <span className="text-sm font-medium text-ink">{option.name}</span>
                  <span className="text-sm text-ink-secondary">{option.values.join(', ')}</span>
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1.5 self-start text-sm font-medium text-ink hover:text-link"
          >
            <Plus size={15} />
            Add another option
          </button>
        </div>
      )}

      {combos.length > 0 && (
        <div className="mt-4 overflow-visible rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-secondary text-xs text-ink-tertiary">
              <tr>
                <th className="w-12 px-3 py-2 font-medium" />
                <th className="px-3 py-2 font-medium">Variant</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Available</th>
              </tr>
            </thead>
            <tbody>
              {combos.map((combo) => {
                const key = combo.join('|');
                const data = variantData[key] ?? EMPTY_VARIANT_DATA;
                return (
                  <tr key={key} className="border-t border-border">
                    <td className="px-3 py-2">
                      <VariantImageCell
                        image={data.image}
                        media={media}
                        onSelect={(url) => updateVariantImage(key, url)}
                      />
                    </td>
                    <td className="px-3 py-2 text-ink">{combo.join(' / ')}</td>
                    <td className="px-3 py-2">
                      <div className="relative w-28">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-tertiary">
                          $
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={data.price}
                          onChange={(e) => updateVariantField(key, 'price', e.target.value)}
                          placeholder="0.00"
                          className="py-1.5 pl-5 text-sm"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min="0"
                        value={data.available}
                        onChange={(e) => updateVariantField(key, 'available', e.target.value)}
                        className="w-20 py-1.5 text-sm"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-border bg-surface-secondary px-3 py-2 text-xs text-ink-secondary">
            Total inventory:{' '}
            {combos.reduce((sum, c) => sum + (Number(variantData[c.join('|')]?.available) || 0), 0)}{' '}
            available
          </div>
        </div>
      )}
    </div>
  );
}
