import React, { useState } from 'react';
import { ScheduledPost, ScheduleStatus, SocialPlatform } from '../types';
import {
  Search,
  Play,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Download,
} from 'lucide-react';

interface ScheduleQueueViewProps {
  schedules: ScheduledPost[];
  onPublishNow: (schedule: ScheduledPost) => Promise<void>;
  onDeleteSchedule: (scheduleId: string) => Promise<void>;
  onOpenStudioRequest: () => void;
}

const PLATFORM_NAMES: Record<SocialPlatform, string> = {
  x: 'X Video',
  reels: 'Instagram Reels',
  tiktok: 'TikTok',
};

export const ScheduleQueueView: React.FC<ScheduleQueueViewProps> = ({
  schedules,
  onPublishNow,
  onDeleteSchedule,
  onOpenStudioRequest,
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | SocialPlatform>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ScheduleStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const filtered = schedules.filter((item) => {
    if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.shortTitle.toLowerCase().includes(q) ||
        item.caption.toLowerCase().includes(q) ||
        item.platform.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handlePublish = async (item: ScheduledPost) => {
    setPublishingId(item.id);
    try {
      await onPublishNow(item);
    } finally {
      setPublishingId(null);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Source Short Title',
      'Platform',
      'Aspect Mode',
      'Scheduled For',
      'Status',
      'Views',
      'Engagement %',
    ];
    const rows = filtered.map((s) => [
      s.id,
      `"${s.shortTitle.replace(/"/g, '""')}"`,
      PLATFORM_NAMES[s.platform],
      s.aspectMode,
      s.scheduledFor,
      s.status,
      String(s.viewsCount),
      String(s.engagementRate),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shortflow_schedule_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Filter & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Platform Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-md">
            {(
              [
                { id: 'all', label: 'All Channels' },
                { id: 'x', label: 'X Video' },
                { id: 'reels', label: 'IG Reels' },
                { id: 'tiktok', label: 'TikTok' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPlatformFilter(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  platformFilter === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-md">
            {(
              [
                { id: 'all', label: 'All States' },
                { id: 'queued', label: 'Queued' },
                { id: 'published', label: 'Published' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === st.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title or caption..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-200">
              No Scheduled Syndication Jobs Match Filter
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Select a YouTube Short in the Repurpose Studio to configure target aspect framing and queue cross-platform releases.
            </p>
            <button
              type="button"
              onClick={onOpenStudioRequest}
              className="mt-4 px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              Open Repurpose Studio
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-medium text-slate-400">
                  <th className="py-2.5 px-4">Source YouTube Short & Caption</th>
                  <th className="py-2.5 px-4">Destination</th>
                  <th className="py-2.5 px-4">Scheduled Window</th>
                  <th className="py-2.5 px-4">State</th>
                  <th className="py-2.5 px-4 text-right">Reach / Views</th>
                  <th className="py-2.5 px-4 text-right">Engagement</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {filtered.map((item) => {
                  const isPublished = item.status === 'published';
                  const isFailed = item.status === 'failed';
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-100 truncate">
                          {item.shortTitle}
                        </div>
                        <div className="text-slate-400 truncate mt-0.5">
                          {item.caption}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-slate-200 font-medium">
                          {PLATFORM_NAMES[item.platform]}
                        </span>
                        <span className="text-slate-500 mx-1.5" aria-hidden="true">
                          ·
                        </span>
                        <span className="font-mono text-slate-400">
                          {item.aspectMode.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap tabular-nums">
                        {item.scheduledFor.replace('T', ' ')}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Published
                          </span>
                        ) : isFailed ? (
                          <span className="inline-flex items-center gap-1.5 text-red-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            Queued
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-200 tabular-nums whitespace-nowrap">
                        {isPublished ? item.viewsCount.toLocaleString() : '—'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-200 tabular-nums whitespace-nowrap">
                        {isPublished ? `${item.engagementRate.toFixed(1)}%` : '—'}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          {!isPublished && (
                            <button
                              type="button"
                              disabled={publishingId === item.id}
                              onClick={() => handlePublish(item)}
                              className="px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                            >
                              <Play className="w-3 h-3" />
                              {publishingId === item.id ? 'Publishing...' : 'Publish Now'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteSchedule(item.id)}
                            title="Remove from queue"
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
