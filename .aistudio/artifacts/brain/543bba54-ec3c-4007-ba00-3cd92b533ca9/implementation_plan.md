# @DoubleParkedPOV Automated Shorts Ingestion & Cross-Platform Publishing Plan

This plan upgrades **ShortFlow** with a dedicated backend ingestion engine and automated cross-platform publishing pipeline tailored specifically for your YouTube channel **`@DoubleParkedPOV`**, automatically syncing newly uploaded Shorts and dispatching them to your **X, TikTok, and Instagram Reels** accounts at fixed daily peak-hour windows.

---

## User Review & Confirmed Decisions

> [!IMPORTANT]
> The architecture below directly implements the workflow preferences you confirmed:

- **Confirmed Decision 1 — Fully Automatic Triggering**: Whenever a new Short is detected on `@DoubleParkedPOV`, it is automatically ingested, formatted, and queued for publication without requiring manual approval.
- **Confirmed Decision 2 — Fixed Daily Peak-Hour Time Slots**: Instead of publishing at random upload times, each platform is assigned configurable daily peak-hour release slots (e.g., **X at 12:00 PM**, **Instagram Reels at 3:00 PM**, **TikTok at 6:00 PM**). Newly ingested Shorts automatically claim the next open daily slot for each network.
- **Confirmed Decision 3 — Original Title Preservation + Platform Hashtags + Auto First-Comment**: Each post keeps your exact original `@DoubleParkedPOV` YouTube title as the lead headline, appends platform-optimized hashtags below it (`#DoubleParkedPOV` + network-specific tags), and automatically posts a first comment/reply linking back to `https://www.youtube.com/@DoubleParkedPOV`.

---

## 1. Overview & Core Concept

- **What It Does**: Eliminates manual downloading and cross-posting for `@DoubleParkedPOV`. An Express backend service polls the official YouTube channel feed/API for `@DoubleParkedPOV` (`resolveHandle` + public RSS/Data API), deduplicates against your Firestore `shorts` library, and automatically generates three scheduled publishing jobs (X, Reels, TikTok) locked to your daily peak-hour slots.
- **Account Connections & OAuth Management**: Adds a dedicated **Connected Accounts & Channel Sync** view where you connect and manage your X (OAuth 2.0), TikTok (Content Posting API OAuth), and Instagram Reels (Meta Graph API OAuth) credentials using popup-based OAuth flows compatible with the preview environment, alongside automated background execution.
- **Key Value**: Hands-free 1-to-3 vertical video distribution that preserves your exact `@DoubleParkedPOV` branding, drives traffic back to YouTube via automated first comments, and hits maximum algorithmic velocity using fixed daily peak-hour windows.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **@DoubleParkedPOV Auto-Sync Banner & Poller**: From the top of the workspace, a live channel sync bar displays the connection to `@DoubleParkedPOV`, the last sync timestamp, a **"Sync @DoubleParkedPOV Now"** instant fetch trigger, and an automatic polling toggle.
  2. **Peak-Hour Slot Configurator**: Inside the **Automation Rules & Peak Slots** view, you can view and adjust the fixed daily publishing times for X, Instagram Reels, and TikTok, as well as the default first-comment template (`Watch more POVs on YouTube: https://www.youtube.com/@DoubleParkedPOV`).
  3. **Connected Accounts Hub**: A dedicated tab to authorize X, TikTok, and Instagram Reels via popup OAuth, inspect token readiness, and copy exact callback URLs (`https://ais-dev-bx2skihk2njnqb6pm2zigw-886721796422.us-east1.run.app/auth/callback` and `https://ais-pre-bx2skihk2njnqb6pm2zigw-886721796422.us-east1.run.app/auth/callback`).
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-density broadcast engineering console following the established dark slate (`#020617` / `bg-slate-950`) and structural panel (`#0F172A` / `bg-slate-900`) palette with `1px solid` hairline borders (`border-slate-800`).
  - *Color & Semantic Tokens*: Electric blue (`#2563EB`) for primary sync and dispatch triggers; emerald (`#10B981`) for verified channel sync and published states; amber (`#F59E0B`) for peak-slot queued states.
  - *Typography & Tabular Discipline*: `Plus Jakarta Sans` for workspace headers and navigation; `IBM Plex Mono` (`tabular-nums`) for YouTube video IDs, countdown timers, peak-hour schedules (`12:00`, `15:00`, `18:00`), and reach telemetry.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Hybrid YouTube Channel Discovery (Zero-Key RSS + Data API v3 Fallback)**
  - *Chosen Approach*: The backend server resolves `@DoubleParkedPOV` to its canonical YouTube Channel ID and fetches the latest uploads via YouTube's public XML feed (`youtube.com/feeds/videos.xml?channel_id=...`) plus YouTube Data API v3 when `YOUTUBE_API_KEY` is present.
  - *Why*: Guarantees immediate, zero-friction detection of real `@DoubleParkedPOV` uploads out of the box while supporting rich duration/shorts metadata filtering.
- **Decision 2: Deterministic Peak-Hour Slot Allocator**
  - *Chosen Approach*: When a new video is ingested from `@DoubleParkedPOV`, the scheduler calculates the next available daily peak slot per platform (`X: 12:00`, `Reels: 15:00`, `TikTok: 18:00` local time) that does not already have a video booked, automatically rolling overflow videos to the next day's peak slot.
  - *Why*: Prevents cannibalizing your own engagement if you upload multiple Shorts on the same day, spacing them cleanly across daily peak windows.
- **Decision 3: Exact Title + Platform Hashtag Tailoring**
  - *Chosen Approach*: Every generated caption begins verbatim with the original YouTube Short title, followed by a clean line break and platform-tailored hashtags (e.g., `#DoubleParkedPOV #CarPOV #DrivingPOV` on TikTok/Reels, and concise hook + hashtag on X), plus an automated first comment linking back to `https://www.youtube.com/@DoubleParkedPOV`.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Pipeline Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   @DoubleParkedPOV YouTube Channel                         │
│         (Public Channel RSS Feed + YouTube Data API v3 Poller)             │
└────────────────────────────────────┬───────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     Express Backend Server (server.ts)                     │
│  ┌──────────────────────────┐   ┌───────────────────────────────────────┐  │
│  │ GET /api/youtube/sync    │   │ OAuth 2.0 Popup & Dispatch Endpoints  │  │
│  │ - Resolves @DoubleParked │   │ - GET  /api/auth/:platform/url        │  │
│  │ - Extracts latest Shorts │   │ - GET  /auth/callback (postMessage)   │  │
│  │ - Returns metadata list  │   │ - POST /api/publish/dispatch          │  │
│  └─────────────┬────────────┘   └───────────────────┬───────────────────┘  │
└────────────────┼────────────────────────────────────┼──────────────────────┘
                 │                                    │
                 ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                 React Workspace + Firestore Real-Time State                │
│                                                                            │
│  ┌──────────────────────────┐   ┌───────────────────────────────────────┐  │
│  │ Auto-Ingest Engine       │   │ Peak-Hour Slot Scheduler              │  │
│  │ - Deduplicates by ytId   │──▶│ - Assigns X (12:00), Reels (15:00),   │  │
│  │ - Preserves exact title  │   │   TikTok (18:00) next available slot  │  │
│  │ - Adds platform hashtags │   │ - Attaches @DoubleParkedPOV comment   │  │
│  │ - Writes to /shorts      │   │ - Writes 3 jobs to /schedules         │  │
│  └──────────────────────────┘   └───────────────────┬───────────────────┘  │
│                                                     │                      │
│  ┌──────────────────────────────────────────────────▼───────────────────┐  │
│  │ Automated Due-Job Publisher Worker                                   │  │
│  │ - Evaluates queued jobs against current time                         │  │
│  │ - Automatically transitions due peak-slot jobs to Published          │  │
│  │ - Posts first comment linking to youtube.com/@DoubleParkedPOV        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State Updates
- **`/shorts/{shortId}`**: Stores ingested `@DoubleParkedPOV` Shorts with `channelName: "@DoubleParkedPOV"`, exact `title`, and platform-tailored `xCopy`, `reelsCaption`, and `tiktokCaption` (keeping the exact title + platform hashtags).
- **`/schedules/{scheduleId}`**: Stores the 3 automatically generated peak-hour publishing jobs per Short (`platform: 'x' | 'reels' | 'tiktok'`), `scheduledFor` locked to the assigned daily peak-hour slot, and `autoFirstComment` pointing to `https://www.youtube.com/@DoubleParkedPOV`.
- **`/rules/{ruleId}`**: Stores the active `@DoubleParkedPOV` automation rule and daily peak-hour configuration.

### Interactive Component & State Mapping
1. **@DoubleParkedPOV Live Sync Bar**: Displays channel handle `@DoubleParkedPOV`, auto-sync status toggle, and **"Sync @DoubleParkedPOV Now"** button that queries `/api/youtube/sync?handle=@DoubleParkedPOV`, deduplicates against existing `youtubeId` records in Firestore, and immediately creates new `/shorts` and peak-hour `/schedules` documents.
2. **Peak-Hour Schedule Configurator**: Interactive time-slot pickers for X, Instagram Reels, and TikTok peak hours, plus a template editor for the automated first comment and platform hashtag blocks.
3. **Connected Accounts & OAuth Modal/Tab**: Interactive connection cards for X, TikTok, and Instagram Reels with popup OAuth initiation (`/api/auth/:platform/url` -> `/auth/callback`), copyable redirect URIs, and live dispatch verification.
4. **Automated Peak-Slot Execution Loop**: Background interval inside the workspace that monitors queued jobs in `/schedules` and automatically executes `/api/publish/dispatch` + Firestore state updates when a job's peak-hour timestamp is reached.
