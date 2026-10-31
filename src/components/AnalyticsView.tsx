import React from 'react';
import { ScheduledPost, SourceShort } from '../types';
import { BarChart3, CheckCircle2, Clock, Film } from 'lucide-react';

interface AnalyticsViewProps {
  shorts: SourceShort[];
  schedules: ScheduledPost[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ shorts, schedules }) => {
  const published = schedules.filter((s) => s.status === 'published');
  const queued = schedules.filter((s) => s.status === 'queued');

  const totalViews = published.reduce((sum, s) => sum + s.viewsCount, 0);
  const avgEngagement =
    published.length > 0
      ? published.reduce((sum, s) => sum + s.engagementRate, 0) / published.length
      : 0;

  const byPlatform = (platform: 'x' | 'reels' | 'tiktok') => {
    const items = schedules.filter((s) => s.platform === platform);
    const pub = items.filter((s) => s.status === 'published');
    const views = pub.reduce((sum, s) => sum + s.viewsCount, 0);
    const eng =
      pub.length > 0
        ? pub.reduce((sum, s) => sum + s.engagementRate, 0) / pub.length
        : 0;
    return {
      totalJobs: items.length,
      publishedCount: pub.length,
      queuedCount: items.filter((s) => s.status === 'queued').length,
      views,
      eng,
    };
  };

  const xStats = byPlatform('x');
  const reelsStats = byPlatform('reels');
  const tiktokStats = byPlatform('tiktok');

  return (
    <div className="space-y-6">
      {/* Top 4-Column Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400">Source Shorts Imported</span>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            {shorts.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Master 9:16 vertical assets in library
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400">Published Syndications</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {published.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {queued.length} additional releases in queue
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400">Cumulative Cross-Feed Views</span>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            {totalViews.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Combined reach across X, Reels & TikTok
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs text-slate-400">Mean Feed Engagement Rate</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1 tabular-nums">
            {avgEngagement.toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Weighted across published short-form clips
          </p>
        </div>
      </div>

      {/* Platform Breakdown Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Channel-by-Channel Syndication Performance
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative throughput, delivery status, and audience retention across destinations
            </p>
          </div>
          <BarChart3 className="w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-medium text-slate-400">
                <th className="py-2.5 px-4">Destination Network</th>
                <th className="py-2.5 px-4">Recommended Spec</th>
                <th className="py-2.5 px-4 text-right">Queued Jobs</th>
                <th className="py-2.5 px-4 text-right">Published Posts</th>
                <th className="py-2.5 px-4 text-right">Total Views</th>
                <th className="py-2.5 px-4 text-right">Avg Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {[
                {
                  name: 'X (Twitter) Native Video',
                  spec: '9:16 or 4:5 · H.264 · ≤ 2:20',
                  stats: xStats,
                },
                {
                  name: 'Instagram Reels',
                  spec: '9:16 Safe-Zone · AAC -14 LUFS',
                  stats: reelsStats,
                },
                {
                  name: 'TikTok Vertical Feed',
                  spec: '9:16 Safe-Crop · Kinetic Subtitles',
                  stats: tiktokStats,
                },
              ].map((row) => (
                <tr key={row.name} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-100">
                    {row.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {row.spec}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400 tabular-nums">
                    {row.stats.queuedCount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 tabular-nums">
                    {row.stats.publishedCount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-100 tabular-nums">
                    {row.stats.views.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-blue-400 tabular-nums">
                    {row.stats.eng.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-Short Syndication Coverage Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Source Short Syndication Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track which YouTube Shorts have been dispatched to X, Instagram Reels, and TikTok
            </p>
          </div>
          <Film className="w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-medium text-slate-400">
                <th className="py-2.5 px-4">YouTube Short Title</th>
                <th className="py-2.5 px-4">Duration</th>
                <th className="py-2.5 px-4">X Video</th>
                <th className="py-2.5 px-4">Instagram Reels</th>
                <th className="py-2.5 px-4">TikTok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {shorts.map((short) => {
                const getStatusFor = (p: 'x' | 'reels' | 'tiktok') => {
                  const match = schedules.find(
                    (s) => s.shortId === short.id && s.platform === p
                  );
                  if (!match) return <span className="text-slate-500">Not scheduled</span>;
                  if (match.status === 'published') {
                    return (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Published ({match.viewsCount.toLocaleString()})
                      </span>
                    );
                  }
                  return (
                    <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Queued
                    </span>
                  );
                };

                return (
                  <tr key={short.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium text-slate-100">
                      {short.title}
                      <span className="text-slate-500 mx-1.5" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-mono text-slate-400">
                        {short.youtubeId}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 tabular-nums">
                      {short.durationSec}s
                    </td>
                    <td className="py-3 px-4">{getStatusFor('x')}</td>
                    <td className="py-3 px-4">{getStatusFor('reels')}</td>
                    <td className="py-3 px-4">{getStatusFor('tiktok')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
