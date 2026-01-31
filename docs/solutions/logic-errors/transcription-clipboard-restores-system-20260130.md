---
module: System
date: 2026-01-30
problem_type: logic_error
component: tooling
symptoms:
  - Transcription clipboard cleared shortly after auto-paste
  - User could not re-paste transcription after focus change
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [clipboard, transcription, auto-paste]
---

# Troubleshooting: Transcription clipboard cleared after auto-paste

## Problem

Auto-paste restored the original clipboard after a short delay, causing the transcription to disappear from the clipboard and preventing users from re-pasting if focus changed.

## Environment

- Module: System
- Rails Version: N/A
- Affected Component: Tooling (Clipboard Manager)
- Date: 2026-01-30

## Symptoms

- Transcribed text appeared in the focused input briefly, then clipboard reverted.
- Users could not paste the transcription again after clicking elsewhere.

## What Didn't Work

**Direct solution:** The problem was identified and fixed on the first attempt.

## Solution

Preserve the clipboard contents after auto-paste by making clipboard restoration optional and enabling preservation for transcription completion.

**Code changes** (if applicable):
```js
// src/clipboardManager.js
static async autoPaste(text, options = {}) {
  const { preserveClipboard = false } = options;
  const originalClipboard = preserveClipboard ? null : clipboard.readText();

  try {
    clipboard.writeText(text);
    const isMac = os.platform() === 'darwin';
    const modifierKey = isMac ? Key.LeftSuper : Key.LeftControl;
    await keyboard.pressKey(modifierKey, Key.V);
    await keyboard.releaseKey(modifierKey, Key.V);

    if (!preserveClipboard) {
      setTimeout(() => {
        clipboard.writeText(originalClipboard);
      }, 500);
    }

    return true;
  } catch (error) {
    if (!preserveClipboard && originalClipboard !== null) {
      clipboard.writeText(originalClipboard);
    }
    return false;
  }
}

// main.js
await ClipboardManager.autoPaste(transcribedText.trim(), { preserveClipboard: true });
```

## Why This Works

The root cause was unconditional clipboard restoration after auto-paste. By making restoration conditional, the transcription remains in the clipboard for reuse while the paste action still happens immediately.

## Prevention

- Avoid restoring clipboard content automatically when the clipboard is expected to persist as user output.
- Prefer explicit flags to control clipboard restoration behavior based on feature needs.

## Related Issues

No related issues documented yet.
