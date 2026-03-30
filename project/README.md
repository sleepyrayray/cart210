# AI Personality Builder

Live project: [https://sleepyrayray.github.io/cart210/project/](https://sleepyrayray.github.io/cart210/project/)

AI Personality Builder is an interactive p5.js project framed as an official system for configuring a personality profile for an AI robot. The user moves through a guided setup flow, answers 20 binary scenario prompts, watches the system compile a personality package, reviews a generated personality description, and simulates installing that package into the robot.

The project borrows the structure and authority of MBTI-style quizzes, but uses an in-world software interface to explore categorization, profiling, and how systems can sound confident while making simplified judgments.

## Current Prototype Features
- Landing screen with an inline description of the software
- Two required consent checkboxes before the configuration can begin
- 20 short scenarios loaded from `data/questions.json`
- Natural scenario wording using `You ... The AI robot...`
- Formal system voice that still refers to the user as `Human`
- Randomized scenario order and randomized option order on each run
- Back/Next navigation with stored selections
- Compile screen with a loading bar, staged system tasks, and a completion status message
- Results screen with a description-only personality output
- No visible 4-letter MBTI code in the final result
- No celebrity / famous-person matching in the result
- Wireless transfer screen for installing the personality package
- Final installation-complete screen with a simplified confirmation message

## Current App Flow
1. Landing / consent
2. 20-scenario configuration
3. Compiling Personality Package
4. Personality Package Generated
5. Wireless personality transfer
6. Installation Complete

## Tech Stack
- p5.js for canvas and DOM UI
- HTML/CSS for layout and styling
- JSON for the scenario bank

## Project Structure
- `index.html` main page
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
- Add click sounds and a heartbeat sound on the results screen, plus a mute toggle
- Ask for the robot's name before the quiz starts
- Use that robot name throughout the scenario, result, transfer, and completion screens
- Do a browser QA pass on desktop and mobile after the naming feature is added
- Clean outdated comments or leftover dev notes in the code

## Notes
- The app still computes an MBTI-style result internally, but the result shown to the user is a custom description rather than a visible 4-letter code.
- The project is intentionally presented as an in-world official tool rather than a conventional personality quiz.
- Keeping `Human` in the system voice is part of the concept: the software is more interested in configuring the robot than in recognizing the person using it.
