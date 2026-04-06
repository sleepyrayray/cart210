# AI Personality Builder — Current Flow Plan

This document reflects the current prototype as it exists now, not the older modal / celebrity-match version.

## Core Concept
The project presents itself as an official interface for configuring a personality profile for an AI robot. The user answers 20 short either/or prompts, the system compiles a personality package, and the package is then "installed" into the robot through a staged software workflow.

The tone should feel:
- official
- clean
- professional
- easy to understand
- slightly unsettling because the system sounds very sure of itself

## Current Voice + Writing Direction
- The app should feel formal, but not cold.
- The writing should be beginner-friendly and easy to scan.
- The prompts should sound natural, not robotic.
- The robot name is now entered by the user at the start of the flow and then reused across the later screens.
- The interface should keep calling the user `Human` in the system framing. That distance is intentional and supports the dystopian concept.
- The app should care more about configuring the robot than validating the person using it.

## Current Screen Flow

### 0) Opening Animation
Purpose:
- give the software a more intentional intro before the interface appears
- make the system feel staged, polished, and slightly theatrical

Planned behavior:
- Show `AI Personality Builder` as a short animated intro title
- Fade that title out
- Animate the landing-page container opening into view
- Keep the timing brief so the flow still feels smooth

### 1) Landing / Consent Screen
Purpose:
- explain what the software does
- establish the official system tone
- require user confirmation before beginning

Current behavior:
- Title: `AI Personality Builder`
- Inline explanation is shown directly on the page
- Two checkboxes must both be checked before the start button activates
- Start button is centered

### 1.5) Robot Registration Popup
Purpose:
- capture the current robot name before configuration begins
- make the later scenario and result copy feel more specific

Current behavior:
- Appears right after `Start Configuration`
- Title: `AI Robot Registration`
- Includes a name input, `Back`, and `Confirm Name`
- Requires a non-empty robot name before the scenario flow starts
- Uses session-only naming that resets on return home or page refresh

### 2) Scenario Screen
Purpose:
- let the user configure the robot through 20 short scenarios

Current behavior:
- Header badge: `AI Personality Profile Setup`
- Progress bar and scenario counter
- Scenario text is centered
- The second prompt line is phrased as a question using the current robot name
- Each option begins with the bracketed robot name
- Two option cards appear side by side
- Back button is hidden on the first scenario
- Next button stays disabled until an option is selected

### 3) Compiling Screen
Purpose:
- make the system feel like it is formally analyzing the configuration

Current behavior:
- Title: `Compiling Personality Package`
- Visible loading bar and percentage
- Task lines update one at a time
- The status message changes when compiling is complete
- `View Results` becomes available at the end

### 4) Results Screen
Purpose:
- present the generated personality in a polished but readable way

Current behavior:
- Title: `Personality Package Generated`
- One centered result container
- Two-paragraph personality write-up
- Key trait words are visually emphasized
- The summary copy uses the current robot name
- No visible MBTI code
- No celebrity / famous-person comparison
- Buttons:
  - `Reconfigure`
  - `Install Personality`

### 5) Transfer / Installation Screen
Purpose:
- simulate sending the selected personality package to the robot

Current behavior:
- Title: `Transferring Personality Package`
- Slower loading bar than the compile screen
- No task list on this screen
- The transfer is framed as a wireless installation process
- The transfer copy uses the current robot name

### 6) Installation Complete Screen
Purpose:
- close the workflow cleanly

Current behavior:
- Title: `Installation Complete`
- Short confirmation message
- `Congratulations, Human.` line above the message
- The completion message uses the current robot name
- A short completion beep plays when this screen appears
- A delayed heartbeat sound and centered glow begin shortly after the screen appears
- Single centered `Return to Home` button
- No status cards / KPI blocks

## Global System Rules
- Scenario order is randomized at the start of each session
- Option order is randomized per scenario
- The scoring still uses MBTI-style internal axes:
  - `E / I`
  - `N / S`
  - `T / F`
  - `J / P`
- The 4-letter result is used internally only

## Verified Next Steps
- Add a short opening animation before the landing screen
- Animate the `AI Personality Builder` title as an intro, then fade it out
- Animate the landing container opening into view after that
- Add a mute toggle for the current click / completion / heartbeat sounds
- Do a browser sound-mix pass for the current audio timing and levels
- Do a final cross-screen copy pass now that naming is implemented
- Run a browser QA pass for spacing, wrapping, and mobile layout

## Optional Upgrades Later
- Expand the result into a fuller dossier with trait bullets or system specs
- Add subtle transitions or interface motion
- Add package metadata to the completion screen
