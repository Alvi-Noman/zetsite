import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

interface MenuItem extends Record<string, unknown> {
  label: string;
  url: string;
}

export interface MenuSettings {
  items: MenuItem[];
}

const DEFAULT_ITEM: MenuItem = { label: 'Shop', url: '/' };

export const menuSchema: SectionSchema = {
  type: 'menu',
  label: 'Menu',
  fields: [
    {
      key: 'items',
      type: 'repeater',
      label: 'Links',
      tab: 'content',
      itemDefault: DEFAULT_ITEM,
      itemFields: [
        { key: 'label', type: 'text', label: 'Label' },
        { key: 'url', type: 'url', label: 'Link' },
      ],
    },
  ],
  defaultSettings: { items: [DEFAULT_ITEM, { label: 'Collections', url: '/' }] },
};

export function Menu({ settings }: SectionComponentProps<MenuSettings>) {
  const items = settings.items?.length ? settings.items : [DEFAULT_ITEM];
  return (
    <nav className="flex items-center gap-5">
      {items.map((item, i) => (
        <a key={i} href={item.url || '/'} className="text-sm text-neutral-700 hover:text-neutral-900">
          {item.label}
        </a>
      ))}
    </nav>
  );
}
