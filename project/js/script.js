/* AI Personality Builder application logic.
   Loads content data, renders each screen, and manages audio, scoring, and transitions. */

let state = "loading"; // loading | title | question | processing | results | installing | downloaded

let rawQuestions = [];
let uiCopy = null;
let questions = [];
let currentIndex = 0;
let robotName = "";

let selections = [];
let scores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };

let titleStartBtn;
let consentCheckboxAuth;
let consentCheckboxAcknowledge;

let processingStartMs = 0;
let showViewResults = false;
let installStartMs = 0;

let clickSound = null;
let clickSoundReady = false;
let completionBeepSound = null;
let completionBeepReady = false;
let heartbeatSound = null;
let heartbeatSoundReady = false;

let heartbeatTimerId = null;
let heartbeatPulseIntervalId = null;
let heartbeatPulseTimeoutIds = [];
let heartbeatGlowEl = null;

let openingIntroPlayed = false;
let openingIntroOverlayEl = null;
let openingIntroTimeoutIds = [];

// Shared loader DOM refs are reused by both loading screens.
let loaderFillEl = null;
let loaderPctEl = null;
let loaderTaskEls = [];
let processingStatusEl = null;

const PROCESSING_DURATION_MS = 2600;
const INSTALL_DURATION_MS = 9200;
const HEARTBEAT_PLAYBACK_RATE = 1.0;
const HEARTBEAT_PULSE_OFFSETS = [0, 0.13, 0.56, 0.69];
const OPENING_INTRO_ENTER_DELAY_MS = 60;
const OPENING_INTRO_HOLD_MS = 1500;
const OPENING_INTRO_FADE_MS = 1000;

function preload() {
    loadJSON("data/questions.json", onQuestionsLoaded, onQuestionsError);
    loadJSON("data/ui-copy.json", onUiCopyLoaded, onUiCopyError);

    clickSound = loadSound(
        "assets/sounds/click.m4a",
        () => {
            clickSoundReady = true;
            clickSound.setVolume(0.35);
            clickSound.playMode("restart");
        },
        (err) => {
            console.warn("Could not load click.m4a", err);
            clickSoundReady = false;
            clickSound = null;
        }
    );

    completionBeepSound = loadSound(
        "assets/sounds/beep.m4a",
        () => {
            completionBeepReady = true;
            completionBeepSound.setVolume(0.4);
            completionBeepSound.playMode("restart");
        },
        (err) => {
            console.warn("Could not load beep.m4a", err);
            completionBeepReady = false;
            completionBeepSound = null;
        }
    );

    heartbeatSound = loadSound(
        "assets/sounds/heart-beat.m4a",
        () => {
            heartbeatSoundReady = true;
            heartbeatSound.setVolume(0.24);
            heartbeatSound.rate(HEARTBEAT_PLAYBACK_RATE);
        },
        (err) => {
            console.warn("Could not load heart-beat.m4a", err);
            heartbeatSoundReady = false;
            heartbeatSound = null;
        }
    );
}

function onQuestionsLoaded(data) {
    rawQuestions = data?.questions || [];
}

function onQuestionsError(err) {
    console.error("Could not load questions.json", err);
    rawQuestions = [];
}

function onUiCopyLoaded(data) {
    uiCopy = data || null;
}

function onUiCopyError(err) {
    console.error("Could not load ui-copy.json", err);
    uiCopy = null;
}

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("app");

    buildUIRoot();

    if (hasLoadedCoreContent()) {
        initTitle(true);
    } else {
        setTimeout(() => {
            if (hasLoadedCoreContent()) initTitle(true);
            else initErrorTitle();
        }, 400);
    }
}

function draw() {
    background(7, 10, 18);

    // The grid keeps the interface feeling like a live system even though the UI is DOM-based.
    noFill();
    stroke(255, 255, 255, 18);
    strokeWeight(1);
    for (let x = 40; x < width; x += 120) line(x, 0, x, height);
    for (let y = 40; y < height; y += 120) line(0, y, width, y);

    if (state === "processing") {
        updateLoaderProgress(millis() - processingStartMs, PROCESSING_DURATION_MS, uiCopy.processing.statusReady, () => {
            showViewResults = true;
            const btn = select("#viewResultsBtn");
            if (btn) btn.removeAttribute("disabled");
        });
    }

    if (state === "installing") {
        updateLoaderProgress(millis() - installStartMs, INSTALL_DURATION_MS, null, () => {
            renderDownloaded();
        });
    }
}

function updateLoaderProgress(elapsed, durationMs, completeStatusText, onComplete) {
    const t = constrain(elapsed / durationMs, 0, 1);
    const pct = Math.round(t * 100);

    if (loaderFillEl) loaderFillEl.style("width", `${pct}%`);
    if (loaderPctEl) loaderPctEl.html(`${pct}%`);
    updateTaskListState(t);

    if (elapsed <= durationMs) return;

    if (loaderFillEl) loaderFillEl.style("width", "100%");
    if (loaderPctEl) loaderPctEl.html("100%");
    updateTaskListState(1, true);

    if (completeStatusText && processingStatusEl) {
        processingStatusEl.html(completeStatusText);
    }

    onComplete();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

/* App shell */

function hasLoadedCoreContent() {
    return rawQuestions.length > 0 && uiCopy;
}

function buildUIRoot() {
    const ui = createDiv("");
    ui.addClass("ui");
    ui.id("uiRoot");
    ui.parent("app");

    const footer = createDiv(formatAppFooterText());
    footer.addClass("app-footer");
    footer.id("appFooter");
    footer.parent("app");
}

function clearUI() {
    // Screen changes should never leave audio loops, timeouts, or stale loader refs behind.
    stopHeartbeatLoop();
    clearOpeningIntro();

    const ui = select("#uiRoot");
    if (ui) ui.html("");
    heartbeatGlowEl = null;

    loaderFillEl = null;
    loaderPctEl = null;
    loaderTaskEls = [];
    processingStatusEl = null;
}

function formatAppFooterText() {
    const yearText = new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(new Date());
    const template = uiCopy?.app?.footerTemplate || "© {year} Ray Hernaez | Project for CART210";
    return template.replace("{year}", yearText);
}

function buildPanel(title, sub, badgeText) {
    const ui = select("#uiRoot");
    const panel = createDiv("").addClass("panel").parent(ui);

    const header = createDiv("").addClass("panel-header").parent(panel);
    const brand = createDiv("").addClass("brand").parent(header);
    createElement("h1", title).parent(brand);

    if (sub) {
        createDiv(sub).addClass("sub").parent(brand);
    }

    createDiv(badgeText).addClass("badge").parent(header);

    const body = createDiv("").addClass("panel-body").parent(panel);
    return { panel, body };
}

/* Landing and intro */

function initErrorTitle() {
    state = "title";
    robotName = "";
    clearUI();

    const title = uiCopy?.app?.title || "AI Personality Builder";
    const badge = uiCopy?.errors?.dataUnavailableBadge || "Status: Data source unavailable";
    const bodyText = uiCopy?.errors?.dataUnavailableBody || "The required data could not be loaded.";
    const retryLabel = uiCopy?.errors?.retryButton || "Retry";

    const panel = buildPanel(title, "Welcome, Human.", badge);
    createP(bodyText).parent(panel.body).style("margin-top", "10px");

    const row = createDiv("").addClass("row").parent(panel.body);
    const btn = createButton(retryLabel).addClass("btn primary").parent(row);
    bindButtonPress(btn, () => location.reload());
}

function initTitle(withOpeningIntro = false) {
    state = "title";
    robotName = "";
    clearUI();
    consentCheckboxAuth = null;
    consentCheckboxAcknowledge = null;

    const landingCopy = uiCopy.landing;
    const panel = buildPanel(uiCopy.app.title, "", landingCopy.badge);
    const body = panel.body;

    const intro = createDiv("").addClass("title-copy").parent(body);
    landingCopy.intro.forEach((paragraph) => {
        createP(paragraph).addClass("title-intro").parent(intro);
    });

    const consentStack = createDiv("").addClass("consent-stack").parent(body);
    landingCopy.consentLabels.forEach((labelText) => {
        const wrap = createDiv("").addClass("checkbox").parent(consentStack);
        const checkbox = createCheckbox("", false);
        checkbox.parent(wrap);
        checkbox.elt.style.marginTop = "2px";
        createElement("label", labelText).parent(wrap);

        if (!consentCheckboxAuth) consentCheckboxAuth = checkbox;
        else consentCheckboxAcknowledge = checkbox;
    });

    const footer = createDiv("").addClass("footer center-footer").parent(body);
    titleStartBtn = createButton(landingCopy.startButton).addClass("btn primary").parent(footer);

    function updateTitleStartState() {
        const canStart = consentCheckboxAuth.checked() && consentCheckboxAcknowledge.checked();
        titleStartBtn.html(canStart ? landingCopy.startButton : landingCopy.startButtonDisabled);

        if (canStart) titleStartBtn.removeAttribute("disabled");
        else titleStartBtn.attribute("disabled", "true");
    }

    consentCheckboxAuth.changed(updateTitleStartState);
    consentCheckboxAcknowledge.changed(updateTitleStartState);
    updateTitleStartState();

    bindButtonPress(titleStartBtn, () => {
        if (!(consentCheckboxAuth.checked() && consentCheckboxAcknowledge.checked())) return;
        showRobotNamePrompt(() => startSession());
    });

    if (withOpeningIntro) {
        showOpeningIntro();
    }
}

function showOpeningIntro() {
    if (openingIntroPlayed) return;
    openingIntroPlayed = true;

    const overlay = createDiv("").addClass("opening-intro").parent(select("#uiRoot"));
    const copy = createDiv("").addClass("opening-intro-copy").parent(overlay);
    createDiv(uiCopy.openingIntro.subtitle).addClass("opening-intro-sub").parent(copy);
    createDiv(uiCopy.openingIntro.title).addClass("opening-intro-title").parent(copy);
    openingIntroOverlayEl = overlay;

    queueOpeningIntroTimeout(() => {
        if (openingIntroOverlayEl) openingIntroOverlayEl.addClass("opening-intro-visible");
    }, OPENING_INTRO_ENTER_DELAY_MS);

    queueOpeningIntroTimeout(() => {
        if (openingIntroOverlayEl) openingIntroOverlayEl.addClass("opening-intro-exit");
    }, OPENING_INTRO_ENTER_DELAY_MS + OPENING_INTRO_HOLD_MS);

    queueOpeningIntroTimeout(() => {
        if (!openingIntroOverlayEl) return;
        openingIntroOverlayEl.remove();
        openingIntroOverlayEl = null;
    }, OPENING_INTRO_ENTER_DELAY_MS + OPENING_INTRO_HOLD_MS + OPENING_INTRO_FADE_MS);
}

function queueOpeningIntroTimeout(handler, delayMs) {
    const timeoutId = window.setTimeout(() => {
        openingIntroTimeoutIds = openingIntroTimeoutIds.filter((id) => id !== timeoutId);
        handler();
    }, delayMs);

    openingIntroTimeoutIds.push(timeoutId);
}

function clearOpeningIntro() {
    if (openingIntroTimeoutIds.length) {
        openingIntroTimeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
        openingIntroTimeoutIds = [];
    }

    if (!openingIntroOverlayEl) return;

    openingIntroOverlayEl.remove();
    openingIntroOverlayEl = null;
}

function showRobotNamePrompt(onConfirm) {
    const popupCopy = uiCopy.robotRegistration;
    const overlay = createDiv("").addClass("popup-overlay").parent(select("#uiRoot"));
    const card = createDiv("").addClass("popup-card").parent(overlay);
    const inputId = `robotNameInput-${Date.now()}`;

    createDiv(popupCopy.title).addClass("popup-title").parent(card);
    createP(popupCopy.body).addClass("popup-body").parent(card);

    const field = createDiv("").addClass("popup-field").parent(card);
    const label = createElement("label", popupCopy.label).addClass("popup-label").parent(field);
    const input = createInput("").addClass("popup-input").parent(field);
    input.id(inputId);
    input.attribute("name", `robot-name-${Date.now()}`);
    input.attribute("placeholder", popupCopy.placeholder);
    input.attribute("autocomplete", "off");
    input.attribute("autocorrect", "off");
    input.attribute("autocapitalize", "off");
    input.attribute("spellcheck", "false");
    input.attribute("aria-autocomplete", "none");
    input.elt.value = "";
    label.attribute("for", inputId);

    const error = createDiv("").addClass("popup-error").parent(card);
    const actions = createDiv("").addClass("popup-actions").parent(card);
    const backBtn = createButton(popupCopy.backButton).addClass("btn").parent(actions);
    const confirmBtn = createButton(popupCopy.confirmButton).addClass("btn primary").parent(actions);

    function submitRobotName() {
        const nextName = normalizeRobotName(input.value());

        if (!nextName) {
            error.elt.textContent = popupCopy.requiredError;
            input.elt.focus();
            return;
        }

        robotName = nextName;
        overlay.remove();
        onConfirm();
    }

    input.input(() => {
        if (normalizeRobotName(input.value())) error.elt.textContent = "";
    });

    input.elt.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        submitRobotName();
    });

    bindButtonPress(backBtn, () => {
        robotName = "";
        overlay.remove();
    });

    bindButtonPress(confirmBtn, submitRobotName);
    setTimeout(() => input.elt.focus(), 0);
}

/* Session flow */

function startSession() {
    // Each run starts from a fresh clone so shuffling never mutates the source question bank.
    selections = new Array(rawQuestions.length).fill(null);
    scores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };
    currentIndex = 0;
    showViewResults = false;

    questions = shuffleArray(cloneQuestions(rawQuestions));
    questions.forEach((question) => {
        if (Math.random() < 0.5) question.options.reverse();
    });

    state = "question";
    renderQuestion();
}

function cloneQuestions(sourceQuestions) {
    return sourceQuestions.map((question) => ({
        ...question,
        options: question.options.map((option) => ({ ...option }))
    }));
}

function renderQuestion() {
    clearUI();

    const questionCopy = uiCopy.questionScreen;
    const q = questions[currentIndex];
    const panel = buildPanel(uiCopy.app.title, "", questionCopy.badge);
    const body = panel.body;

    const prog = createDiv("").addClass("progress").parent(body);
    createDiv(`${currentIndex + 1} / ${questions.length}`).addClass("label").parent(prog);
    const bar = createDiv("").addClass("bar").parent(prog);
    const fill = createDiv("").addClass("fill").parent(bar);
    fill.style("width", `${((currentIndex + 1) / questions.length) * 100}%`);

    const questionWrap = createDiv("").addClass("question").parent(body);
    const robotMarker = " The AI robot...";
    const markerIndex = q.prompt.lastIndexOf(robotMarker);

    // Keeping the robot prompt on its own line makes the scenario easier to scan on both desktop and mobile.
    if (markerIndex !== -1) {
        createDiv(q.prompt.slice(0, markerIndex).trim()).addClass("question-main").parent(questionWrap);
        const robotLine = createDiv("").addClass("question-robot").parent(questionWrap);
        robotLine.html(robotQuestionMarkup());
    } else {
        const fullPrompt = createDiv("").addClass("question-main").parent(questionWrap);
        fullPrompt.html(replaceRobotNameMarkup(q.prompt));
    }

    const opts = createDiv("").addClass("options").parent(body);
    const selected = selections[currentIndex];
    const optionCards = [];

    q.options.forEach((option, index) => {
        const card = createDiv("").addClass("option-card").parent(opts);
        card.mousePressed(() => selectOption(index));

        const optionText = createDiv("").addClass("txt").parent(card);
        optionText.html(robotOptionMarkup(option.text));

        optionCards.push(card);

        if (selected?.chosenIndex === index) {
            card.addClass("selected");
        }
    });

    const footer = createDiv("").addClass("footer").parent(body);
    let backBtn = null;

    if (currentIndex > 0) {
        backBtn = createButton(questionCopy.backButton).addClass("btn").parent(footer);
    } else {
        createDiv("").parent(footer);
    }

    const right = createDiv("").addClass("row").parent(footer);
    const nextLabel = currentIndex === questions.length - 1 ? questionCopy.compileButton : questionCopy.nextButton;
    const nextBtn = createButton(nextLabel).addClass("btn primary").parent(right);

    if (!selections[currentIndex]) nextBtn.attribute("disabled", "true");

    if (backBtn) {
        bindButtonPress(backBtn, () => {
            currentIndex -= 1;
            renderQuestion();
        });
    }

    bindButtonPress(nextBtn, () => {
        if (!selections[currentIndex]) return;

        if (currentIndex < questions.length - 1) {
            currentIndex += 1;
            renderQuestion();
        } else {
            renderProcessing();
        }
    });

    function selectOption(index) {
        optionCards.forEach((card) => card.removeClass("selected"));
        optionCards[index].addClass("selected");

        const option = q.options[index];
        selections[currentIndex] = {
            qid: q.id,
            axis: q.axis,
            chosenIndex: index,
            chosenLetter: option.letter,
            chosenText: option.text
        };

        recomputeScores();
        nextBtn.removeAttribute("disabled");
    }
}

function renderProcessing() {
    state = "processing";
    clearUI();

    const processingCopy = uiCopy.processing;
    const panel = buildPanel(processingCopy.title, "", processingCopy.badge);
    const body = panel.body;

    processingStatusEl = createP(processingCopy.statusLoading).parent(body);

    const loader = createDiv("").addClass("loader").parent(body);
    loaderFillEl = createDiv("").addClass("loader-fill").parent(loader);

    const meta = createDiv("").addClass("processing-meta").parent(body);
    createDiv(processingCopy.integrityStatus).parent(meta);
    loaderPctEl = createDiv("0%").parent(meta);

    buildTaskList(body, processingCopy.steps);

    createDiv("").addClass("hr").parent(body);

    const footer = createDiv("").addClass("footer").parent(body);
    createDiv(processingCopy.footerNote).addClass("small").parent(footer);

    const btn = createButton(processingCopy.viewResultsButton).addClass("btn primary").parent(footer);
    btn.id("viewResultsBtn");
    btn.attribute("disabled", "true");

    bindButtonPress(btn, () => {
        if (!showViewResults) return;
        renderResults();
    });

    processingStartMs = millis();
    showViewResults = false;
}

function renderResults() {
    state = "results";
    clearUI();

    const resultsCopy = uiCopy.results;
    const profile = personalityProfileFor(computeType());
    const panel = buildPanel(resultsCopy.title, "", resultsCopy.badge);
    const body = panel.body;

    const copy = createDiv("").addClass("profile-copy").parent(body);
    createP(profile.description).addClass("profile-paragraph").parent(copy);
    createP(replaceRobotNameMarkup(profile.summary)).addClass("profile-paragraph profile-summary").parent(copy);

    createDiv("").addClass("hr").parent(body);

    const footer = createDiv("").addClass("footer").parent(body);
    const reconfigureBtn = createButton(resultsCopy.reconfigureButton).addClass("btn").parent(footer);
    const installBtn = createButton(resultsCopy.installButton).addClass("btn primary").parent(footer);

    bindButtonPress(reconfigureBtn, () => startSession());
    bindButtonPress(installBtn, () => renderInstalling());
}

function renderInstalling() {
    state = "installing";
    clearUI();

    const installCopy = uiCopy.installing;
    const panel = buildPanel(installCopy.title, "", installCopy.badge);
    const body = panel.body;

    const transferText = createP("").parent(body);
    transferText.html(replaceRobotNameMarkup(installCopy.transferText));

    const loader = createDiv("").addClass("loader").parent(body);
    loaderFillEl = createDiv("").addClass("loader-fill").parent(loader);

    const meta = createDiv("").addClass("processing-meta").parent(body);
    createDiv(installCopy.linkStatus).parent(meta);
    loaderPctEl = createDiv("0%").parent(meta);

    createDiv("").addClass("hr").parent(body);

    const footer = createDiv("").addClass("footer").parent(body);
    const transferNote = createDiv("").addClass("small").parent(footer);
    transferNote.html(replaceRobotNameMarkup(installCopy.note));

    installStartMs = millis();
}

function renderDownloaded() {
    state = "downloaded";
    clearUI();
    playCompletionBeep();

    const downloadedCopy = uiCopy.downloaded;
    heartbeatGlowEl = createDiv("").addClass("heartbeat-glow").parent(select("#uiRoot"));

    const panel = buildPanel(downloadedCopy.title, "", downloadedCopy.badge);
    const body = panel.body;

    const copy = createDiv("").addClass("title-copy").parent(body);
    createP(downloadedCopy.greeting).addClass("title-intro").parent(copy);
    createP(replaceRobotNameMarkup(downloadedCopy.confirmation)).addClass("title-intro").parent(copy);

    createDiv("").addClass("hr").parent(body);

    const footer = createDiv("").addClass("footer center-footer").parent(body);
    const homeBtn = createButton(downloadedCopy.homeButton).addClass("btn").parent(footer);

    bindButtonPress(homeBtn, () => initTitle());
    scheduleHeartbeatLoop();
}

/* Scoring */

function recomputeScores() {
    scores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };

    for (const selection of selections) {
        if (!selection) continue;
        scores[selection.chosenLetter] += 1;
    }
}

function computeType() {
    const first = scores.E >= scores.I ? "E" : "I";
    const second = scores.N >= scores.S ? "N" : "S";
    const third = scores.T >= scores.F ? "T" : "F";
    const fourth = scores.J >= scores.P ? "J" : "P";
    return `${first}${second}${third}${fourth}`;
}

function personalityProfileFor(type) {
    const profiles = uiCopy?.results?.profiles || {};
    return profiles[type] || uiCopy?.results?.fallbackProfile || {
        description: "This personality package was generated, but the matching description could not be found.",
        summary: "If this appears, the result mapping needs to be corrected in the data."
    };
}

/* Copy helpers */

function normalizeRobotName(value) {
    return value.replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

function robotReferenceMarkup(capitalizeYour = false) {
    const pronoun = capitalizeYour ? "Your" : "your";

    if (!robotName) return `${pronoun} AI robot`;

    const safeName = escapeHtml(robotName);
    return `${pronoun} AI robot [<span class="robot-name">${safeName}</span>]`;
}

function robotQuestionMarkup() {
    return uiCopy.questionScreen.promptTemplate.replace("{robotReference}", robotReferenceMarkup(false));
}

function robotOptionMarkup(text) {
    const safeName = escapeHtml(robotName || "AI robot");
    return `[<span class="robot-name">${safeName}</span>] ${escapeHtml(text)}`;
}

function replaceRobotNameMarkup(text) {
    const lowerToken = "__ROBOT_REF_LOWER__";
    const upperToken = "__ROBOT_REF_UPPER__";

    // Tokens prevent already-inserted robot markup from being replaced twice.
    return escapeHtml(text)
        .replaceAll("your AI robot", lowerToken)
        .replaceAll("the AI robot", lowerToken)
        .replaceAll("The AI robot", upperToken)
        .replaceAll("AI robot", lowerToken)
        .replaceAll(upperToken, robotReferenceMarkup(true))
        .replaceAll(lowerToken, robotReferenceMarkup(false));
}

/* Audio */

function bindButtonPress(button, handler) {
    button.mousePressed(() => {
        if (button.elt.disabled) return;
        playClickSound();
        handler();
    });

    return button;
}

function playClickSound() {
    if (!clickSoundReady || !clickSound) return;

    const play = () => {
        clickSound.play();
    };

    if (getAudioContext().state !== "running") {
        userStartAudio().then(play).catch(() => {});
        return;
    }

    play();
}

function playCompletionBeep() {
    if (!completionBeepReady || !completionBeepSound) return;

    const play = () => {
        completionBeepSound.play();
    };

    if (getAudioContext().state !== "running") {
        userStartAudio().then(play).catch(() => {});
        return;
    }

    play();
}

function scheduleHeartbeatLoop() {
    stopHeartbeatLoop();

    heartbeatTimerId = window.setTimeout(() => {
        heartbeatTimerId = null;

        if (state !== "downloaded" || !heartbeatSoundReady || !heartbeatSound) return;

        const loopDurationMs = (heartbeatSound.duration() / HEARTBEAT_PLAYBACK_RATE) * 1000;
        startHeartbeatGlowPulseLoop(loopDurationMs);

        const play = () => {
            if (state !== "downloaded" || !heartbeatSoundReady || !heartbeatSound) return;
            heartbeatSound.stop();
            heartbeatSound.loop();
        };

        if (getAudioContext().state !== "running") {
            userStartAudio().then(play).catch(() => {});
            return;
        }

        play();
    }, 1500);
}

function startHeartbeatGlowPulseLoop(loopDurationMs) {
    queueHeartbeatGlowPulseCycle(loopDurationMs);
    heartbeatPulseIntervalId = window.setInterval(() => {
        queueHeartbeatGlowPulseCycle(loopDurationMs);
    }, loopDurationMs);
}

function queueHeartbeatGlowPulseCycle(loopDurationMs) {
    // Four timed pulses keep the glow aligned with the grouped beats in the audio file.
    HEARTBEAT_PULSE_OFFSETS.forEach((offsetRatio) => {
        const timeoutId = window.setTimeout(() => {
            heartbeatPulseTimeoutIds = heartbeatPulseTimeoutIds.filter((id) => id !== timeoutId);

            if (state !== "downloaded" || !heartbeatGlowEl) return;
            triggerHeartbeatGlowPulse();
        }, loopDurationMs * offsetRatio);

        heartbeatPulseTimeoutIds.push(timeoutId);
    });
}

function triggerHeartbeatGlowPulse() {
    if (!heartbeatGlowEl) return;

    heartbeatGlowEl.removeClass("heartbeat-glow-pulse");
    void heartbeatGlowEl.elt.offsetWidth;
    heartbeatGlowEl.addClass("heartbeat-glow-pulse");
}

function stopHeartbeatLoop() {
    if (heartbeatTimerId !== null) {
        clearTimeout(heartbeatTimerId);
        heartbeatTimerId = null;
    }

    if (heartbeatPulseIntervalId !== null) {
        clearInterval(heartbeatPulseIntervalId);
        heartbeatPulseIntervalId = null;
    }

    if (heartbeatPulseTimeoutIds.length) {
        heartbeatPulseTimeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
        heartbeatPulseTimeoutIds = [];
    }

    if (heartbeatGlowEl) {
        heartbeatGlowEl.removeClass("heartbeat-glow-pulse");
    }

    if (heartbeatSound?.isPlaying()) {
        heartbeatSound.stop();
    }
}

/* Loader tasks */

function buildTaskList(parent, steps) {
    const list = createDiv("").addClass("task-list").parent(parent);

    loaderTaskEls = steps.map((step) => {
        return createDiv(`• ${step}`).addClass("task-line task-pending").parent(list);
    });

    updateTaskListState(0);
}

function updateTaskListState(progress, markComplete = false) {
    if (!loaderTaskEls.length) return;

    const activeIndex = markComplete
        ? loaderTaskEls.length
        : Math.min(Math.floor(progress * loaderTaskEls.length), loaderTaskEls.length - 1);

    loaderTaskEls.forEach((line, index) => {
        line.removeClass("task-pending");
        line.removeClass("task-active");
        line.removeClass("task-complete");

        if (markComplete || index < activeIndex) {
            line.addClass("task-complete");
        } else if (index === activeIndex) {
            line.addClass("task-active");
        } else {
            line.addClass("task-pending");
        }
    });
}

/* General helpers */

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}
