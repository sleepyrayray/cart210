# AI Personality Builder

Live project: [https://sleepyrayray.github.io/cart210/project/](https://sleepyrayray.github.io/cart210/project/)

AI Personality Builder is an interactive p5.js project framed as an official system for configuring a personality profile for an AI robot. The user moves through a guided setup flow, answers 20 binary scenario prompts, watches the system compile a personality package, reviews a generated personality description, and simulates installing that package into the robot.

The project borrows the structure and authority of MBTI-style quizzes, but uses an in-world software interface to explore categorization, profiling, and how systems can sound confident while making simplified judgments.

## Current Prototype Features
- Opening intro animation with a dark screen, centered title, and fade-out reveal into the landing page
- Landing screen with an inline description of the software
- Two required consent checkboxes before the configuration can begin
- Robot registration popup before the scenarios begin
- 20 short scenarios loaded from `data/questions.json`
- Scenario prompts that adapt to the current robot name
- Session-only robot naming that resets when returning home or refreshing
- Formal system voice that still refers to the user as `Human`
- Randomized scenario order and randomized option order on each run
- Back/Next navigation with stored selections
- Compile screen with a loading bar, staged system tasks, and a completion status message
- Results screen with a description-only personality output
- No visible 4-letter MBTI code in the final result
- No celebrity / famous-person matching in the result
- Click sound on button interactions
- Wireless transfer screen for installing the personality package
- Final installation-complete screen with a completion beep plus a delayed heartbeat sound and glow
- Persistent footer with copyright, name, and course info

## Current App Flow
1. Opening intro animation
2. Landing / consent
3. Robot registration popup
4. 20-scenario configuration
5. Compiling Personality Package
6. Personality Package Generated
7. Wireless personality transfer
8. Installation Complete

## Tech Stack
- p5.js for canvas and DOM UI
- HTML/CSS for layout and styling
- JSON for the scenario bank

## Project Structure
- `index.html` main page
- `assets/` sounds and other media assets
- `css/style.css` interface styling
- `js/script.js` application logic
- `data/questions.json` scenario bank
- `notes/` planning, research, and writing notes

## How To Run
This project loads JSON data, so it must run from a local server.

Option 1: VS Code
- Install the Live Server extension
- Right click `index.html` and choose `Open with Live Server`

Option 2: Python
- In the project folder, run `python3 -m http.server`
- Open the local URL in your browser

## Verified Remaining Work
- Do a final copy pass on the robot-name wording across the scenarios and later screens
- Do a final browser QA pass on desktop and mobile across the current full flow
- Clean outdated comments or leftover dev notes in the code

## Notes
- The app still computes an MBTI-style result internally, but the result shown to the user is a custom description rather than a visible 4-letter code.
- The project is intentionally presented as an in-world official tool rather than a conventional personality quiz.
- Keeping `Human` in the system voice is part of the concept: the software is more interested in configuring the robot than in recognizing the person using it.
