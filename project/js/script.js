// Personality Quiz — p5.js starter

function setup() {
    const c = createCanvas(windowWidth, windowHeight);
    // If you use <main id="app">, attach the canvas there:
    c.parent("app");

    textFont("system-ui");
    textAlign(CENTER, CENTER);
}

function draw() {
    background(15, 15, 18);

    fill(240);
    textSize(32);
    text("Personality Quiz", width / 2, height / 2 - 30);

    textSize(16);
    fill(180);
    text("Setup complete. Next: build quiz states + questions.", width / 2, height / 2 + 20);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}