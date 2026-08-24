import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { Editable } from '@zetsite/theme-kit';

export interface HeaderSettings {
  storeName: string;
  tagline: string;
  backgroundColor: string;
  textColor: string;
}

export const headerSchema: SectionSchema = {
  type: 'header',
  label: 'Header',
  allowedBlockTypes: ['logo', 'menu'],
  defaultBlocks: [{ type: 'menu', settings: { items: [{ label: 'Shop', url: '/' }, { label: 'About', url: '/' }] } }],
  fields: [
    { key: 'storeName', type: 'text', label: 'Store name', default: 'My Store', tab: 'content' },
    { key: 'tagline', type: 'text', label: 'Tagline', default: '', tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' },
    { key: 'textColor', type: 'color', label: 'Text color', default: '#111111', tab: 'style' },
  ],
  defaultSettings: {
    storeName: 'My Store',
    tagline: '',
    backgroundColor: '#ffffff',
    textColor: '#111111',
  },
};

export function Header({ settings, onFieldChange, renderBlocks }: SectionComponentProps<HeaderSettings>) {
  return (
    <header
      className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between gap-6"
      style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}
    >
      <div className="flex items-center gap-3">
        {renderBlocks?.((b) => b.type === 'logo')}
        <div>
          <Editable
            as="span"
            fieldKey="storeName"
            value={settings.storeName}
            onFieldChange={onFieldChange}
            className="text-lg font-semibold tracking-tight block"
          />
          {settings.tagline || onFieldChange ? (
            <Editable
              as="span"
              fieldKey="tagline"
              value={settings.tagline}
              onFieldChange={onFieldChange}
              className="text-sm opacity-70 block"
            />
          ) : null}
        </div>
      </div>
      {renderBlocks?.((b) => b.type === 'menu')}
    </header>
  );
}
