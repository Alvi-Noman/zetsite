import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

interface PolicyLink extends Record<string, unknown> {
  label: string;
  url: string;
}

export interface PolicyLinksSettings {
  links: PolicyLink[];
}

const DEFAULT_LINKS: PolicyLink[] = [
  { label: 'Privacy policy', url: '/' },
  { label: 'Terms of service', url: '/' },
  { label: 'Refund policy', url: '/' },
];

export const policyLinksSchema: SectionSchema = {
  type: 'policyLinks',
  label: 'Policy links',
  fields: [
    {
      key: 'links',
      type: 'repeater',
      label: 'Links',
      tab: 'content',
      itemDefault: { label: 'Policy', url: '/' },
      itemFields: [
        { key: 'label', type: 'text', label: 'Label' },
        { key: 'url', type: 'url', label: 'Link' },
      ],
    },
  ],
  defaultSettings: { links: DEFAULT_LINKS },
};

export function PolicyLinks({ settings }: SectionComponentProps<PolicyLinksSettings>) {
  const links = settings.links?.length ? settings.links : DEFAULT_LINKS;
  return (
    <div className="flex flex-wrap gap-5">
      {links.map((link, i) => (
        <a key={i} href={link.url || '/'} className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white">
          {link.label}
        </a>
      ))}
    </div>
  );
}
