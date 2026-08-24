import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check } from 'lucide-react';
import Modal from '@/components/Modal';
import { Input, Button } from '@/components/ui';

export default function LandingPageShareModal({
  url,
  title,
  description,
  ogImage,
  onClose,
}: {
  url: string;
  title: string;
  description: string;
  ogImage: string;
  onClose: () => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [utmSource, setUtmSource] = useState('facebook');
  const [utmMedium, setUtmMedium] = useState('cpc');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 200, margin: 1 }).then(setQrDataUrl);
  }, [url]);

  const taggedUrl = (() => {
    const u = new URL(url);
    if (utmSource) u.searchParams.set('utm_source', utmSource);
    if (utmMedium) u.searchParams.set('utm_medium', utmMedium);
    if (utmCampaign) u.searchParams.set('utm_campaign', utmCampaign);
    return u.toString();
  })();

  async function copyLink() {
    await navigator.clipboard.writeText(taggedUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Modal title="Share this page" onClose={onClose}>
      <div className="space-y-5">
        {qrDataUrl && (
          <div className="flex justify-center">
            <img src={qrDataUrl} alt="QR code for this page" className="rounded-md border border-border" />
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-ink-secondary">UTM-tagged link</p>
          <div className="mb-2 grid grid-cols-3 gap-1.5">
            <Input value={utmSource} onChange={(e) => setUtmSource(e.target.value)} placeholder="source" />
            <Input value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} placeholder="medium" />
            <Input value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} placeholder="campaign" />
          </div>
          <div className="flex gap-1.5">
            <Input value={taggedUrl} readOnly className="flex-1 text-xs" />
            <Button variant="secondary" size="sm" onClick={copyLink}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </Button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-ink-secondary">Share preview</p>
          <div className="overflow-hidden rounded-md border border-border">
            {ogImage ? <div className="aspect-[1.91/1] w-full bg-surface-secondary" style={{ backgroundImage: `url(${ogImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} /> : null}
            <div className="p-3">
              <p className="truncate text-xs text-ink-tertiary">{new URL(url).hostname}</p>
              <p className="text-sm font-medium text-ink">{title || 'Untitled page'}</p>
              <p className="line-clamp-2 text-xs text-ink-secondary">{description || 'No description set.'}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
