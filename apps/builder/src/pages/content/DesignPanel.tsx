import type { ThemeGlobalSettings } from '@zetsite/shared';
import ColorField from './fields/ColorField';
import { Input } from '@/components/ui';

export default function DesignPanel({
  settings,
  onChange,
}: {
  settings: ThemeGlobalSettings;
  onChange: (settings: ThemeGlobalSettings) => void;
}) {
  return (
    <div className="space-y-5 p-4">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Colors</h3>
        <div className="space-y-3">
          <ColorField
            label="Primary"
            value={settings.colors.primary}
            onChange={(v) => onChange({ ...settings, colors: { ...settings.colors, primary: v } })}
          />
          <ColorField
            label="Background"
            value={settings.colors.background}
            onChange={(v) => onChange({ ...settings, colors: { ...settings.colors, background: v } })}
          />
          <ColorField
            label="Text"
            value={settings.colors.text}
            onChange={(v) => onChange({ ...settings, colors: { ...settings.colors, text: v } })}
          />
          <ColorField
            label="Accent"
            value={settings.colors.accent}
            onChange={(v) => onChange({ ...settings, colors: { ...settings.colors, accent: v } })}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Typography</h3>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-secondary">Heading font</span>
            <Input
              value={settings.fonts.heading}
              onChange={(e) => onChange({ ...settings, fonts: { ...settings.fonts, heading: e.target.value } })}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-secondary">Body font</span>
            <Input
              value={settings.fonts.body}
              onChange={(e) => onChange({ ...settings, fonts: { ...settings.fonts, body: e.target.value } })}
            />
          </label>
        </div>
      </div>

      <p className="text-xs text-ink-tertiary">
        These apply site-wide as the default palette and typeface for this theme. Individual sections can still
        override colors from their own Style tab.
      </p>
    </div>
  );
}
