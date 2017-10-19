
var population;
var populationLifespan = 100;
var populationSize = 100;
var target;
var rects;
var maxForce = 0.3;

var minWidth = 600;
var minHeight = 600;

function setup() {
  createCanvas(windowWidth < minWidth ? minWidth : windowWidth, windowHeight < minHeight ? minHeight : windowHeight);
  population = new Population(populationLifespan, populationSize);
  target = createVector(width/2, 50);
  
  rects = [
    { x: width / 2 - 150, y: height / 4, w: width / 2, h: 50},
    { x: 0, y: height / 2, w: height / 2, h: 20}
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