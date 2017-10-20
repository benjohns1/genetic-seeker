// Hyperparameters
let populationLifespan = 100; // initial lifespan of population (will naturally increase if fitness is not improving)
let populationSize = 100;     // fixed population size
let maxForce = 0.5;           // maximum force/acceleration allowed per tick
let pruneSaveRate = 0.5;      // while pruning population between generations, probability that a below-average individual will be saved for next generation
let pruneMutateRate = 0.01;   // while pruning, probability that a saved individual may be mutated
let mutationRate = 0.02;      // when a new child individual is created, probability that a gene will mutate

// Minimum canvas size
let minWidth = 600;
let minHeight = 600;

// Global simulation vars
let population;     // population of individuals
let target;         // target "goal" point of individuals
let rects;          // rectangular obstacles
let controls = {};  // play/pause/render controls
let render = true;  // global render flag

/**
 * Setup canvas and simulation
 */
function setup() {
  createCanvas(windowWidth < minWidth ? minWidth : windowWidth, windowHeight < minHeight ? minHeight : windowHeight);
  population = new Population(populationLifespan, populationSize, mutationRate, pruneSaveRate, pruneMutateRate);
  target = createVector(width / 2, 50);

  // Obstacles
  rects = [
    { x: width / 2 - 150, y: height * 0.25, w: width / 8, h: 100 },
    { x: width / 2 - 300, y: height * 0.7, w: width / 6, h: 20 },
    { x: width / 2 + 200, y: height * 0.4, w: 20, h: 100 },
  ];

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
  } else if (controls.render.inBounds(mouseX, mouseY)) {
    render = population.toggleRender();
  } else if (population.render && controls.renderStats.inBounds(mouseX, mouseY)) {
    render = population.toggleRenderStats();
  }
}

/**
 * Render canvas and tick simulation
 */
function draw() {
  background(0);

  // Draw controls
  push();
  fill(255, 255, 255);
  if (population.paused) {
    controls.play.draw();
  } else {
    controls.pause.draw();
  }
  controls.render.draw();
  if (render) {
    controls.renderStats.draw();
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
  fill(255, 255, 0);
  ellipse(target.x, target.y, 10, 10);

  // Draw obstacles
  fill(200, 200, 200);
  rects.forEach(function (r) {
    rect(r.x, r.y, r.w, r.h);
  });
}