import React, { useState } from 'react';
import {
  AspectMode,
  CaptionStyle,
  SocialPlatform,
  SourceShort,
  VALIDATION_LIMITS,
} from '../types';
import {
  Sliders,
  Volume2,
  ShieldCheck,
  CalendarPlus,
  Check,
  Sparkles,
  ExternalLink,
  Smartphone,
  Crop,
  Type,
  Send,
} from 'lucide-react';

interface RepurposeStudioProps {
  short: SourceShort;
  onUpdateShort: (
    shortId: string,
    updates: Partial<
      Pick<
        SourceShort,
        | 'title'
        | 'aspectMode'
        | 'captionStyle'
        | 'stripWatermark'
        | 'normalizeAudioLufs'
        | 'hookText'
        | 'xCopy'
        | 'reelsCaption'
        | 'tiktokCaption'
      >
    >
  ) => Promise<void>;
  onSchedulePlatforms: (
    short: SourceShort,
    platforms: SocialPlatform[],
    scheduledFor: string,
    autoFirstComment: string
  ) => Promise<void>;
}

const ASPECT_LABELS: Record<AspectMode, { label: string; ratio: string; desc: string }> = {
  '9:16_full': {
    label: '9:16 Full Vertical',
    ratio: '1080×1920',
    desc: 'Edge-to-edge vertical master for Reels & TikTok',
  },
  '9:16_safe_crop': {
    label: '9:16 UI Safe Zone',
    ratio: '1080×1920 (Safe)',
    desc: '14% bottom & right UI margin protection for TikTok overlays',
  },
  '4:5_feed': {
    label: '4:5 X Timeline',
    ratio: '1080×1350',
    desc: 'High-retention portrait crop for X mobile timeline',
  },
  '1:1_square': {
    label: '1:1 Square Card',
    ratio: '1080×1080',
    desc: 'Universal desktop & thread preview frame',
  },
};

const CAPTION_LABELS: Record<CaptionStyle, string> = {
  kinetic_bold: 'Kinetic Word-by-Word',
  minimal_clean: 'Clean Editorial Lower-Third',
  high_contrast_box: 'High-Contrast Slate Box',
  none: 'No Burned Captions',
};

export const RepurposeStudio: React.FC<RepurposeStudioProps> = ({
  short,
  onUpdateShort,
  onSchedulePlatforms,
}) => {
  const [activePlatformPreview, setActivePlatformPreview] = useState<SocialPlatform>('tiktok');
  const [title, setTitle] = useState(short.title);
  const [aspectMode, setAspectMode] = useState<AspectMode>(short.aspectMode);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(short.captionStyle);
  const [stripWatermark, setStripWatermark] = useState(short.stripWatermark);
  const [normalizeAudioLufs, setNormalizeAudioLufs] = useState(short.normalizeAudioLufs);
  const [hookText, setHookText] = useState(short.hookText);
  const [xCopy, setXCopy] = useState(short.xCopy);
  const [reelsCaption, setReelsCaption] = useState(short.reelsCaption);
  const [tiktokCaption, setTiktokCaption] = useState(short.tiktokCaption);

  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    'x',
    'reels',
    'tiktok',
  ]);
  const [scheduledFor, setScheduledFor] = useState(() => {
    const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [autoFirstComment, setAutoFirstComment] = useState(
    `Watch the full breakdown on YouTube: ${short.youtubeUrl}`
  );
  const [savingPreset, setSavingPreset] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduledNotice, setScheduledNotice] = useState(false);
  const [showLiveEmbed, setShowLiveEmbed] = useState(false);

  // Sync local state when selected short changes
  React.useEffect(() => {
    setTitle(short.title);
    setAspectMode(short.aspectMode);
    setCaptionStyle(short.captionStyle);
    setStripWatermark(short.stripWatermark);
    setNormalizeAudioLufs(short.normalizeAudioLufs);
    setHookText(short.hookText);
    setXCopy(short.xCopy);
    setReelsCaption(short.reelsCaption);
    setTiktokCaption(short.tiktokCaption);
    setAutoFirstComment(`Full video + resources on YouTube: ${short.youtubeUrl}`);
    setShowLiveEmbed(false);
  }, [short.id]);

  const togglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleAutoOptimizeCopy = () => {
    const cleanTitle = title.trim() || short.title;
    setHookText(`Why 90% of teams miss this: ${cleanTitle.slice(0, 55)}`);
    setXCopy(
      `${cleanTitle}\n\nKey takeaway in ${short.durationSec}s:\n- Strip the friction\n- Automate the handoff\n- Ship across every vertical feed\n\nThoughts?`.slice(
        0,
        VALIDATION_LIMITS.X_COPY_MAX
      )
    );
    setReelsCaption(
      `${cleanTitle} — Here is the exact workflow breakdown in ${short.durationSec} seconds. Save this for your next release cycle.\n\n#shorts #creatorworkflow #videoproduction #contentstrategy #reels`.slice(
        0,
        VALIDATION_LIMITS.REELS_CAPTION_MAX
      )
    );
    setTiktokCaption(
      `${cleanTitle} (${short.durationSec}s breakdown) #techtok #creatorworkflow #contentautomation #videotips`.slice(
        0,
        VALIDATION_LIMITS.TIKTOK_CAPTION_MAX
      )
    );
  };

  const handleSaveChanges = async () => {
    setSavingPreset(true);
    try {
      await onUpdateShort(short.id, {
        title: title.slice(0, VALIDATION_LIMITS.TITLE_MAX),
        aspectMode,
        captionStyle,
        stripWatermark,
        normalizeAudioLufs,
        hookText: hookText.slice(0, VALIDATION_LIMITS.HOOK_MAX),
        xCopy: xCopy.slice(0, VALIDATION_LIMITS.X_COPY_MAX),
        reelsCaption: reelsCaption.slice(0, VALIDATION_LIMITS.REELS_CAPTION_MAX),
        tiktokCaption: tiktokCaption.slice(0, VALIDATION_LIMITS.TIKTOK_CAPTION_MAX),
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } finally {
      setSavingPreset(false);
    }
  };

  const handleQueueBatch = async () => {
    if (selectedPlatforms.length === 0) return;
    setScheduling(true);
    try {
      // Save any pending edits first
      const updatedShort: SourceShort = {
        ...short,
        title: title.slice(0, VALIDATION_LIMITS.TITLE_MAX),
        aspectMode,
        captionStyle,
        stripWatermark,
        normalizeAudioLufs,
        hookText: hookText.slice(0, VALIDATION_LIMITS.HOOK_MAX),
        xCopy: xCopy.slice(0, VALIDATION_LIMITS.X_COPY_MAX),
        reelsCaption: reelsCaption.slice(0, VALIDATION_LIMITS.REELS_CAPTION_MAX),
        tiktokCaption: tiktokCaption.slice(0, VALIDATION_LIMITS.TIKTOK_CAPTION_MAX),
      };
      await onUpdateShort(short.id, {
        title: updatedShort.title,
        aspectMode: updatedShort.aspectMode,
        captionStyle: updatedShort.captionStyle,
        stripWatermark: updatedShort.stripWatermark,
        normalizeAudioLufs: updatedShort.normalizeAudioLufs,
        hookText: updatedShort.hookText,
        xCopy: updatedShort.xCopy,
        reelsCaption: updatedShort.reelsCaption,
        tiktokCaption: updatedShort.tiktokCaption,
      });
      await onSchedulePlatforms(
        updatedShort,
        selectedPlatforms,
        scheduledFor,
        autoFirstComment.slice(0, VALIDATION_LIMITS.FIRST_COMMENT_MAX)
      );
      setScheduledNotice(true);
      setTimeout(() => setScheduledNotice(false), 3000);
    } finally {
      setScheduling(false);
    }
  };

  const activeCaptionPreview =
    activePlatformPreview === 'x'
      ? xCopy
      : activePlatformPreview === 'reels'
      ? reelsCaption
      : tiktokCaption;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 5 Columns: Safe-Zone Vertical Frame & Live Platform Simulator */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Platform Safe-Zone Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {short.channelName} · <span className="font-mono">{short.durationSec}s</span> · ID:{' '}
              <span className="font-mono">{short.youtubeId}</span>
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-md">
            {(['tiktok', 'reels', 'x'] as SocialPlatform[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePlatformPreview(p)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  activePlatformPreview === p
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p === 'x' ? 'X Video' : p === 'reels' ? 'Reels' : 'TikTok'}
              </button>
            ))}
          </div>
        </div>

        {/* 9:16 or 4:5 Viewport Frame */}
        <div className="mt-5 flex flex-col items-center">
          <div
            className={`relative w-full max-w-[300px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-all ${
              aspectMode === '1:1_square'
                ? 'aspect-square'
                : aspectMode === '4:5_feed'
                ? 'aspect-[4/5]'
                : 'aspect-[9/16]'
            }`}
          >
            {showLiveEmbed ? (
              <iframe
                title={short.title}
                src={`https://www.youtube.com/embed/${short.youtubeId}?autoplay=1&mute=0&loop=1`}
                className="w-full h-full object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img
                src={`https://i.ytimg.com/vi/${short.youtubeId}/hqdefault.jpg`}
                alt={short.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className={`w-full h-full object-cover ${
                  aspectMode === '9:16_safe_crop' ? 'scale-105' : ''
                }`}
              />
            )}

            {/* Measured contrast scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/50 pointer-events-none" />

            {/* Safe-Zone Guide Boundary Overlay */}
            {aspectMode === '9:16_safe_crop' && (
              <div className="absolute inset-x-4 top-10 bottom-24 border border-dashed border-amber-400/60 rounded pointer-events-none flex items-start justify-between p-1.5">
                <span className="text-[10px] font-mono text-amber-300 bg-black/70 px-1.5 py-0.5 rounded">
                  SAFE TITLE & CAPTION ZONE
                </span>
              </div>
            )}

            {/* Top Hook Banner Overlay */}
            {hookText.trim() && (
              <div className="absolute top-12 inset-x-4 pointer-events-none text-center">
                <div className="inline-block bg-slate-950/90 border border-slate-700/80 text-white text-xs font-semibold px-3 py-1.5 rounded shadow">
                  {hookText}
                </div>
              </div>
            )}

            {/* Simulated Dynamic Captions */}
            {captionStyle !== 'none' && (
              <div className="absolute inset-x-5 bottom-28 pointer-events-none text-center">
                <p
                  className={
                    captionStyle === 'kinetic_bold'
                      ? 'text-sm font-bold text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-tight'
                      : captionStyle === 'high_contrast_box'
                      ? 'inline-block bg-black/90 text-white text-xs font-medium px-2.5 py-1 rounded'
                      : 'text-xs font-medium text-slate-100 drop-shadow'
                  }
                >
                  “Automating vertical video syndication without watermark loss”
                </p>
              </div>
            )}

            {/* Right-side Simulated Platform Action Rail */}
            <div className="absolute right-2.5 bottom-24 flex flex-col items-center gap-3 text-[10px] font-mono text-slate-200 pointer-events-none">
              <div className="w-7 h-7 rounded-full bg-black/60 border border-slate-700 flex items-center justify-center">
                ♥
              </div>
              <div className="w-7 h-7 rounded-full bg-black/60 border border-slate-700 flex items-center justify-center">
                💬
              </div>
              <div className="w-7 h-7 rounded-full bg-black/60 border border-slate-700 flex items-center justify-center">
                ↗
              </div>
            </div>

            {/* Bottom Platform Caption Preview */}
            <div className="absolute inset-x-3 bottom-3 pointer-events-none pr-10">
              <div className="text-[11px] font-semibold text-white">
                {short.channelName} ·{' '}
                <span className="font-normal text-slate-300">
                  {activePlatformPreview === 'x'
                    ? 'X Video'
                    : activePlatformPreview === 'reels'
                    ? 'Instagram Reels'
                    : 'TikTok Feed'}
                </span>
              </div>
              <p className="text-[11px] text-slate-200 line-clamp-2 mt-0.5 leading-snug">
                {activeCaptionPreview}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between w-full max-w-[300px] text-xs text-slate-400">
            <button
              type="button"
              onClick={() => setShowLiveEmbed((prev) => !prev)}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Smartphone className="w-3.5 h-3.5" />
              {showLiveEmbed ? 'Show Safe-Zone Overlay' : 'Play Source YouTube Stream'}
            </button>
            <a
              href={short.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-200 flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              Source <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Transcode Spec Readout */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block">Output Container</span>
            <span className="font-mono text-slate-200">
              MP4 · H.264 · {ASPECT_LABELS[aspectMode].ratio}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Audio & Metadata</span>
            <span className="font-mono text-slate-200">
              {normalizeAudioLufs ? '-14.0 LUFS' : 'Source Gain'} ·{' '}
              {stripWatermark ? 'Clean Hash' : 'Raw'}
            </span>
          </div>
        </div>
      </div>

      {/* Right 7 Columns: Transcoding Controls, Platform Copy & Multi-Channel Scheduler */}
      <div className="lg:col-span-7 space-y-6">
        {/* Panel 1: Video Framing, Captions & Audio Mastering */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                01. Repurposing & Mastering Parameters
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure aspect framing, burned-in captions, and watermark removal
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoOptimizeCopy}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Regenerate Platform Hooks
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Release Title ({title.length}/{VALIDATION_LIMITS.TITLE_MAX})
                </label>
                <input
                  type="text"
                  value={title}
                  maxLength={VALIDATION_LIMITS.TITLE_MAX}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  3-Second Visual Hook Overlay ({hookText.length}/{VALIDATION_LIMITS.HOOK_MAX})
                </label>
                <input
                  type="text"
                  value={hookText}
                  maxLength={VALIDATION_LIMITS.HOOK_MAX}
                  onChange={(e) => setHookText(e.target.value)}
                  placeholder="Optional top hook banner text..."
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-slate-400" />
                Target Aspect Ratio & UI Safe-Zone Crop
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(ASPECT_LABELS) as AspectMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAspectMode(mode)}
                    className={`p-2.5 text-left rounded-md border transition-colors ${
                      aspectMode === mode
                        ? 'bg-blue-950/50 border-blue-500 text-slate-100'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold whitespace-nowrap truncate">
                      {ASPECT_LABELS[mode].label}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {ASPECT_LABELS[mode].ratio}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Caption Preset & Processing Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-slate-400" />
                  Burned-In Subtitle Preset
                </label>
                <select
                  value={captionStyle}
                  onChange={(e) => setCaptionStyle(e.target.value as CaptionStyle)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {(Object.keys(CAPTION_LABELS) as CaptionStyle[]).map((style) => (
                    <option key={style} value={style}>
                      {CAPTION_LABELS[style]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col justify-end gap-2">
                <label className="flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-md cursor-pointer">
                  <span className="text-xs text-slate-200 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Strip YouTube Watermark & Metadata
                  </span>
                  <input
                    type="checkbox"
                    checked={stripWatermark}
                    onChange={(e) => setStripWatermark(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-md cursor-pointer">
                  <span className="text-xs text-slate-200 flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                    Normalize Loudness (-14 LUFS)
                  </span>
                  <input
                    type="checkbox"
                    checked={normalizeAudioLufs}
                    onChange={(e) => setNormalizeAudioLufs(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Platform-Native Copy & Hashtag Adaptation */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                02. Cross-Platform Copy & Metadata Adaptation
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tailor post copy for X character limits, Instagram Reels SEO, and TikTok search tags
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={savingPreset}
              className="px-3.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {savedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Saved Preset
                </>
              ) : (
                <>
                  <Sliders className="w-3.5 h-3.5" />
                  {savingPreset ? 'Saving...' : 'Save Preset'}
                </>
              )}
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-300">X (Twitter) Native Video Post</span>
                <span className="font-mono text-slate-400">
                  {xCopy.length}/{VALIDATION_LIMITS.X_COPY_MAX}
                </span>
              </div>
              <textarea
                rows={2}
                value={xCopy}
                maxLength={VALIDATION_LIMITS.X_COPY_MAX}
                onChange={(e) => setXCopy(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-300">Instagram Reels Caption</span>
                  <span className="font-mono text-slate-400">
                    {reelsCaption.length}/{VALIDATION_LIMITS.REELS_CAPTION_MAX}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={reelsCaption}
                  maxLength={VALIDATION_LIMITS.REELS_CAPTION_MAX}
                  onChange={(e) => setReelsCaption(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-300">TikTok Search Caption</span>
                  <span className="font-mono text-slate-400">
                    {tiktokCaption.length}/{VALIDATION_LIMITS.TIKTOK_CAPTION_MAX}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={tiktokCaption}
                  maxLength={VALIDATION_LIMITS.TIKTOK_CAPTION_MAX}
                  onChange={(e) => setTiktokCaption(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Multi-Channel Dispatch & Schedule Trigger */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                03. Automated Cross-Platform Dispatch
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select target destinations, schedule release window, and attach first-comment CTA
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Destinations
              </label>
              <div className="flex items-center gap-2">
                {(
                  [
                    { id: 'x', label: 'X Video' },
                    { id: 'reels', label: 'IG Reels' },
                    { id: 'tiktok', label: 'TikTok' },
                  ] as { id: SocialPlatform; label: string }[]
                ).map((item) => {
                  const active = selectedPlatforms.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => togglePlatform(item.id)}
                      className={`flex-1 py-2 px-3 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Scheduled Publish Window
              </label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="button"
                disabled={scheduling || selectedPlatforms.length === 0}
                onClick={handleQueueBatch}
                className="w-full py-2 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-md transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                {scheduledNotice ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Queued ({selectedPlatforms.length})
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-3.5 h-3.5" />
                    {scheduling ? 'Queueing...' : `Schedule (${selectedPlatforms.length})`}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Auto-Post First Comment / Thread Plug ({autoFirstComment.length}/
              {VALIDATION_LIMITS.FIRST_COMMENT_MAX})
            </label>
            <div className="flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="text"
                value={autoFirstComment}
                maxLength={VALIDATION_LIMITS.FIRST_COMMENT_MAX}
                onChange={(e) => setAutoFirstComment(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
