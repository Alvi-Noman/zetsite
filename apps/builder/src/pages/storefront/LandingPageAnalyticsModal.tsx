import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import { api } from '@/lib/api';

interface DailyPoint {
  date: string;
  views: number;
  conversions: number;
}

interface AnalyticsData {
  views: number;
  conversions: number;
  conversionRate: number;
  daily: DailyPoint[];
  utm: Record<string, number>;
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const max = Math.max(1, ...points);
  const width = 280;
  const height = 60;
  const step = width / Math.max(1, points.length - 1);
  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - (v / max) * height}`).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full">
      <path d={path} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}

export default function LandingPageAnalyticsModal({ landingPageId, onClose }: { landingPageId: string; onClose: () => void }) {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.get(`/landing-pages/${landingPageId}/analytics`).then((res) => setData(res.data));
  }, [landingPageId]);

  return (
    <Modal title="Analytics" onClose={onClose}>
      {!data ? (
        <p className="text-sm text-ink-secondary">Loading…</p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-semibold text-ink">{data.views}</p>
              <p className="text-xs text-ink-tertiary">Views</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">{data.conversions}</p>
              <p className="text-xs text-ink-tertiary">Conversions</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">{(data.conversionRate * 100).toFixed(1)}%</p>
              <p className="text-xs text-ink-tertiary">Conv. rate</p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-ink-secondary">Views — last 14 days</p>
            <Sparkline points={data.daily.map((d) => d.views)} color="#2563eb" />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-ink-secondary">Conversions — last 14 days</p>
            <Sparkline points={data.daily.map((d) => d.conversions)} color="#16a34a" />
          </div>

          {Object.keys(data.utm).length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-ink-secondary">Traffic by UTM source</p>
              <div className="space-y-1">
                {Object.entries(data.utm)
                  .sort((a, b) => b[1] - a[1])
                  .map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between text-xs">
                      <span className="text-ink-secondary">{source}</span>
                      <span className="text-ink">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
