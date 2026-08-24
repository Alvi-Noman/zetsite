import { useEffect, useState } from 'react';
import { renderSections } from '@zetsite/theme-kit';
import { fetchPublishedPage, fetchPreviewPage, type PublishedPage } from '../lib/api';
import { useThemeById } from '../hooks/useThemeById';

export function HomePage({ storeSlug }: { storeSlug: string }) {
  const [data, setData] = useState<PublishedPage | null | undefined>(undefined);
  const theme = useThemeById(data?.themeId);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const previewToken = params.get('preview');
    const previewPage = params.get('page') || 'home';

    const load = previewToken
      ? fetchPreviewPage(storeSlug, previewPage, previewToken)
      : fetchPublishedPage(storeSlug, 'home');

    load.then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [storeSlug]);

  if (data === undefined) {
    return <div className="px-6 py-24 text-center text-neutral-400">Loading…</div>;
  }

  if (data === null) {
    return (
      <div className="px-6 py-24 text-center text-neutral-400">
        This store hasn&apos;t published a homepage yet.
      </div>
    );
  }

  if (!theme) {
    return <div className="px-6 py-24 text-center text-neutral-400">Loading…</div>;
  }

  return <>{renderSections(data.sections, theme, storeSlug, { ignoreSchedule: !!new URLSearchParams(window.location.search).get('preview') })}</>;
}
