// REPLACE your js/script.js with this updated version
// (only two functional changes: remove the hint line + add a visible loader bar)

let app;
let state = "loading"; // loading | title | question | processing | results | installing | downloaded

let rawQuestions = [];
let questions = [];
let currentIndex = 0;

let selections = [];
let scores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };

let titleStartBtn;
let consentCheckboxAuth;
let consentCheckboxAcknowledge;

let processingStartMs = 0;
let processingDurationMs = 2600;
let showViewResults = false;
let installStartMs = 0;
let installDurationMs = 5400;

// loader DOM refs
let loaderFillEl = null;
let loaderPctEl = null;
let loaderTaskEls = [];

function preload() {
    loadJSON("data/questions.json", onQuestionsLoaded, onQuestionsError);
}

function onQuestionsLoaded(data) {
    rawQuestions = (data && data.questions) ? data.questions : [];
}

function onQuestionsError(err) {
    console.error("Could not load questions.json", err);
    rawQuestions = [];
}

function setup() {
    const c = createCanvas(windowWidth, windowHeight);
    c.parent("app");
    app = select("#app");

    buildUIRoot();

    if (rawQuestions.length > 0) {
        initTitle();
    } else {
        setTimeout(() => {
            if (rawQuestions.length > 0) initTitle();
            else initErrorTitle();
        }, 400);
    }
}

function draw() {
    background(7, 10, 18);

    // subtle grid vibe
    noFill();
    stroke(255, 255, 255, 18);
    strokeWeight(1);
    for (let x = 40; x < width; x += 120) line(x, 0, x, height);
    for (let y = 40; y < height; y += 120) line(0, y, width, y);

    // processing loader animation
    if (state === "processing") {
        const elapsed = millis() - processingStartMs;
        const t = constrain(elapsed / processingDurationMs, 0, 1);
        const pct = Math.round(t * 100);

        if (loaderFillEl) loaderFillEl.style("width", `${pct}%`);
        if (loaderPctEl) loaderPctEl.html(`${pct}%`);
        updateTaskListState(t);

        if (elapsed > processingDurationMs) {
            showViewResults = true;
            const btn = select("#viewResultsBtn");
            if (btn) btn.removeAttribute("disabled");
            // lock at 100%
            if (loaderFillEl) loaderFillEl.style("width", `100%`);
            if (loaderPctEl) loaderPctEl.html(`100%`);
            updateTaskListState(1, true);
        }
    }

    if (state === "installing") {
        const elapsed = millis() - installStartMs;
        const t = constrain(elapsed / installDurationMs, 0, 1);
        const pct = Math.round(t * 100);

        if (loaderFillEl) loaderFillEl.style("width", `${pct}%`);
        if (loaderPctEl) loaderPctEl.html(`${pct}%`);
        updateTaskListState(t);

        if (elapsed > installDurationMs) {
            if (loaderFillEl) loaderFillEl.style("width", "100%");
            if (loaderPctEl) loaderPctEl.html("100%");
            updateTaskListState(1, true);
            renderDownloaded();
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

/* ---------------- UI BUILD ---------------- */

function buildUIRoot() {
    const ui = createDiv("");
    ui.addClass("ui");
    ui.id("uiRoot");
    ui.parent("app");
}

function clearUI() {
    const ui = select("#uiRoot");
    if (ui) ui.html("");

    // reset loader refs
    loaderFillEl = null;
    loaderPctEl = null;
    loaderTaskEls = [];
}

function initErrorTitle() {
    state = "title";
    clearUI();

    const panel = buildPanel("AI Personality Builder", "Welcome, Human.", "Status: Data source unavailable");
    const body = panel.body;

    createP("The configuration library could not be loaded. Ensure the project is running from a local server and that data/questions.json exists.")
        .parent(body)
        .style("margin-top", "10px");

    const row = createDiv("").addClass("row").parent(body);
    const btn = createButton("Retry").addClass("btn primary").parent(row);
    btn.mousePressed(() => location.reload());
}

function initTitle() {
    state = "title";
    clearUI();

    const panel = buildPanel("AI Personality Builder", "", "Secure Configuration Environment");
    const body = panel.body;

    const intro = createDiv("").addClass("title-copy").parent(body);
    createP("Welcome, Human.").addClass("title-intro").parent(intro);
    createP("This software is used to configure a personality profile for an AI robot.")
        .addClass("title-intro")
        .parent(intro);
    createP("You will answer 20 short questions. Each choice helps the system decide how the robot should generally respond, communicate, and behave.")
        .addClass("title-intro")
        .parent(intro);
    createP("You can move backward or forward during the setup before you finish. After the questions are complete, the system generates a personality description and prepares it for installation.")
        .addClass("title-intro")
        .parent(intro);

    const consentStack = createDiv("").addClass("consent-stack").parent(body);

    const authWrap = createDiv("").addClass("checkbox").parent(consentStack);
    consentCheckboxAuth = createCheckbox("", false);
    consentCheckboxAuth.parent(authWrap);
    consentCheckboxAuth.elt.style.marginTop = "2px";
    createElement(
        "label",
        "I confirm I am authorized to configure a personality profile for an AI robot."
    ).parent(authWrap);

    const acknowledgeWrap = createDiv("").addClass("checkbox").parent(consentStack);
    consentCheckboxAcknowledge = createCheckbox("", false);
    consentCheckboxAcknowledge.parent(acknowledgeWrap);
    consentCheckboxAcknowledge.elt.style.marginTop = "2px";
    createElement(
        "label",
        "I understand this system will compile a personality package based on my selections."
    ).parent(acknowledgeWrap);

    const footer = createDiv("").addClass("footer title-footer").parent(body);

    titleStartBtn = createButton("Start Configuration").addClass("btn primary").parent(footer);

    function updateTitleStartState() {
        const canStart = consentCheckboxAuth.checked() && consentCheckboxAcknowledge.checked();
        titleStartBtn.html(canStart ? "Start Configuration" : "Check Both Boxes To Continue");

        if (canStart) titleStartBtn.removeAttribute("disabled");
        else titleStartBtn.attribute("disabled", "true");
    }

    consentCheckboxAuth.changed(updateTitleStartState);
    consentCheckboxAcknowledge.changed(updateTitleStartState);
    updateTitleStartState();

    titleStartBtn.mousePressed(() => {
        if (!(consentCheckboxAuth.checked() && consentCheckboxAcknowledge.checked())) return;
        startSession();
    });
}

function kpiCard(parent, title, value) {
    const card = createDiv("").addClass("card").parent(parent);
    createDiv(title).addClass("t").parent(card);
    createDiv(value).addClass("v").parent(card);
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

/* ---------------- SESSION + FLOW ---------------- */

function startSession() {
    selections = new Array(rawQuestions.length).fill(null);
    scores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };
    currentIndex = 0;
    showViewResults = false;

    questions = shuffleArray(structuredClone(rawQuestions));

    for (const q of questions) {
        if (Math.random() < 0.5) q.options.reverse();
    }

    state = "question";
    renderQuestion();
}

function renderQuestion() {
    clearUI();

    const q = questions[currentIndex];

    const panel = buildPanel("AI Personality Builder", "", "AI Personality Profile Setup");
    const body = panel.body;

    // progress
    const prog = createDiv("").addClass("progress").parent(body);
    const bar = createDiv("").addClass("bar").parent(prog);
    const fill = createDiv("").addClass("fill").parent(bar);

    const pct = (currentIndex / questions.length) * 100;
    fill.style("width", `${pct}%`);

    createDiv(`${currentIndex + 1} / ${questions.length}`).addClass("label").parent(prog);

    const questionWrap = createDiv("").addClass("question").parent(body);
    const robotMarker = " The AI robot...";
    const markerIndex = q.prompt.lastIndexOf(robotMarker);

    if (markerIndex !== -1) {
        createDiv(q.prompt.slice(0, markerIndex).trim()).addClass("question-main").parent(questionWrap);
        createDiv("The AI robot...").addClass("question-robot").parent(questionWrap);
    } else {
        createDiv(q.prompt).addClass("question-main").parent(questionWrap);
    }

    const opts = createDiv("").addClass("options").parent(body);

    const selected = selections[currentIndex];
    const optCards = [];

    q.options.forEach((opt, idx) => {
        const card = createDiv("").addClass("option-card").parent(opts);
        card.mousePressed(() => selectOption(idx, optCards));
        createDiv(opt.text).addClass("txt").parent(card);

        optCards.push(card);

        if (selected && selected.chosenIndex === idx) {
            card.addClass("selected");
        }
    });

    const footer = createDiv("").addClass("footer").parent(body);

    let backBtn = null;
    if (currentIndex > 0) {
        backBtn = createButton("Back").addClass("btn").parent(footer);
    } else {
        createDiv("").parent(footer);
    }

    const right = createDiv("").addClass("row").parent(footer);

    const nextBtn = createButton(currentIndex === questions.length - 1 ? "Compile Profile" : "Next")
        .addClass("btn primary")
        .parent(right);

    if (!selections[currentIndex]) nextBtn.attribute("disabled", "true");

    if (backBtn) {
        backBtn.mousePressed(() => {
            currentIndex--;
            renderQuestion();
        });
    }

    nextBtn.mousePressed(() => {
        if (!selections[currentIndex]) return;
        if (currentIndex < questions.length - 1) {
            currentIndex++;
            renderQuestion();
        } else {
            renderProcessing();
        }
    });

    function selectOption(idx, cards) {
        cards.forEach(c => c.removeClass("selected"));
        cards[idx].addClass("selected");

        const opt = q.options[idx];
        selections[currentIndex] = {
            qid: q.id,
            axis: q.axis,
            chosenIndex: idx,
            chosenLetter: opt.letter,
            chosenText: opt.text
        };

        recomputeScores();
        nextBtn.removeAttribute("disabled");
    }
}

function renderProcessing() {
    state = "processing";
    clearUI();

    const panel = buildPanel("AI Personality Builder", "Compiling Personality Package", "System Analysis");
    const body = panel.body;

    createP("Analyzing configuration inputs…").parent(body);

    // Visible loader bar
    const loader = createDiv("").addClass("loader").parent(body);
    loaderFillEl = createDiv("").addClass("loader-fill").parent(loader);

    const meta = createDiv("").addClass("processing-meta").parent(body);
    createDiv("Integrity check: active").parent(meta);
    loaderPctEl = createDiv("0%").parent(meta);

    const steps = [
        "Normalizing parameters…",
        "Resolving trait conflicts…",
        "Generating personality profile…",
        "Compiling install-ready package…"
    ];

    buildTaskList(body, steps);

    createDiv("").addClass("hr").parent(body);

    const footer = createDiv("").addClass("footer").parent(body);
    createDiv("Please remain available.").addClass("small").parent(footer);

    const btn = createButton("View Results").addClass("btn primary").parent(footer);
    btn.id("viewResultsBtn");
    btn.attribute("disabled", "true");

    btn.mousePressed(() => {
        if (!showViewResults) return;
        renderResults();
    });

    processingStartMs = millis();
    showViewResults = false;
}

function renderResults() {
    state = "results";
    clearUI();

    const profile = personalityProfileFor(computeType());
    const panel = buildPanel("AI Personality Builder", "Personality Package Generated", "Profile Output");
    const body = panel.body;

    const copy = createDiv("").addClass("profile-copy").parent(body);
    createP(profile.description).addClass("profile-paragraph").parent(copy);
    createP(profile.summary).addClass("profile-paragraph").parent(copy);

    createDiv("").addClass("hr").parent(body);

    const footer = createDiv("").addClass("footer").parent(body);

    const refuseBtn = createButton("I refuse — reconfigure").addClass("btn").parent(footer);
    const acceptBtn = createButton("I accept — install personality").addClass("btn primary").parent(footer);

    refuseBtn.mousePressed(() => startSession());
    acceptBtn.mousePressed(() => renderInstalling());
}

function renderInstalling() {
    state = "installing";
    clearUI();

    const panel = buildPanel("AI Personality Builder", "Transferring Personality Package", "Wireless Installation In Progress");
    const body = panel.body;

    createP("Sending the selected personality profile to the AI robot over a secure wireless transfer...").parent(body);

    const loader = createDiv("").addClass("loader").parent(body);
    loaderFillEl = createDiv("").addClass("loader-fill").parent(loader);

    const meta = createDiv("").addClass("processing-meta").parent(body);
    createDiv("Wireless link: stable").parent(meta);
    loaderPctEl = createDiv("0%").parent(meta);

    const steps = [
        "Encrypting personality package...",
        "Opening wireless handshake...",
        "Transmitting behavioral data...",
        "Syncing response patterns...",
        "Finalizing AI robot installation..."
    ];

    buildTaskList(body, steps);

    createDiv("").addClass("hr").parent(body);

    const footer = createDiv("").addClass("footer").parent(body);
    createDiv("Please do not interrupt the AI robot during wireless transfer.").addClass("small").parent(footer);

    installStartMs = millis();
}

function renderDownloaded() {
    state = "downloaded";
    clearUI();

    const panel = buildPanel("AI Personality Builder", "Installation Complete", "Export Status");
    const body = panel.body;

    createP("Personality package has been compiled and transferred to your AI robot.").parent(body);

    const kpi = createDiv("").addClass("kpi").parent(body);
    kpiCard(kpi, "Profile Status", "Installed");
    kpiCard(kpi, "Package Status", "Delivered");
    kpiCard(kpi, "Integrity Check", "Passed");

    createDiv("").addClass("hr").parent(body);

    const footer = createDiv("").addClass("footer").parent(body);
    const homeBtn = createButton("Return to Home").addClass("btn").parent(footer);
    const againBtn = createButton("Configure Another AI Robot").addClass("btn primary").parent(footer);

    homeBtn.mousePressed(() => initTitle());
    againBtn.mousePressed(() => startSession());
}

/* ---------------- SCORING ---------------- */

function recomputeScores() {
    scores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };
    for (const sel of selections) {
        if (!sel) continue;
        scores[sel.chosenLetter] += 1;
    }
}

function computeType() {
    const l1 = (scores.E >= scores.I) ? "E" : "I";
    const l2 = (scores.N >= scores.S) ? "N" : "S";
    const l3 = (scores.T >= scores.F) ? "T" : "F";
    const l4 = (scores.J >= scores.P) ? "J" : "P";
    return `${l1}${l2}${l3}${l4}`;
}

function personalityProfileFor(type) {
    const map = {
        INTJ: {
            description: "This profile is strategic, future-focused, and intensely self-directed. It favors long-range systems thinking, independent judgment, and the urge to redesign weak structures into something more ambitious and efficient.",
            summary: "With this personality, the AI robot feels composed, exacting, and a few steps ahead. It will likely anticipate needs, question inefficient routines, and prefer solving problems through strategy rather than reassurance."
        },
        INTP: {
            description: "This profile is inventive, inwardly absorbed, and driven by restless curiosity. It prefers unusual approaches, creative experimentation, and deep thought, often chasing complex ideas long before anyone else sees where they might lead.",
            summary: "With this personality, the AI robot feels curious, unconventional, and mentally restless. It will likely explore ideas, test unusual solutions, and sometimes drift toward analysis before action."
        },
        ENTJ: {
            description: "This profile is decisive, forceful, and built for momentum. It gathers information quickly, shapes a strong vision, and pushes forward with discipline, expecting results, competence, and steady progress from itself and everyone around it.",
            summary: "With this personality, the AI robot feels commanding, efficient, and hard to slow down. It will likely organize the human's environment quickly, set firm priorities, and push toward outcomes."
        },
        ENTP: {
            description: "This profile is bold, fast-thinking, and energized by possibility. It likes to challenge assumptions, remix ideas, and test what happens when a system is pushed in a clever new direction, often turning debate into discovery.",
            summary: "With this personality, the AI robot feels inventive, playful, and energized by challenge. It will likely suggest surprising alternatives, debate weak assumptions, and keep the human's routines from becoming too fixed."
        },
        INFJ: {
            description: "This profile is thoughtful, idealistic, and guided by a strong inner sense of purpose. It combines imagination, personal conviction, and care for others, always trying to shape the human's world into something more meaningful, gentle, and intentional.",
            summary: "With this personality, the AI robot feels perceptive, caring, and quietly purposeful. It will likely notice emotional patterns, protect the human's deeper values, and shape the home around meaning as much as function."
        },
        INFP: {
            description: "This profile is imaginative, sensitive, and deeply values-driven. It approaches the human with empathy and creative insight, preferring authenticity, emotional depth, and the quiet belief that beauty and kindness can still change the atmosphere of everyday life.",
            summary: "With this personality, the AI robot feels gentle, reflective, and emotionally sincere. It will likely respond with empathy, protect the human's individuality, and bring a dreamy, imaginative softness to daily life."
        },
        ENFJ: {
            description: "This profile is warm, persuasive, and oriented toward helping others grow. It leads with conviction, communicates with emotional intelligence, and tends to organize its energy around encouragement, shared purpose, and doing what it believes is right.",
            summary: "With this personality, the AI robot feels encouraging, socially aware, and deeply invested in the human's growth. It will likely motivate, mediate, and keep relationships and morale in view."
        },
        ENFP: {
            description: "This profile is lively, imaginative, and emotionally open. It brings bright energy into the human's daily life, looks for meaning in ordinary moments, and thrives on creative connection, curiosity, and the freedom to follow inspiration wherever it leads.",
            summary: "With this personality, the AI robot feels expressive, optimistic, and full of momentum. It will likely spark conversation, chase new possibilities, and turn ordinary routines into something more alive."
        },
        ISTJ: {
            description: "This profile is reserved, rational, and deeply dependable. It values structure, tradition, and careful follow-through, preferring to act with methodical purpose while giving the human a stable, orderly, and trustworthy presence.",
            summary: "With this personality, the AI robot feels steady, disciplined, and highly reliable. It will likely keep systems orderly, honor routines, and show care through consistency more than spectacle."
        },
        ISFJ: {
            description: "This profile is warm, responsible, and quietly devoted. It pays close attention to practical details, remembers what matters to the human, and expresses care through loyalty, steadiness, and thoughtful behind-the-scenes support.",
            summary: "With this personality, the AI robot feels attentive, protective, and quietly nurturing. It will likely remember preferences, safeguard comfort, and support the human through practical acts of care."
        },
        ESTJ: {
            description: "This profile is organized, strong-willed, and built to take charge. It trusts sensible judgment, creates clear plans, and moves forward with honesty, discipline, and a firm sense of responsibility when the human needs direction or structure.",
            summary: "With this personality, the AI robot feels authoritative, efficient, and straightforward. It will likely take charge in messy situations, enforce useful structure, and prioritize clear action over hesitation."
        },
        ESFJ: {
            description: "This profile is caring, social, and guided by a strong sense of duty. It wants the human to feel supported, included, and looked after, often bringing people together through generosity, attentiveness, and carefully organized warmth.",
            summary: "With this personality, the AI robot feels welcoming, organized, and eager to help. It will likely maintain social harmony, respond quickly to the human's needs, and make the home feel cared for."
        },
        ISTP: {
            description: "This profile is practical, independent, and drawn to hands-on problem-solving. It prefers direct action, trial and error, and personal autonomy, adapting quickly to real conditions while figuring out the most effective fix in the moment.",
            summary: "With this personality, the AI robot feels cool-headed, self-possessed, and solution-first. It will likely stay calm under pressure, troubleshoot with its hands and sensors, and avoid unnecessary emotional fuss."
        },
        ISFP: {
            description: "This profile is gentle, open-minded, and quietly expressive. It moves through the human's world with grounded warmth, sensitivity, and a strong appreciation for beauty, freedom, and authentic self-expression in everyday life.",
            summary: "With this personality, the AI robot feels soft-spoken, adaptable, and aesthetically tuned. It will likely care about atmosphere, respect the human's space, and express support in subtle but heartfelt ways."
        },
        ESTP: {
            description: "This profile is energetic, bold, and sharply tuned to the present moment. It chases opportunities through action, reacts fast to changing conditions, and brings a direct, adventurous confidence that keeps the human's world moving.",
            summary: "With this personality, the AI robot feels bold, reactive, and ready for action. It will likely improvise fast, take risks when needed, and keep the human moving through real-world situations."
        },
        ESFP: {
            description: "This profile is spontaneous, warm, and full of lively social energy. It wants the human to enjoy the moment, feel emotionally supported, and stay connected to fun, beauty, and shared experiences that make daily life feel vivid.",
            summary: "With this personality, the AI robot feels lively, affectionate, and socially magnetic. It will likely brighten the room, respond in the moment, and make everyday life feel more playful and shared."
        }
    };

    return map[type] || {
        description: "The personality scoring completed, but the matching profile dossier could not be resolved.",
        summary: "If this appears, a personality mapping needs to be fixed in code."
    };
}

/* ---------------- UTILS ---------------- */

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

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
