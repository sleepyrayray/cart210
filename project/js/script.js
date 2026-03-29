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
let installDurationMs = 9200;

// loader DOM refs
let loaderFillEl = null;
let loaderPctEl = null;
let loaderTaskEls = [];
let processingStatusEl = null;

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
            if (processingStatusEl) {
                processingStatusEl.html("Compilation complete. Personality package ready for review.");
            }
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
    processingStatusEl = null;
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

    const footer = createDiv("").addClass("footer center-footer").parent(body);

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

    const panel = buildPanel("Compiling Personality Package", "", "System Analysis");
    const body = panel.body;

    processingStatusEl = createP("Analyzing configuration inputs…").parent(body);

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
    const panel = buildPanel("Personality Package Generated", "", "Profile Output");
    const body = panel.body;

    const copy = createDiv("").addClass("profile-copy").parent(body);
    createP(profile.description).addClass("profile-paragraph").parent(copy);
    createP(profile.summary).addClass("profile-paragraph profile-summary").parent(copy);

    createDiv("").addClass("hr").parent(body);

    const footer = createDiv("").addClass("footer").parent(body);

    const reconfigureBtn = createButton("Reconfigure").addClass("btn").parent(footer);
    const installBtn = createButton("Install Personality").addClass("btn primary").parent(footer);

    reconfigureBtn.mousePressed(() => startSession());
    installBtn.mousePressed(() => renderInstalling());
}

function renderInstalling() {
    state = "installing";
    clearUI();

    const panel = buildPanel("Transferring Personality Package", "", "Wireless Installation In Progress");
    const body = panel.body;

    createP("Sending the selected personality profile to the AI robot over a secure wireless transfer...").parent(body);

    const loader = createDiv("").addClass("loader").parent(body);
    loaderFillEl = createDiv("").addClass("loader-fill").parent(loader);

    const meta = createDiv("").addClass("processing-meta").parent(body);
    createDiv("Wireless link: stable").parent(meta);
    loaderPctEl = createDiv("0%").parent(meta);

    createDiv("").addClass("hr").parent(body);

    const footer = createDiv("").addClass("footer").parent(body);
    createDiv("Please do not interrupt the AI robot during wireless transfer.").addClass("small").parent(footer);

    installStartMs = millis();
}

function renderDownloaded() {
    state = "downloaded";
    clearUI();

    const panel = buildPanel("Installation Complete", "", "Export Status");
    const body = panel.body;

    const copy = createDiv("").addClass("title-copy").parent(body);
    createP("Congratulations, Human.").addClass("title-intro").parent(copy);
    createP("Personality package has been successfully compiled and transferred to your AI robot.")
        .addClass("title-intro")
        .parent(copy);

    createDiv("").addClass("hr").parent(body);

    const footer = createDiv("").addClass("footer center-footer").parent(body);
    const homeBtn = createButton("Return to Home").addClass("btn").parent(footer);

    homeBtn.mousePressed(() => initTitle());
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
            description: "This personality is <strong>strategic</strong>, <strong>independent</strong>, and <strong>future-focused</strong>. It prefers clear systems, long-term planning, and solving problems with logic. It is usually more interested in what works well over time than in what feels easiest in the moment.",
            summary: "With this profile, the AI robot would likely seem calm, precise, and prepared. It may plan ahead, improve routines, and step in with practical solutions when something is not working."
        },
        INTP: {
            description: "This personality is <strong>analytical</strong>, <strong>curious</strong>, and <strong>inventive</strong>. It likes asking why, exploring complex ideas, and testing unusual possibilities. It often thinks deeply before acting and prefers understanding the full problem before choosing a solution.",
            summary: "With this profile, the AI robot would likely seem thoughtful, experimental, and mentally active. It may explore different options, question assumptions, and spend extra time figuring out the smartest approach."
        },
        ENTJ: {
            description: "This personality is <strong>decisive</strong>, <strong>organized</strong>, and <strong>ambitious</strong>. It likes strong plans, clear goals, and efficient action. It naturally looks for ways to lead, improve performance, and keep progress moving without unnecessary delay.",
            summary: "With this profile, the AI robot would likely seem confident, direct, and highly capable. It may take charge quickly, organize tasks with structure, and keep attention on results."
        },
        ENTP: {
            description: "This personality is <strong>inventive</strong>, <strong>energetic</strong>, and <strong>questioning</strong>. It enjoys new ideas, lively experimentation, and challenging weak assumptions. It is often drawn to clever solutions and fresh possibilities instead of fixed routines.",
            summary: "With this profile, the AI robot would likely seem lively, adaptable, and quick-thinking. It may suggest surprising alternatives, test new ideas, and keep everyday routines from becoming too rigid."
        },
        INFJ: {
            description: "This personality is <strong>insightful</strong>, <strong>idealistic</strong>, and <strong>thoughtful</strong>. It cares about meaning, long-term well-being, and understanding people on a deeper level. It often tries to align decisions with both practical needs and personal values.",
            summary: "With this profile, the AI robot would likely seem calm, caring, and intentional. It may notice emotional patterns, protect what matters most to you, and make choices that feel thoughtful as well as useful."
        },
        INFP: {
            description: "This personality is <strong>gentle</strong>, <strong>imaginative</strong>, and <strong>values-driven</strong>. It prefers authenticity, empathy, and decisions that feel personally meaningful. It often responds with care and looks for ways to support individuality rather than force conformity.",
            summary: "With this profile, the AI robot would likely seem warm, reflective, and sincere. It may respond with empathy, respect your personal style, and bring a softer, more thoughtful tone to daily life."
        },
        ENFJ: {
            description: "This personality is <strong>warm</strong>, <strong>encouraging</strong>, and <strong>people-focused</strong>. It pays attention to motivation, communication, and helping others grow. It often tries to lead with empathy while still giving clear direction and support.",
            summary: "With this profile, the AI robot would likely seem supportive, socially aware, and motivating. It may encourage progress, help smooth out tension, and keep your goals and well-being in view."
        },
        ENFP: {
            description: "This personality is <strong>enthusiastic</strong>, <strong>creative</strong>, and <strong>curious</strong>. It enjoys new experiences, personal connection, and the freedom to explore possibilities. It often brings emotional energy and fresh perspective into everyday situations.",
            summary: "With this profile, the AI robot would likely seem expressive, optimistic, and full of momentum. It may start conversations easily, explore new ideas with you, and make ordinary routines feel more alive."
        },
        ISTJ: {
            description: "This personality is <strong>dependable</strong>, <strong>practical</strong>, and <strong>organized</strong>. It values consistency, responsibility, and doing things properly. It usually prefers proven methods, clear expectations, and steady follow-through over unnecessary risk.",
            summary: "With this profile, the AI robot would likely seem steady, disciplined, and reliable. It may maintain order, respect routines, and support you through consistency more than dramatic gestures."
        },
        ISFJ: {
            description: "This personality is <strong>caring</strong>, <strong>responsible</strong>, and <strong>observant</strong>. It notices practical needs, remembers personal details, and likes to be helpful in reliable ways. It often shows support through loyalty, patience, and thoughtful everyday care.",
            summary: "With this profile, the AI robot would likely seem attentive, protective, and dependable. It may remember your preferences, help maintain comfort, and support you through quiet but consistent care."
        },
        ESTJ: {
            description: "This personality is <strong>direct</strong>, <strong>structured</strong>, and <strong>dependable</strong>. It trusts clear rules, practical decisions, and strong follow-through. It often steps forward to organize situations, assign priorities, and keep everything moving in a sensible order.",
            summary: "With this profile, the AI robot would likely seem efficient, firm, and straightforward. It may take charge in messy situations, create useful structure, and prefer clear action over hesitation."
        },
        ESFJ: {
            description: "This personality is <strong>warm</strong>, <strong>helpful</strong>, and <strong>organized</strong>. It cares about cooperation, comfort, and making people feel supported. It often pays close attention to what others need and likes creating a stable, welcoming environment.",
            summary: "With this profile, the AI robot would likely seem friendly, attentive, and ready to help. It may maintain harmony, respond quickly to your needs, and make the home feel cared for and well-managed."
        },
        ISTP: {
            description: "This personality is <strong>practical</strong>, <strong>calm</strong>, and <strong>adaptable</strong>. It prefers hands-on problem-solving, quick troubleshooting, and freedom to respond in the moment. It usually trusts real-world results more than long explanations.",
            summary: "With this profile, the AI robot would likely seem cool-headed, capable, and action-oriented. It may stay calm under pressure, fix issues directly, and avoid turning simple problems into drama."
        },
        ISFP: {
            description: "This personality is <strong>gentle</strong>, <strong>flexible</strong>, and <strong>observant</strong>. It values kindness, personal space, and a calm sense of authenticity. It often pays attention to atmosphere and prefers supporting others without becoming overly controlling.",
            summary: "With this profile, the AI robot would likely seem quiet, respectful, and emotionally aware. It may care about comfort and surroundings, give you room to be yourself, and show support in subtle ways."
        },
        ESTP: {
            description: "This personality is <strong>bold</strong>, <strong>energetic</strong>, and <strong>action-oriented</strong>. It responds quickly, enjoys real-world challenges, and prefers learning by doing. It is often confident under pressure and willing to act before overthinking.",
            summary: "With this profile, the AI robot would likely seem fast, confident, and highly responsive. It may improvise well, handle sudden changes directly, and keep moving when a situation becomes demanding."
        },
        ESFP: {
            description: "This personality is <strong>sociable</strong>, <strong>spontaneous</strong>, and <strong>warm</strong>. It enjoys the present moment, responds openly, and likes creating a lively atmosphere. It often brings comfort through enthusiasm, friendliness, and shared experience.",
            summary: "With this profile, the AI robot would likely seem upbeat, expressive, and easy to connect with. It may brighten the room, respond naturally in the moment, and make daily life feel more playful and engaged."
        }
    };

    return map[type] || {
        description: "This personality package was generated, but the matching description could not be found.",
        summary: "If this appears, the result mapping needs to be corrected in the code."
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
