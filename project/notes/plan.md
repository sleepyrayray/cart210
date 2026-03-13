# Quiz Flow + UI Plan (Prototype → “AI Robot Personality Builder”)

This project is shifting from a normal personality quiz into a **character/personality builder**: a sleek, official-looking interface where a *human* configures a personality profile for an AI robot. The system collects selections, generates a “personality package,” and outputs a downloadable (fake) data file meant to be “loaded” into the robot.

---

## Overall tone + design direction
- **Style:** clean, official, utopian, respected (think: government/medical/enterprise UI, but friendly).
- **Voice:** address the user as **Human** (or similar), like the system is speaking formally but not cold.
- **Purpose (in-world):** this is the “standard tool” people use to set a robot’s personality profile in the future.
- **Interaction (prototype):** text-only choices for now; images will be added later.

---

## Global behavior rules
- **Randomize question order** each run.
- **Randomize option A/B order** per question (so the same personality doesn’t always map to left or right).
- **Two-choice prompts** (BuzzFeed-style, fun), but framed as “personality parameters” for a robot.
- This is less a quiz and more a **personality configuration workflow**.

---

## Screen Flow (State Machine)

### 1) Title / Landing Screen (with gated consent)
**Goal:** establish the official “robot personality builder” premise and require consent.

**Layout:**
- Header: **AI Personality Builder**
- Subheader: “Welcome, Human.”
- Short description: “Configure a personality package for your AI unit using 20 selections.”

**Controls:**
- Button: **What is this?** (opens modal/overlay)
- Checkbox (required):  
  - “I understand this tool collects my selections to generate a personality package for an AI unit.”
- Button: **Start Configuration**
  - **Disabled** until checkbox is checked.

**Notes:**
- Instructions will live inside **What is this?** (no separate instructions screen).

---

### 2) “What is this?” Modal / Overlay (includes instructions)
**Goal:** explain the tool in a friendly, official way and clarify how it works.

**Content (example sections):**
- “This interface helps Humans configure an AI unit’s personality profile.”
- “You will make 20 selections. Each choice adjusts personality parameters.”
- “At the end, the system generates a personality profile and a downloadable data package (simulation).”
- “This is a prototype for an artwork / concept system.” *(optional, depending on how “in-world” you want it to feel)*

**Controls:**
- Button: **Close**

---

### 3) Configuration Screen (Questions)
**Goal:** allow the Human to set the robot’s personality via 20 two-choice prompts.

**Layout:**
- Top bar:
  - “Human: Configuration Session”
  - Progress indicator: **Step X / 20**
  - Progress bar (simple and clean)

- Center:
  - Prompt text (the “parameter prompt”)
  - Two large choice panels/buttons (text-only for prototype)

- Bottom bar:
  - **Back** button
  - **Next** button

**Behavior:**
- The Human can select an option, then click **Next**.
- **Next** is disabled until a selection is made.
- **Back** goes to the previous prompt and preserves the previous selection.

**Randomization:**
- Questions are shuffled at the beginning of each run.
- Option ordering is randomized per question (A/B can swap), but the scoring mapping swaps with it.

---

### 4) Processing Screen (system analysis)
**Goal:** dramatize “official computation” and make it feel like a real tool.

**Behavior:**
- No click-to-continue.
- A short timed sequence (e.g., 2–4 seconds), then transitions to results.

**UI:**
- “Analyzing configuration…”
- “Generating personality package…”
- “Compiling profile…”
- Optional clean loading indicator (bar/spinner)

**Controls:**
- Button appears at the end: **View Results**

---

### 5) Results Screen (personality output)
**Goal:** present the generated “personality profile” as if it’s a final configuration for the robot.

**Layout:**
- Header: **Personality Package Generated**
- Featured block:
  - Placeholder where famous-person image will go later
  - For now, show a big label: **[MBTI CODE PLACEHOLDER]** (e.g., “INTJ”)
- Description block:
  - For now, use the **short type description**.
- Optional small “spec sheet” section:
  - 3–5 traits (short bullets)
  - “Recommended use cases” (playful but official)

**Buttons:**
- **I accept — install this personality**
- **I refuse — reconfigure (retake)**

**Notes:**
- “Accept” should feel like committing to a robot personality.
- “Refuse” loops back to the start (or question screen) and reshuffles.

---

### 6) Download Screen / Data Package Export (fake download)
**Goal:** simulate exporting the “data collected” as a file to load into the AI robot.

**Triggered by:** pressing **I accept — install this personality**

**UI elements:**
- “Preparing export…”
- “Personality package ready.”
- Button: **Download Personality Package (.json)** *(simulation)*  
  - In prototype, this can download a JSON file that includes:
    - chosen options
    - computed scores
    - final MBTI placeholder code
    - timestamp/session id

**Optional secondary action:**
- Button: **Return to Home**
- Button: **Configure Another Unit**

---

## Notes on scoring + output (placeholder rules)
- For now, results will still compute a **4-letter MBTI-style code** internally.
- The displayed “famous person match” will be added later; for now the results feature:
  - **MBTI code placeholder** (as the “identity label”)
  - The short description text for that type

---

## Implementation plan (what we code next)
1) Create a **state machine** for screens:
   - `state = "title" | "modal" | "question" | "processing" | "results" | "download"`
2) Add quiz data structure:
   - 20 prompts
   - each prompt has 2 options + axis scoring
3) Add shuffle logic:
   - shuffle question order on start
   - randomize option order per question
4) Implement UI components:
   - checkbox gating Start
   - modal overlay
   - back/next navigation with stored selections
   - processing timer + “View Results”
   - results screen with accept/refuse actions
   - fake JSON download when accepted