
let population;
let populationLifespan = 100;
let populationSize = 100;
let target;
let rects;
let maxForce = 0.5;
let pruneSaveRate = 0.5; // while pruning, chance that a below-average individual will be saved for next generation
let pruneMutateRate = 0.01; // during population pruing, chance that a saved individual may be mutated
let mutationRate = 0.02;

let minWidth = 600;
let minHeight = 600;

let controls = {};
let render = true;

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
  let x = width - 80, y = 10;
  controls.play = new ShapePolygon([[x, y], [x + 15, y + 10], [x, y + 20]]);
  controls.pause = new ShapeGroup([
    new ShapePolygon([[x, y], [x + 6, y], [x + 6, y + 20], [x, y + 20]]),
    new ShapePolygon([[x + 9, y], [x + 15, y], [x + 15, y + 20], [x + 9, y + 20]])
  ]);
  controls.visibility = new ShapeGroup([
    new ShapeEllipse(x + 38, y + 10, 30, 16),
    new ShapeEllipse(x + 38, y + 10, 12, 12, 0)
  ]);
}

function mouseClicked() {
  if ((population.paused && controls.play.inBounds(mouseX, mouseY))
    || (!population.paused && controls.pause.inBounds(mouseX, mouseY))) {
    population.togglePause();
  } else if (controls.visibility.inBounds(mouseX, mouseY)) {
    render = population.toggleRender();
  }
}

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
  controls.visibility.draw();
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