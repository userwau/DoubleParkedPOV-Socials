import { Timestamp } from 'firebase/firestore';

export type AspectMode = '9:16_full' | '9:16_safe_crop' | '4:5_feed' | '1:1_square';
export type CaptionStyle = 'kinetic_bold' | 'minimal_clean' | 'high_contrast_box' | 'none';
export type SocialPlatform = 'x' | 'reels' | 'tiktok';
export type ScheduleStatus = 'queued' | 'publishing' | 'published' | 'failed';
export type RuleTargetPlatform = 'all' | 'x' | 'reels' | 'tiktok';

export interface SourceShort {
  id: string;
  ownerId: string;
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  channelName: string;
  durationSec: number;
  aspectMode: AspectMode;
  captionStyle: CaptionStyle;
  stripWatermark: boolean;
  normalizeAudioLufs: boolean;
  hookText: string;
  xCopy: string;
  reelsCaption: string;
  tiktokCaption: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ScheduledPost {
  id: string;
  ownerId: string;
  shortId: string;
  shortTitle: string;
  platform: SocialPlatform;
  caption: string;
  scheduledFor: string;
  status: ScheduleStatus;
  aspectMode: AspectMode;
  autoFirstComment: string;
  viewsCount: number;
  engagementRate: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AutomationRule {
  id: string;
  ownerId: string;
  name: string;
  sourceChannel: string;
  targetPlatform: RuleTargetPlatform;
  delayMinutes: number;
  stripWatermark: boolean;
  autoCaptions: boolean;
  enabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PeakSlotConfig {
  xPeakTime: string;      // e.g. '12:00'
  reelsPeakTime: string;  // e.g. '15:00'
  tiktokPeakTime: string; // e.g. '18:00'
  firstCommentTemplate: string;
  keepExactYoutubeTitle: boolean;
}

export const DEFAULT_PEAK_SLOTS: PeakSlotConfig = {
  xPeakTime: '12:00',
  reelsPeakTime: '15:00',
  tiktokPeakTime: '18:00',
  firstCommentTemplate: 'Full POV & more on YouTube: https://www.youtube.com/@DoubleParkedPOV',
  keepExactYoutubeTitle: true,
};

export const VALIDATION_LIMITS = {
  ID_REGEX: /^[a-zA-Z0-9_\-]+$/,
  TITLE_MAX: 120,
  CHANNEL_MAX: 80,
  URL_MAX: 200,
  HOOK_MAX: 120,
  X_COPY_MAX: 280,
  REELS_CAPTION_MAX: 500,
  TIKTOK_CAPTION_MAX: 400,
  FIRST_COMMENT_MAX: 280,
  RULE_NAME_MAX: 80,
} as const;

export function sanitizeString(val: string, maxLen: number, fallback = 'Untitled'): string {
  const trimmed = val.trim();
  if (!trimmed) return fallback.slice(0, maxLen);
  return trimmed.slice(0, maxLen);
}

export function sanitizeOptionalString(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}

export function extractYoutubeId(input: string): string {
  const trimmed = input.trim();
  const shortsMatch = trimmed.match(/(?:youtube\.com\/shorts\/|youtu\.be\/|v=)([a-zA-Z0-9_-]{6,32})/);
  if (shortsMatch && shortsMatch[1]) {
    return shortsMatch[1].slice(0, 64);
  }
  const cleanId = trimmed.replace(/[^a-zA-Z0-9_-]/g, '');
  if (cleanId.length >= 3) {
    return cleanId.slice(0, 64);
  }
  return 'dp_pov_911gt3';
}

/**
 * Generates platform-tailored captions that preserve the exact original YouTube title
 * and append platform-specific hashtags for @DoubleParkedPOV.
 */
export function buildDoubleParkedCaptions(exactTitle: string): {
  xCopy: string;
  reelsCaption: string;
  tiktokCaption: string;
  hookText: string;
} {
  const cleanTitle = exactTitle.trim().slice(0, VALIDATION_LIMITS.TITLE_MAX);
  return {
    hookText: cleanTitle,
    xCopy: `${cleanTitle}\n\n#DoubleParkedPOV #POV #Cars`.slice(
      0,
      VALIDATION_LIMITS.X_COPY_MAX
    ),
    reelsCaption: `${cleanTitle}\n\n#DoubleParkedPOV #CarPOV #DrivingPOV #StreetPOV #ReelsAuto #Shorts`.slice(
      0,
      VALIDATION_LIMITS.REELS_CAPTION_MAX
    ),
    tiktokCaption: `${cleanTitle} #DoubleParkedPOV #CarPOV #DrivingPOV #POV #CarTok #FYP`.slice(
      0,
      VALIDATION_LIMITS.TIKTOK_CAPTION_MAX
    ),
  };
}

/**
 * Computes the next available daily peak-hour slot (YYYY-MM-DDTHH:mm)
 * for a given platform so multiple ingested Shorts never collide in the same slot.
 */
export function computeNextPeakSlotIso(
  platform: SocialPlatform,
  peakConfig: PeakSlotConfig,
  existingSchedules: ScheduledPost[],
  dayOffset = 0
): string {
  const timeStr =
    platform === 'x'
      ? peakConfig.xPeakTime
      : platform === 'reels'
      ? peakConfig.reelsPeakTime
      : peakConfig.tiktokPeakTime;

  const [hoursStr, minsStr] = (timeStr || '12:00').split(':');
  const targetHour = Math.max(0, Math.min(23, Number(hoursStr) || 12));
  const targetMin = Math.max(0, Math.min(59, Number(minsStr) || 0));

  const occupiedSlots = new Set(
    existingSchedules
      .filter((s) => s.platform === platform && s.status === 'queued')
      .map((s) => s.scheduledFor.slice(0, 16))
  );

  const now = new Date();
  for (let d = dayOffset; d < dayOffset + 30; d++) {
    const candidate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + d,
      targetHour,
      targetMin,
      0,
      0
    );
    if (candidate.getTime() <= now.getTime() + 5 * 60 * 1000) {
      continue;
    }
    const yyyy = candidate.getFullYear();
    const mm = String(candidate.getMonth() + 1).padStart(2, '0');
    const dd = String(candidate.getDate()).padStart(2, '0');
    const hh = String(candidate.getHours()).padStart(2, '0');
    const min = String(candidate.getMinutes()).padStart(2, '0');
    const isoSlot = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    if (!occupiedSlots.has(isoSlot)) {
      return isoSlot;
    }
  }

  return new Date(Date.now() + 86400000).toISOString().slice(0, 16);
}
