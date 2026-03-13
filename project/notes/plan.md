# Quiz Flow + UI Plan (Prototype)

## Core concept (updated)
- This is less of a “quiz” and more of a **character / personality builder**.
- New framing idea: the program is used to **assign a personality profile to an AI robot**.
- The user is effectively “training” or “configuring” their robot by making choices.
- At the end, the user can **download (fake) the collected data** as if it can be uploaded into their AI robot.

---

## Screens / States

### 1) Title Screen (with “What is this?” + Consent Checkbox)
**Goal:** set the tone + require consent before starting.

**UI elements:**
- Title (e.g., “ROBOT PERSONALITY BUILDER”)
- A button or link: **“What is this?”**
- A checkbox statement (required to start):
  - Example: “I understand this program collects my choices to generate a personality profile.”
- **Start button**
  - Disabled until checkbox is checked
  - Becomes clickable only after consent

---

### 2) “What is this?” Screen (Instructions + Context)
**Goal:** explain what the experience is and how it works.

**Includes:**
- Short explanation: this is a personality builder for an AI robot (simulation)
- How to play:
  - 20 prompts
  - 2 choices each
  - Use **Back** and **Next**
- A note about interpretation:
  - the system will generate a personality outcome based on choices
- Button: **Back to Start** (or “Close”)

*(No separate “instructions screen” needed — instructions live here.)*

---

### 3) Question Screen (20 prompts)
**Goal:** main interaction loop.

**Layout:**
- Progress indicator: “Question X / 20”
- Prompt text in the center
- Two large choice buttons (text-only for prototype)
- Navigation buttons:
  - **Back** (go to previous question)
  - **Next** (advance)

**Behavior / logic:**
- User must select A or B before “Next” becomes active (recommended)
- **Randomize question order**
- **Randomize option placement**
  - Sometimes the “A” choice appears on the left, sometimes on the right
  - Avoids feeling “rigged” or predictable

**Note:** No flashing “inference updated” feedback for now (can add later).

---

### 4) Processing Screen
**Goal:** dramatize algorithmic authority / system feel.

**Behavior:**
- No clicking to continue.
- A short timed sequence:
  - “Analyzing responses…”
  - “Generating personality profile…”
  - “Matching archetype…”
- After the sequence ends, show a **“View Results”** button.

---

### 5) Result Screen (Robot Personality Outcome)
**Goal:** reveal the personality type outcome without showing 4-letter code.

**UI elements:**
- Headline:
  - “Your robot is just like ____.”
- Famous person section:
  - Placeholder for a famous-person image (added later)
- Description text:
  - For now, use the short description for the matched 16 personality type
- Two outcome buttons:
  - **“I accept — load this personality”** (wording can be refined)
  - **“I refuse — retake quiz”**

---

### 6) “Download Data” / Export Screen (NEW IDEA)
**Goal:** connect strongly to privacy + data collection (and make it feel real).

**After acceptance:**
- Show a panel like:
  - “Personality package generated.”
  - “Download configuration file for your AI robot.”
- Button: **Download .json** (fake download, but could generate a real text file later)
- Optional small text:
  - “This file contains your choices and inferred traits.”

---

## Randomization Plan (important)
- Shuffle the question order at the start of each run.
- For each question, randomly swap which choice appears on the left/right.
- Keep scoring consistent even if visual positions swap.

---

## Summary of the new framing (big project direction)
This is a **robot personality configuration tool** disguised as a fun quiz.  
The user isn’t “discovering who they are” as much as they are **building a personality** that can supposedly be installed into an AI system — which highlights how identity can become a dataset and how personality can be treated like a product.

---