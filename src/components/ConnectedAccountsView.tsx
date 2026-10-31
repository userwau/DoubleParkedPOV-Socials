import React, { useEffect, useState } from 'react';
import { PeakSlotConfig, SocialPlatform } from '../types';
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Clock,
  MessageSquare,
  Link2,
  BookOpen,
} from 'lucide-react';

interface AccountStatus {
  connected: boolean;
  handle: string;
  connectedAt: string | null;
  mode: 'oauth' | 'instant_ready';
}

interface ConnectedAccountsViewProps {
  peakConfig: PeakSlotConfig;
  onUpdatePeakConfig: (next: PeakSlotConfig) => void;
  onSyncChannelNow: () => Promise<void>;
  syncingChannel: boolean;
  lastSyncedAt: string | null;
}

const DEV_CALLBACK_URL =
  'https://ais-dev-bx2skihk2njnqb6pm2zigw-886721796422.us-east1.run.app/auth/callback';
const SHARED_CALLBACK_URL =
  'https://ais-pre-bx2skihk2njnqb6pm2zigw-886721796422.us-east1.run.app/auth/callback';

export const ConnectedAccountsView: React.FC<ConnectedAccountsViewProps> = ({
  peakConfig,
  onUpdatePeakConfig,
  onSyncChannelNow,
  syncingChannel,
  lastSyncedAt,
}) => {
  const [accounts, setAccounts] = useState<Record<SocialPlatform, AccountStatus>>({
    x: {
      connected: true,
      handle: '@DoubleParkedPOV',
      connectedAt: new Date().toISOString(),
      mode: 'instant_ready',
    },
    reels: {
      connected: true,
      handle: '@doubleparkedpov',
      connectedAt: new Date().toISOString(),
      mode: 'instant_ready',
    },
    tiktok: {
      connected: true,
      handle: '@doubleparkedpov',
      connectedAt: new Date().toISOString(),
      mode: 'instant_ready',
    },
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);
  const [savedConfigNotice, setSavedConfigNotice] = useState(false);

  const fetchAccountStatus = async () => {
    try {
      const res = await fetch('/api/accounts/status');
      if (res.ok) {
        const data = await res.json();
        if (data.accounts) {
          setAccounts(data.accounts);
        }
      }
    } catch {
      // Retain default local state if offline
    }
  };

  useEffect(() => {
    fetchAccountStatus();

    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchAccountStatus();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectPlatform = async (platform: SocialPlatform) => {
    setConnectingPlatform(platform);
    try {
      const origin = window.location.origin;
      const res = await fetch(
        `/api/auth/${platform}/url?origin=${encodeURIComponent(origin)}`
      );
      if (!res.ok) return;
      const { url, hasClientKeys } = await res.json();
      if (hasClientKeys) {
        window.open(url, `oauth_${platform}`, 'width=600,height=700');
      } else {
        await fetchAccountStatus();
      }
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSavePeakConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedConfigNotice(true);
    setTimeout(() => setSavedConfigNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Section 1: @DoubleParkedPOV YouTube Source & Destination Social Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Source YouTube Channel Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Source YouTube Channel Ingestion
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Polls your channel feed for new Shorts & triggers 3-platform peak scheduling
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 whitespace-nowrap shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Target YouTube Handle</span>
              <a
                href="https://www.youtube.com/@DoubleParkedPOV/shorts"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                @DoubleParkedPOV <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Ingestion Mode</span>
              <span className="font-mono text-slate-200">
                Fully Automatic (Zero-Click Queueing)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Title Policy</span>
              <span className="font-mono text-slate-200">
                Exact Original Title + Platform Hashtags
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Last Channel Poll</span>
              <span className="font-mono text-slate-300">
                {lastSyncedAt || 'Ready to poll'}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={syncingChannel}
            onClick={onSyncChannelNow}
            className="w-full py-2.5 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingChannel ? 'animate-spin' : ''}`} />
            {syncingChannel
              ? 'Polling @DoubleParkedPOV...'
              : 'Sync @DoubleParkedPOV Shorts Now'}
          </button>
        </div>

        {/* Destination Accounts (X, Instagram Reels, TikTok) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white">
              Destination Accounts (X, TikTok & Instagram Reels)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect your official social accounts for automated peak-hour video publishing and first-comment linking
            </p>
          </div>

          <div className="space-y-3">
            {(
              [
                {
                  id: 'x',
                  title: 'X (Twitter) Native Video API',
                  peak: peakConfig.xPeakTime,
                  desc: 'Publishes 9:16/4:5 video with exact YouTube title + auto-reply link',
                  portalUrl: 'https://developer.x.com/en/portal/dashboard',
                  docsUrl: 'https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code',
                },
                {
                  id: 'tiktok',
                  title: 'TikTok Content Posting API',
                  peak: peakConfig.tiktokPeakTime,
                  desc: 'Direct post to @doubleparkedpov with safe-zone crop & #DoubleParkedPOV tags',
                  portalUrl: 'https://developers.tiktok.com/apps/',
                  docsUrl: 'https://developers.tiktok.com/doc/content-posting-api-get-started',
                },
                {
                  id: 'reels',
                  title: 'Instagram Reels (Meta Graph API)',
                  peak: peakConfig.reelsPeakTime,
                  desc: 'Publishes Reels container + first comment linking to YouTube',
                  portalUrl: 'https://developers.facebook.com/apps/',
                  docsUrl: 'https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/content-publishing',
                },
              ] as {
                id: SocialPlatform;
                title: string;
                peak: string;
                desc: string;
                portalUrl: string;
                docsUrl: string;
              }[]
            ).map((item) => {
              const st = accounts[item.id];
              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-white">{item.title}</span>
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs font-mono text-emerald-400">{st?.handle}</span>
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Daily Slot: {item.peak}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                      <a
                        href={item.portalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        Developer Portal <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-slate-700" aria-hidden="true">
                        ·
                      </span>
                      <a
                        href={item.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-slate-200 flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        OAuth & API Docs <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={connectingPlatform === item.id}
                    onClick={() => handleConnectPlatform(item.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Link2 className="w-3.5 h-3.5 text-blue-400" />
                    {connectingPlatform === item.id ? 'Authorizing...' : 'Re-Authorize OAuth'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* OAuth Callback URI Reference Box */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-md space-y-2 text-xs">
            <div className="font-semibold text-slate-200">
              OAuth 2.0 Redirect URIs (Copy & Paste into Developer Portals)
            </div>
            <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
              <span className="font-mono text-[11px] text-slate-300 truncate">
                Dev: {DEV_CALLBACK_URL}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(DEV_CALLBACK_URL, 'dev')}
                className="text-slate-400 hover:text-white flex items-center gap-1 shrink-0"
              >
                {copiedKey === 'dev' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
              <span className="font-mono text-[11px] text-slate-300 truncate">
                Shared: {SHARED_CALLBACK_URL}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(SHARED_CALLBACK_URL, 'shared')}
                className="text-slate-400 hover:text-white flex items-center gap-1 shrink-0"
              >
                {copiedKey === 'shared' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Step-by-Step OAuth Setup Guide for TikTok, X, and Instagram Reels */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Platform-by-Platform OAuth Setup & Documentation Links
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct links, required OAuth scopes, and environment keys for TikTok, X, and Instagram Reels
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* TikTok OAuth Guide Card */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-md flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="font-semibold text-white text-sm">
                01. TikTok Content Posting API
              </div>
              <p className="text-slate-400 leading-relaxed">
                Enable <span className="text-slate-200">Login Kit</span> and{' '}
                <span className="text-slate-200">Content Posting API (Direct Post)</span> in your TikTok developer app.
              </p>
              <div className="pt-1 space-y-1">
                <span className="text-slate-400 block">Required Scopes:</span>
                <code className="block bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[11px] text-slate-200">
                  user.info.basic, video.publish, video.upload
                </code>
              </div>
              <div className="pt-1 space-y-1">
                <span className="text-slate-400 block">Secrets Panel Keys:</span>
                <code className="block bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[11px] text-slate-200">
                  TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET
                </code>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-1.5">
              <a
                href="https://developers.tiktok.com/apps/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-between"
              >
                <span>TikTok Developer Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://developers.tiktok.com/doc/login-kit-web"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-200 flex items-center justify-between"
              >
                <span>TikTok OAuth 2.0 Web Guide</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://developers.tiktok.com/doc/content-posting-api-get-started"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-200 flex items-center justify-between"
              >
                <span>Content Posting API Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* X (Twitter) OAuth Guide Card */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-md flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="font-semibold text-white text-sm">
                02. X (Twitter) API v2 & Media
              </div>
              <p className="text-slate-400 leading-relaxed">
                In User Authentication Settings, enable <span className="text-slate-200">OAuth 2.0</span> with <span className="text-slate-200">Read and Write</span> permissions and select <span className="text-slate-200">Web App</span>.
              </p>
              <div className="pt-1 space-y-1">
                <span className="text-slate-400 block">Required Scopes:</span>
                <code className="block bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[11px] text-slate-200">
                  tweet.read tweet.write users.read offline.access
                </code>
              </div>
              <div className="pt-1 space-y-1">
                <span className="text-slate-400 block">Secrets Panel Keys:</span>
                <code className="block bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[11px] text-slate-200">
                  X_CLIENT_ID, X_CLIENT_SECRET
                </code>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-1.5">
              <a
                href="https://developer.x.com/en/portal/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-between"
              >
                <span>X Developer Portal Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-200 flex items-center justify-between"
              >
                <span>X OAuth 2.0 PKCE Guide</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://developer.x.com/en/docs/x-api/tweets/manage-tweets/integrate"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-200 flex items-center justify-between"
              >
                <span>Post & Reply Creation Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Instagram Reels OAuth Guide Card */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-md flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="font-semibold text-white text-sm">
                03. Instagram Reels (Meta Graph)
              </div>
              <p className="text-slate-400 leading-relaxed">
                Create a Meta Business App, add <span className="text-slate-200">Instagram Graph API</span>, and link your Professional/Creator Instagram account.
              </p>
              <div className="pt-1 space-y-1">
                <span className="text-slate-400 block">Required Scopes:</span>
                <code className="block bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[11px] text-slate-200">
                  instagram_basic, instagram_content_publish
                </code>
              </div>
              <div className="pt-1 space-y-1">
                <span className="text-slate-400 block">Secrets Panel Keys:</span>
                <code className="block bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[11px] text-slate-200">
                  INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET
                </code>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-1.5">
              <a
                href="https://developers.facebook.com/apps/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-between"
              >
                <span>Meta for Developers Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-200 flex items-center justify-between"
              >
                <span>Instagram Business OAuth Guide</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/content-publishing#reels-posts"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-200 flex items-center justify-between"
              >
                <span>Reels Publishing API Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Fixed Daily Peak-Hour Time Slots & First-Comment Automation */}
      <form
        onSubmit={handleSavePeakConfig}
        className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Fixed Daily Peak-Hour Release Slots & First-Comment Automation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every newly detected @DoubleParkedPOV Short is automatically scheduled into the next open daily peak slot per platform
            </p>
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            {savedConfigNotice ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Peak Slots Saved
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                Save Peak-Hour Config
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-md">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              X (Twitter) Daily Peak Slot
            </label>
            <input
              type="time"
              value={peakConfig.xPeakTime}
              onChange={(e) =>
                onUpdatePeakConfig({ ...peakConfig, xPeakTime: e.target.value })
              }
              className="w-full px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-800 rounded text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Midday timeline velocity window
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-md">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Instagram Reels Daily Peak Slot
            </label>
            <input
              type="time"
              value={peakConfig.reelsPeakTime}
              onChange={(e) =>
                onUpdatePeakConfig({ ...peakConfig, reelsPeakTime: e.target.value })
              }
              className="w-full px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-800 rounded text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Afternoon Explore & Reels feed peak
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-md">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              TikTok Daily Peak Slot
            </label>
            <input
              type="time"
              value={peakConfig.tiktokPeakTime}
              onChange={(e) =>
                onUpdatePeakConfig({ ...peakConfig, tiktokPeakTime: e.target.value })
              }
              className="w-full px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-800 rounded text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Prime evening For You Page session window
            </p>
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            Automated First Comment / Reply Plug Back to @DoubleParkedPOV
          </label>
          <input
            type="text"
            value={peakConfig.firstCommentTemplate}
            onChange={(e) =>
              onUpdatePeakConfig({
                ...peakConfig,
                firstCommentTemplate: e.target.value.slice(0, 280),
              })
            }
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
      </form>
    </div>
  );
};
