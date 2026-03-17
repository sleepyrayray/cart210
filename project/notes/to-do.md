# AI Robot Personality Builder — Project To-Do List (Update)

## 1) Personalization + Core Flow
- [ ] Add a setup step where the user enters the **name of their AI robot** before starting the questionnaire.
- [ ] Use the robot's name throughout the 20 prompts instead of the generic phrase **"AI robot."**
- [ ] Replace **"Human"** with **"You"** across the interface copy so the system addresses the user directly.
- [ ] Review all question/result/install copy after the naming feature is added so the wording still reads naturally.

## 2) Results System (Identity + Famous Match)
- [ ] Add a **square result image** for each personality profile.
- [ ] Expand each result into a fuller **profile dossier** with:
  - 3-5 trait bullets
  - recommended deployment contexts
  - optional risk / caution note

## 3) UI + Visual Design (Utopian / Official)
- [ ] Polish the question UI further so the choice cards feel more like premium configuration tiles.
- [ ] Refine the results card once real images are added:
  - portrait area
  - match line + famous person
  - two-paragraph summary + spec section
- [ ] Tidy the header/status-label styling if any other passive UI still looks clickable.

## 4) Animation (Motion = Authority)
- [ ] Add a **smooth transition** between major screens (fade, slide, or dissolve).
- [ ] Add micro-animations:
  - option selection confirm pulse
  - progress bar easing
  - more subtle movement on the processing / transfer screens
- [ ] Add a small “system status” animation (spinner, scan line, or signal pulse).

## 5) Sound (Optional, but powerful)
- [ ] Add a minimal, clean sound set:
  - hover/select click
  - next/confirm
  - processing/transfer tone
  - result reveal tone
- [ ] Add a mute toggle that feels consistent with the current UI.

## 6) Data Package Screen (Official Finish)
- [ ] Upgrade the final delivery screen with:
  - package ID
  - checksum verified
  - install status: complete
- [ ] (Optional) Show a JSON-like preview of the installed package contents.

## 7) Technical Structure / Cleanup
- [ ] Keep a clear folder structure for assets:
  - `/assets/results/` for portrait images
  - `/assets/sfx/` for sound
- [ ] Add graceful fallbacks if an image or sound is missing.
- [ ] Remove outdated comments / notes in code that no longer match the current prototype.

## 8) Extra Ideas (If you want to push it further)
- [ ] Add a “Calibration mode” before the quiz to choose robot context:
  - companion
  - assistant
  - security
  - artist
  - etc.
- [ ] Add a “Build another AI robot” history panel for the current session.
- [ ] Add a short “ethics toggle” setting: transparency vs minimal disclosure.
- [ ] Add an official certificate / stamp generated at the end.

## 9) Writing for Final Submission (Later)
- [ ] Draft artist statement (250-300+ words) connecting privacy + voice + agency to the personality-builder concept.
- [ ] Start annotated bibliography (5+ sources, 3-sentence annotations).
- [ ] Outline a 5-10 minute presentation structure (problem -> concept -> demo -> process -> reflection).

---

### Immediate next step (recommended)
- [ ] Implement the **robot naming step** and wire that name through the questionnaire, results screen, transfer screen, and final installation screen.
