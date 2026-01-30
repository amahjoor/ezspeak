---
status: complete
priority: p2
issue_id: "003"
tags: [clipboard, transcription, electron]
dependencies: []
---

# Persist transcription in clipboard after auto-paste

Ensure the transcription remains in the clipboard after auto-paste so users can paste again if focus changes.

## Problem Statement

Current auto-paste restores the original clipboard after a short delay, so the transcription is lost if the user clicks away or needs to paste again.

## Findings

- `src/clipboardManager.js` restores clipboard 500ms after paste.
- `main.js` calls `ClipboardManager.autoPaste(...)` after transcription completes.
- No UI field stores the transcription; clipboard persistence is the only recovery path.

## Proposed Solutions

### Option 1: Remove clipboard restore in autoPaste (MVP)

**Approach:** Always keep the transcription in the clipboard after auto-paste.

**Pros:**
- Simplest change
- Meets user requirement directly

**Cons:**
- Behavior change for users expecting clipboard restoration

**Effort:** 1-2 hours

**Risk:** Low

---

### Option 2: Add `preserveClipboard` option to autoPaste (Future-friendly)

**Approach:** Add a flag to `autoPaste` to control restore behavior; use `true` for transcription flow.

**Pros:**
- More flexible for future settings
- Keeps option to restore clipboard for other uses

**Cons:**
- Slightly more code

**Effort:** 2-3 hours

**Risk:** Low

## Recommended Action

Implement Option 2: add `preserveClipboard` option to `autoPaste` and set it to preserve for transcription completion.

## Technical Details

**Affected files:**
- `src/clipboardManager.js` - adjust autoPaste behavior
- `main.js` - pass option when invoking autoPaste

## Resources

- `docs/plans/2026-01-30-feat-transcription-clipboard-paste-plan.md`

## Acceptance Criteria

- [ ] After transcription, clipboard contains the transcribed text
- [ ] Auto-paste still occurs into the focused input
- [ ] Empty transcriptions do not update clipboard
- [ ] Works on macOS and Windows

## Work Log

### 2026-01-30 - Task Created

**By:** Codex

**Actions:**
- Captured current clipboard behavior and plan references
- Chose recommended action for implementation

**Learnings:**
- Clipboard restore is the direct cause of losing transcription

---

### 2026-01-30 - Implementation

**By:** Codex

**Actions:**
- Updated `src/clipboardManager.js` to allow preserving clipboard after auto-paste
- Updated `main.js` to preserve clipboard on transcription completion
- Marked plan acceptance criteria complete

**Learnings:**
- Keeping clipboard persistent is a minimal change when restoration is optional

## Notes

- Consider optional user toggle if feedback indicates need for restore behavior
