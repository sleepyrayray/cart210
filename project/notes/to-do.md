# AI Robot Personality Builder — Project To-Do List (Update)

## 1) Content + Writing (Core)
- [ ] **Rewrite all 20 prompts** so they clearly configure an **AI robot’s personality** (not the Human’s).  
  - Example framing: “Your AI robot should react by…” / “Your AI robot’s default mode is…”
- [ ] **Rewrite both options** per prompt so they feel like “robot settings” while still mapping to the same letter axes (E/I, N/S, T/F, J/P).
- [ ] Decide whether the interface should ever imply “this affects the Human” (probably no — keep it strictly robot-focused and official).

## 2) Results System (Identity + Famous Match)
- [ ] Create a **famous-person mapping list** (one per MBTI code) for the results screen.
- [ ] Add a **result image** for each personality (either the famous person or a symbolic portrait card).
- [ ] Replace the current placeholder description with **custom result descriptions** written as:
  - “AI robot profile summary” (official spec vibe)
  - 3–5 trait bullets
  - “Recommended deployment contexts” (optional but fun)

## 3) UI + Visual Design (Utopian / Official)
- [ ] Upgrade the results screen layout into a clean “profile dossier” card:
  - image area
  - profile code + title
  - summary paragraph + specs
- [ ] Polish the question UI to feel more like “configuration tiles” (still square-y):
  - hover glow
  - selection lock-in feel
  - better spacing for long option text
- [ ] Add subtle background design elements (lines, gradients, UI noise) to reinforce “official software” vibes.

## 4) Animation (Motion = Authority)
- [ ] Add a **smooth screen transition** between states (fade, slide, or dissolve).
- [ ] Add micro-animations:
  - option selection “confirm” pulse
  - progress bar easing
  - processing bar movement + step highlighting
- [ ] Add a small “system status” animation on the processing screen (spinner, scanning line, etc.).

## 5) Sound (Optional, but powerful)
- [ ] Add a minimal, clean sound set (not game-y):
  - hover/select click
  - next/confirm
  - processing/compile tone
  - result reveal tone
- [ ] Add a mute toggle (small icon button) to keep it respectful/usable.

## 6) Data Package Screen (Official Finish)
- [ ] Upgrade the “Downloaded/Delivered” screen to feel like a final export page:
  - “Package ID”
  - “Checksum verified”
  - “Install status: complete”
- [ ] (Optional) Show a preview of “export contents” as a neat JSON-like block (without actually downloading).

## 7) Technical Structure / Cleanup
- [ ] Confirm the JSON loading is reliable (Live Server / local server).
- [ ] Keep a clear folder structure for assets:
  - `/assets/results/` (result images)
  - `/assets/sfx/` (sound)
- [ ] Add graceful fallbacks if an image or sound is missing.

## 8) Extra Ideas (If you want to push it further)
- [ ] Add a “Calibration mode” before the quiz (1–2 steps) to set robot context:
  - companion / assistant / security / artist / etc.
- [ ] Add a “Build another AI robot” history panel (shows previous profiles created in the session).
- [ ] Add a short “ethics toggle” setting (utopian feature): transparency vs minimal disclosure.
- [ ] Add an “official stamp” or certificate generated at the end (profile badge).

## 9) Writing for Final Submission (Later)
- [ ] Draft artist statement (250–300+ words) connecting privacy + voice + agency to the personality-builder concept.
- [ ] Start annotated bibliography (5+ sources, 3-sentence annotations).
- [ ] Outline a 5–10 minute presentation structure (problem → concept → demo → process → reflection).

---

### Immediate next step (recommended)
- [ ] Rewrite **5 prompts** first (one per axis category) to lock the robot tone, then revise the remaining 15 to match that voice.