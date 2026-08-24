import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui';

interface Summary {
  email: string;
  sitesCount: number;
  message: string;
}

export default function HomePage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    api.get('/dashboard/summary').then((res) => setSummary(res.data.summary));
  }, []);

  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold text-ink">Home</h2>
      <p className="mb-8 text-ink-secondary">{summary?.message ?? 'Loading...'}</p>

      <Card className="p-6">
        <p className="text-sm text-ink-secondary">Sites</p>
        <p className="text-2xl font-semibold text-ink">{summary?.sitesCount ?? '—'}</p>
      </Card>
    </div>
  );
}
