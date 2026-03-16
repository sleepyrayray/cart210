# AI Robot Personality Builder

AI Robot Personality Builder is an interactive p5.js project that presents itself as an official tool for configuring personality profiles for AI robots. You, the Human, make a series of binary choices. The system compiles your inputs into a finalized personality profile and prepares it for installation.

The project borrows the familiar language and structure of MBTI-style personality tests and BuzzFeed-style quizzes, then remixes it into a sleek, utopian software workflow. The goal is to explore how interfaces and data-driven systems can shape identity through categorization, inference, and authority.

## Current Prototype Features
- Multi-screen flow: Title, Questionnaire, Processing, Results, Confirmation
- “What is this?” info overlay on the title screen
- Required confirmation checkbox before starting
- 20 two-choice prompts loaded from `data/questions.json`
- Randomized question order and option order each run
- Back/Next navigation with stored selections
- Processing screen with a visible loading indicator
- Results screen outputs a personality code placeholder (to be replaced with a famous-person match + image)
- Confirmation screen shows successful delivery of the personality package to the AI robot

## Tech Stack
- p5.js (canvas + DOM UI)
- HTML/CSS for layout and styling
- JSON file for question content

## Project Structure
- `index.html` main page
- `css/style.css` interface styling
- `js/script.js` application logic
- `data/questions.json` question bank (20 prompts)

## How To Run
This project loads JSON data, so it must run from a local server.

Option 1: VS Code  
- Install the Live Server extension  
- Right click `index.html` and choose “Open with Live Server”

Option 2: Python  
- In the project folder, run `python3 -m http.server`  
- Open the local URL in your browser

## Roadmap
- Rewrite prompts so they configure the AI robot more explicitly
- Add famous-person match and image per personality
- Rewrite result descriptions into an official profile dossier format
- Add subtle animations and sound
- Refine UI polish and transitions

## Notes
This README describes the project as an in-world “official program” and does not frame the experience as a demo or parody. The prototype is still in progress and will evolve through iteration and feedback.