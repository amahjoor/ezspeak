---
title: feat Add transcription copy plus paste
type: feat
date: 2026-01-30
---

# feat: Add transcription copy plus paste

## Enhancement Summary

**Deepened on:** 2026-01-30  
**Sections enhanced:** Overview, Proposed Solution, Technical Considerations, Acceptance Criteria, Dependencies & Risks  
**Research agents used:** Web search (Electron clipboard docs, nut.js keyboard docs)

### Key Improvements
1. Explicitly preserve clipboard contents by removing the restore step or making it optional.
2. Confirmed clipboard APIs (`readText`, `writeText`) and cross-platform paste modifiers.
3. Added fallback expectation: clipboard remains set even if paste fails.

### New Considerations Discovered
- Clipboard operations are safe from main process; keep current main-process usage for consistency.
- Auto-paste relies on OS-level automation; preserving clipboard should not depend on paste success.

## Overview

When transcription completes, keep the transcribed text in the clipboard and also paste it into the currently focused text input so the user can recover it if focus changes.

### Research Insights

**Best Practices:**
- Use Electron main-process clipboard APIs (`clipboard.writeText`, `clipboard.readText`) for deterministic clipboard updates.

**Implementation Details:**
- Clipboard writes are synchronous and don’t return a value; treat them as fire-and-forget.

## Problem Statement / Motivation

The current auto-paste flow temporarily overwrites the clipboard and restores it after a short delay. If the user clicks away or needs to paste again, the transcription is lost. Users want the transcription preserved in the clipboard while still being pasted into the active text box.

## Proposed Solution

- Update clipboard behavior to persist the transcription in the clipboard after auto-paste.
- Ensure the paste still targets the focused input (current behavior via simulated paste).
- Keep existing empty-transcription guardrails.

### Research Insights

**Implementation Details:**
- Keep the existing key combo approach (`Cmd+V` on macOS, `Ctrl+V` elsewhere) because nut.js supports key press/release for paste automation.

## Technical Considerations

- Current behavior in `src/clipboardManager.js` restores the original clipboard after 500ms. This will need to be optional or removed for the transcription completion flow.
- `main.js` handles transcription completion and calls `ClipboardManager.autoPaste(...)`.
- Consider failure modes of simulated paste (no focused input, OS denies automation) while still preserving clipboard contents.
- Ensure no regression for platforms (macOS vs Windows/Linux key modifiers).

### Research Insights

**Best Practices:**
- Electron clipboard supports `readText`/`writeText` for plain text; keep usage in the main process.

**Edge Cases:**
- Linux supports a separate `selection` clipboard; current app uses the default clipboard and should remain consistent unless explicitly expanded.

**Implementation Details:**
```js
// src/clipboardManager.js (illustrative)
static async autoPaste(text, { preserveClipboard = true } = {}) {
  const originalClipboard = preserveClipboard ? null : clipboard.readText();
  clipboard.writeText(text);
  // press Cmd/Ctrl+V...
  if (!preserveClipboard) setTimeout(() => clipboard.writeText(originalClipboard), 500);
}
```

## Acceptance Criteria

- [x] After a successful transcription, the transcribed text remains in the clipboard.
- [x] The transcribed text is still auto-pasted into the currently focused input (if any).
- [x] Empty or whitespace-only transcriptions do not overwrite the clipboard.
- [x] Behavior is consistent on macOS and Windows.

### Research Insights

**Quality Gates:**
- Validate that clipboard contents equal the transcription string after completion.

## Success Metrics

- Users can paste the transcription again without re-running recording.
- No increase in error logs related to auto-paste failures.

## Dependencies & Risks

- OS-level input automation can fail if focus changes or accessibility permissions are missing; clipboard preservation should still succeed.
- If users relied on clipboard restoration, this is a behavioral change that should be communicated (optional toggle if needed later).

### Research Insights

**Risk Mitigation:**
- Prefer preserving clipboard even if paste fails, so the user can manually paste from clipboard.

## References & Research

- Existing clipboard logic: `src/clipboardManager.js:1`
- Transcription completion flow: `main.js:255`
- Electron clipboard API: https://www.electronjs.org/docs/latest/api/clipboard
- nut.js keyboard API: https://nutjs.dev/docs/apidoc/keyboard

## SpecFlow Notes (Gaps/Edge Cases)

- If paste fails (no focused field), should we still keep the clipboard set to transcription? (Default: yes.)
- If the user starts another recording quickly, should the clipboard update to the latest transcription? (Default: yes.)
- Should there be a settings toggle to restore old clipboard behavior? (Not required for MVP.)
