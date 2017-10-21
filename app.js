// Hyperparameters
let populationLifespan = 100; // initial lifespan of population (will naturally increase if fitness is not improving)
let lifespanRate = 0.1;       // if fitness isn't improving, rate at which lifespan is increased
let populationSize = 100;     // fixed population size
let maxForce = 0.8;           // maximum force/acceleration allowed per tick
let dampenVelocityRate = 0.99;// rate that velocity is dampened per tick
let pruneSaveRate = 0.4;      // while pruning population between generations, probability that a below-average individual will be saved for next generation
let pruneMutateRate = 0.01;   // while pruning, probability that a saved individual may be mutated
let mutationRate = 0.03;      // when a new child individual is created, probability that a gene will mutate
let stuckPenaltyDivisor = 5;  // fitness is divided by this when bubble hits wall or obstacle

// Minimum canvas size
let minWidth = 600;
let minHeight = 600;

// Global simulation vars
let population;         // population of individuals
let target;             // target "goal" point of individuals
let rectangles = [];    // rectangular obstacles
let controls = {};      // play/pause/render controls
let render = true;      // global render flag
let setupPhase = true;  // true during intiial setup phase

/**
 * Setup canvas and simulation
 */
function setup() {
  createCanvas(windowWidth < minWidth ? minWidth : windowWidth, windowHeight < minHeight ? minHeight : windowHeight);
  population = new Population(populationLifespan, populationSize, mutationRate, pruneSaveRate, pruneMutateRate, lifespanRate);
  target = createVector(width - 100, 100);

  // Initial obstacle
  let cX = width / 2, cY = height / 2, cW = 30, cH = height / 4;
  rectangles.push(new ShapePolygon([[cX - cW, cY - cH], [cX + cW, cY - cH], [cX + cW, cY + cH], [cX - cW, cY + cH]]));

  // Controls
  let x = width - 100, y = 10;
  controls.play = new ShapePolygon([[x, y], [x + 15, y + 10], [x, y + 20]]);
  controls.pause = new ShapeGroup([
    new ShapePolygon([[x, y], [x + 6, y], [x + 6, y + 20], [x, y + 20]]),
    new ShapePolygon([[x + 9, y], [x + 15, y], [x + 15, y + 20], [x + 9, y + 20]])
  ]);
  let rX = x + 38, rY = y + 10;
  controls.render = new ShapeGroup([
    new ShapeEllipse(rX, rY, 30, 16),
    new ShapeEllipse(rX, rY, 12, 12, 0)
  ]);
  let sX = rX + 22, sY = y + 20;
  controls.renderStats = new ShapePolygon([[sX, sY], [sX + 10, sY - 13], [sX + 13, sY - 8], [sX + 20, sY - 20], [sX + 30, sY - 15], [sX + 30, sY]]);
}

/**
 * Handle mouse clicks
 */
function mouseClicked() {
  if ((population.paused && controls.play.inBounds(mouseX, mouseY))
    || (!population.paused && controls.pause.inBounds(mouseX, mouseY))) {
    population.togglePause();
    if (setupPhase) {
      setupPhase = false;
      population.renderInfo = true;
    }
  } else if (controls.render.inBounds(mouseX, mouseY)) {
    render = population.toggleRender();
  } else if (population.render && controls.renderStats.inBounds(mouseX, mouseY)) {
    population.toggleRenderStats();
  }

  // During setup phase only
  if (!setupPhase) {
    return;
  }

  // Remove obstacle if ctrl-click
  if (!keyIsDown(CONTROL)) {
    return;
  }
  let removeIndex;
  if (rectangles.some((r, index) => {
    if (r.inBounds(mouseX, mouseY)) {
      removeIndex = index;
      return true;
    }
  })) {
    rectangles.splice(removeIndex, 1);
  }
}

// Holds currently drawing obstacle during setup phase
let currentRect = {};

/**
 * Start drawing obstacle in setup phase
 */
function mousePressed() {
  if (!setupPhase) {
    return;
  }
  currentRect.x = mouseX;
  currentRect.y = mouseY;
}

/**
 * Draw obstacles in setup phase
 */
function mouseDragged() {
  if (!setupPhase || !currentRect.x) {
    return;
  }
  currentRect.w = mouseX - currentRect.x;
  currentRect.h = mouseY - currentRect.y;
}

/**
 * Complete drawing, save obstacle
 */
function mouseReleased() {
  if (!setupPhase || !currentRect.x) {
    return;
  }
  let r = currentRect;
  rectangles.push(new ShapePolygon([[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]]));
  currentRect = {};
}

/**
 * Render canvas and tick simulation
 */
function draw() {
  background(0);

  // Draw controls
  push();
  fill(255, 255, 255);
  cursor(setupPhase ? (keyIsDown(CONTROL) ? HAND : CROSS) : ARROW);
  if (population.paused) {
    controls.play.draw();
    if (controls.play.inBounds(mouseX, mouseY)) {
      cursor(HAND);
    }
  } else {
    controls.pause.draw();
    if (controls.pause.inBounds(mouseX, mouseY)) {
      cursor(HAND);
    }
  }
  controls.render.draw();
  if (controls.render.inBounds(mouseX, mouseY)) {
    cursor(HAND);
  }
  if (render) {
    controls.renderStats.draw();
    if (controls.renderStats.inBounds(mouseX, mouseY)) {
      cursor(HAND);
    }
  }
  if (setupPhase) {
    textAlign(CENTER);
    text("Draw some obstacles on the canvas, then click play on the right!\n\nHold down CTRL + click to remove obstacles.\n\nThe bubbles will try to reach the green goal using a genetic algorithm.", 0, 24, width);
  }
  pop();

  // Run simulation
  if (!population.run()) {
    population.regenerate();
  }

  if (!render) {
    return;
  }
  
  // Draw target
  push();
  fill(20, 200, 100, 100);
  ellipse(target.x, target.y, 20, 20);
  ellipse(target.x, target.y, 30, 30);
  ellipse(target.x, target.y, 40, 40);

  // Draw obstacles
  noStroke();
  fill(150, 50, 50);
  rectangles.forEach(function (r) {
    r.draw();
  });
  if (currentRect.w) {
    stroke(150, 100, 100);
    fill(150, 50, 50, 100);
    rect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
  }
  pop();
}