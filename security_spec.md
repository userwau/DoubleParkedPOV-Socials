# Security Specification — ShortFlow Cross-Platform Repurposing & Scheduling

## 1. Data Invariants

1. **Authentication & Verification**: All database access requires a signed-in user (`request.auth != null`) with a verified email (`request.auth.token.email_verified == true`).
2. **Ownership Isolation**: Every document in `/shorts/{shortId}`, `/schedules/{scheduleId}`, and `/rules/{ruleId}` is strictly owned by `ownerId == request.auth.uid`. Users can never read, list, create, update, or delete another user's documents.
3. **Relational Integrity**: A `/schedules/{scheduleId}` document cannot be created unless its referenced `/shorts/$(incoming().shortId)` exists and is owned by `request.auth.uid`.
4. **Strict Key & Schema Enforcement**: Every `create` and `update` must pass `isValidSourceShort`, `isValidScheduledPost`, or `isValidAutomationRule` with strict `hasAll` and `hasOnly` key checks, exact string length bounds, regex validation on IDs, and enum checks.
5. **Temporal Integrity**: `createdAt` must equal `request.time` on creation and remain immutable (`incoming().createdAt == existing().createdAt`) on update. `updatedAt` must equal `request.time` on both creation and update.
6. **Action-Based Updates**: Updates must explicitly specify allowed `affectedKeys().hasOnly(...)` branches and preserve immutable fields (`ownerId`, `createdAt`, `shortId`).

## 2. The "Dirty Dozen" Payloads

1. **Unverified Email Write**: Authenticated user with `email_verified: false` attempts to create a `/shorts/{shortId}` document.
2. **Identity Spoofing on Create**: User `uid_A` attempts to create a `/shorts/{shortId}` document with `ownerId: "uid_B"`.
3. **Shadow Field Injection on Create**: User sends a valid `SourceShort` payload plus an undeclared field `"isAdmin": true`.
4. **Orphaned Schedule Creation**: User creates a `/schedules/{scheduleId}` referencing a non-existent `shortId` or a `shortId` owned by another user.
5. **Cross-Tenant List Scraping**: User `uid_A` executes an unfiltered `list` query on `/shorts` without restricting `resource.data.ownerId == request.auth.uid`.
6. **Denial-of-Wallet Oversized String**: User attempts to set `reelsCaption` to a 10,000-character string (exceeding `maxLength: 500`).
7. **ID Poisoning Attack**: User attempts to create a document with an invalid document ID containing spaces or special characters outside `^[a-zA-Z0-9_\-]+$`.
8. **Immutable Owner Transfer on Update**: User updates a `/shorts/{shortId}` document and modifies `ownerId` or `createdAt`.
9. **Client Timestamp Forgery**: User supplies a backdated timestamp for `createdAt` or `updatedAt` instead of `request.time`.
10. **Invalid Enum Injection**: User creates a `/schedules/{scheduleId}` with `platform: "snapchat"` or `status: "hacked"`.
11. **Value Poisoning on Update**: User updates `status` on `/schedules/{scheduleId}` with a number `123` instead of a valid enum string.
12. **Unauthorized Delete**: User `uid_A` attempts to delete `/rules/{ruleId}` belonging to `uid_B`.
