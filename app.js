
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

function setup() {
  createCanvas(windowWidth < minWidth ? minWidth : windowWidth, windowHeight < minHeight ? minHeight : windowHeight);
  population = new Population(populationLifespan, populationSize, mutationRate, pruneSaveRate, pruneMutateRate);
  target = createVector(width/2, 50);
  
  rects = [
    { x: width / 2 - 150, y: height * 0.25, w: width / 8, h: 100},
    { x: width / 2 - 300, y: height * 0.7, w: width / 6, h: 20},
    { x: width / 2 + 200, y: height * 0.4, w: 20, h: 100},
  ];
}

function mouseClicked() {
  population.togglePause();
}

function draw() {
  background(0);

  if (!population.run()) {
    population.regenerate();
  }

  fill(255, 255, 0);
  ellipse(target.x, target.y, 10, 10);

  fill(200, 200, 200);
  rects.forEach(function(r) {
    rect(r.x, r.y, r.w, r.h);
  });
}