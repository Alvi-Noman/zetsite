import { Facebook, Instagram, Twitter, Youtube, Linkedin, Link as LinkIcon } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

interface SocialLink extends Record<string, unknown> {
  platform: string;
  url: string;
}

export interface SocialLinksSettings {
  links: SocialLink[];
}

const DEFAULT_LINKS: SocialLink[] = [
  { platform: 'instagram', url: '' },
  { platform: 'facebook', url: '' },
];

export const socialLinksSchema: SectionSchema = {
  type: 'socialLinks',
  label: 'Social media links',
  fields: [
    {
      key: 'links',
      type: 'repeater',
      label: 'Links',
      tab: 'content',
      itemDefault: { platform: 'instagram', url: '' },
      itemFields: [
        {
          key: 'platform',
          type: 'select',
          label: 'Platform',
          options: [
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'LinkedIn', value: 'linkedin' },
          ],
        },
        { key: 'url', type: 'url', label: 'Link' },
      ],
    },
  ],
  defaultSettings: { links: DEFAULT_LINKS },
};

const ICONS: Record<string, typeof Facebook> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
};

export function SocialLinks({ settings }: SectionComponentProps<SocialLinksSettings>) {
  const links = settings.links?.filter((l) => l.url) ?? [];
  if (links.length === 0) return null;
  return (
    <div className="flex items-center gap-3">
      {links.map((link, i) => {
        const Icon = ICONS[link.platform] ?? LinkIcon;
        return (
          <a key={i} href={link.url} className="text-neutral-500 hover:text-neutral-900">
            <Icon size={16} />
          </a>
        );
      })}
    </div>
  );
}
