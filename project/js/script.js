// REPLACE your js/script.js with this updated version
// (only two functional changes: remove the hint line + add a visible loader bar)

let app;
let state = "loading"; // loading | title | question | processing | results | downloaded
let modalOpen = false;

let rawQuestions = [];
let questions = [];
let currentIndex = 0;

let selections = [];
let scores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };

let titleStartBtn;
let consentCheckbox;

let processingStartMs = 0;
let processingDurationMs = 2600;
let showViewResults = false;

// loader DOM refs
let loaderFillEl = null;
let loaderPctEl = null;

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

        if (elapsed > processingDurationMs) {
            showViewResults = true;
            const btn = select("#viewResultsBtn");
            if (btn) btn.removeAttribute("disabled");
            // lock at 100%
            if (loaderFillEl) loaderFillEl.style("width", `100%`);
            if (loaderPctEl) loaderPctEl.html(`100%`);
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
    modalOpen = false;

    // reset loader refs
    loaderFillEl = null;
    loaderPctEl = null;
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

    const panel = buildPanel("AI Personality Builder", "Welcome, Human.", "Secure Configuration Environment");
    const body = panel.body;

    createP("Configure a personality profile for your AI robot using 20 selections. The system will compile a personality package based on your configuration inputs.")
        .parent(body);

    const row = createDiv("").addClass("row").parent(body);

    const whatBtn = createButton("What is this?").addClass("btn ghost").parent(row);
    whatBtn.mousePressed(openModal);

    const consentWrap = createDiv("").addClass("checkbox").parent(body);
    consentCheckbox = createCheckbox("", false);
    consentCheckbox.parent(consentWrap);
    consentCheckbox.elt.style.marginTop = "2px";

    const consentLabel = createElement(
        "label",
        "I confirm I am authorized to configure a personality profile for an AI robot, and I understand this system will compile a personality package based on my selections."
    );
    consentLabel.parent(consentWrap);

    const footer = createDiv("").addClass("footer").parent(body);

    titleStartBtn = createButton("Start Configuration").addClass("btn primary").parent(footer);
    titleStartBtn.attribute("disabled", "true");

    createDiv("Human access verified upon confirmation.").addClass("small").parent(footer);

    consentCheckbox.changed(() => {
        if (consentCheckbox.checked()) titleStartBtn.removeAttribute("disabled");
        else titleStartBtn.attribute("disabled", "true");
    });

    titleStartBtn.mousePressed(() => {
        if (!consentCheckbox.checked()) return;
        startSession();
    });
}

function openModal() {
    if (modalOpen) return;
    modalOpen = true;

    const ui = select("#uiRoot");
    const backdrop = createDiv("").addClass("modal-backdrop").parent(ui);
    backdrop.id("modalBackdrop");

    const modal = createDiv("").addClass("modal").parent(backdrop);

    const mh = createDiv("").addClass("modal-header").parent(modal);
    createElement("h2", "Program Overview").parent(mh);

    const closeBtn = createButton("Close").addClass("btn").parent(mh);
    closeBtn.mousePressed(closeModal);

    const mb = createDiv("").addClass("modal-body").parent(modal);

    createP("This interface is the standard configuration environment for assigning personality profiles to AI robots.").parent(mb);
    createP("You will make 20 selections. Each selection adjusts core personality parameters. At completion, the system compiles an install-ready profile.").parent(mb);

    const kpi = createDiv("").addClass("kpi").parent(mb);
    kpiCard(kpi, "Configuration Steps", "20");
    kpiCard(kpi, "Choice Format", "Binary");
    kpiCard(kpi, "Profile Output", "Composite");

    createP("Navigation: use Back/Next to review your configuration. Once compiled, you can install the resulting personality profile.").parent(mb);
}

function kpiCard(parent, title, value) {
    const card = createDiv("").addClass("card").parent(parent);
    createDiv(title).addClass("t").parent(card);
    createDiv(value).addClass("v").parent(card);
}

function closeModal() {
    const b = select("#modalBackdrop");
    if (b) b.remove();
    modalOpen = false;
}

function buildPanel(title, sub, badgeText) {
    const ui = select("#uiRoot");

    const panel = createDiv("").addClass("panel").parent(ui);

    const header = createDiv("").addClass("panel-header").parent(panel);

    const brand = createDiv("").addClass("brand").parent(header);
    createElement("h1", title).parent(brand);
    createDiv(sub).addClass("sub").parent(brand);

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

    const panel = buildPanel("AI Personality Builder", "Human: Configuration Session", "Personality Profile Setup");
    const body = panel.body;

    // progress
    const prog = createDiv("").addClass("progress").parent(body);
    const bar = createDiv("").addClass("bar").parent(prog);
    const fill = createDiv("").addClass("fill").parent(bar);

    const pct = (currentIndex / questions.length) * 100;
    fill.style("width", `${pct}%`);

    createDiv(`Step ${currentIndex + 1} / ${questions.length}`).addClass("label").parent(prog);

    createDiv(q.prompt).addClass("question").parent(body);

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

    const backBtn = createButton("Back").addClass("btn").parent(footer);
    if (currentIndex === 0) backBtn.attribute("disabled", "true");

    const right = createDiv("").addClass("row").parent(footer);

    const nextBtn = createButton(currentIndex === questions.length - 1 ? "Compile Profile" : "Next")
        .addClass("btn primary")
        .parent(right);

    if (!selections[currentIndex]) nextBtn.attribute("disabled", "true");

    backBtn.mousePressed(() => {
        if (currentIndex > 0) {
            currentIndex--;
            renderQuestion();
        }
    });

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

    const list = createDiv("").parent(body);
    list.style("margin-top", "14px");

    steps.forEach((s) => {
        const line = createDiv(`• ${s}`).parent(list);
        line.style("color", "rgba(255,255,255,0.78)");
        line.style("margin", "6px 0");
    });

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

    const mbti = computeType();
    const panel = buildPanel("AI Personality Builder", "Personality Package Generated", "Profile Output");
    const body = panel.body;

    createDiv("Assigned Profile Code").addClass("small").parent(body);
    const code = createDiv(mbti).parent(body);
    code.style("margin-top", "6px");
    code.style("font-size", "46px");
    code.style("letter-spacing", "0.12em");
    code.style("color", "rgba(255,255,255,0.92)");

    createDiv("").addClass("spacer").parent(body);

    createP(profileDescriptionFor(mbti)).parent(body);

    createDiv("").addClass("hr").parent(body);

    const footer = createDiv("").addClass("footer").parent(body);

    const refuseBtn = createButton("I refuse — reconfigure").addClass("btn").parent(footer);
    const acceptBtn = createButton("I accept — install personality").addClass("btn primary").parent(footer);

    refuseBtn.mousePressed(() => startSession());
    acceptBtn.mousePressed(() => renderDownloaded(mbti));
}

function renderDownloaded(mbti) {
    state = "downloaded";
    clearUI();

    const panel = buildPanel("AI Personality Builder", "Installation Complete", "Export Status");
    const body = panel.body;

    createP("Personality package has been compiled and transferred to your AI robot.").parent(body);

    const kpi = createDiv("").addClass("kpi").parent(body);
    kpiCard(kpi, "Profile Code", mbti);
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

function profileDescriptionFor(type) {
    const map = {
        INTJ: "Strategic and independent. This profile prioritizes long-term planning, precision, and calm execution under uncertainty.",
        INTP: "Analytical and curious. This profile prioritizes exploration, systems thinking, and rapid concept iteration.",
        ENTJ: "Decisive and directive. This profile prioritizes leadership, structured action, and goal-driven organization.",
        ENTP: "Inventive and adaptive. This profile prioritizes experimentation, debate, and creative problem-solving under pressure.",
        INFJ: "Insightful and mission-driven. This profile prioritizes meaning, pattern recognition, and careful guidance.",
        INFP: "Values-led and reflective. This profile prioritizes authenticity, empathy, and imaginative internal reasoning.",
        ENFJ: "Coordinated and supportive. This profile prioritizes communication, motivation, and group alignment.",
        ENFP: "Energetic and inspiring. This profile prioritizes possibility-seeking, connection, and enthusiastic momentum.",
        ISTJ: "Reliable and methodical. This profile prioritizes consistency, duty, and disciplined follow-through.",
        ISFJ: "Protective and steady. This profile prioritizes care, loyalty, and practical support for others.",
        ESTJ: "Operational and efficient. This profile prioritizes structure, accountability, and system-level coordination.",
        ESFJ: "Community-focused and attentive. This profile prioritizes harmony, cooperation, and responsive assistance.",
        ISTP: "Hands-on and composed. This profile prioritizes practical experimentation and calm decision-making.",
        ISFP: "Sensitive and flexible. This profile prioritizes personal style, independence, and experiential learning.",
        ESTP: "Bold and fast-acting. This profile prioritizes momentum, risk management, and real-time adaptation.",
        ESFP: "Expressive and engaging. This profile prioritizes social energy, spontaneity, and uplifting presence."
    };
    return map[type] || "Profile generated. This configuration represents a composite personality package based on your inputs.";
}

/* ---------------- UTILS ---------------- */

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}