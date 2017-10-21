

function Individual(lifespan, mutationRate, dna) {
  this.radius = 15;
  this.dna = dna ? dna : new DNA(lifespan, mutationRate);
  this.pos;
  this.vel;
  this.acc;
  this.fitness;
  this.tickCompleted;
  this.tickStuck;
  this.mutationCount = 0;

  /**
   * Resets individual with starting values
   */
  this.reset = function () {
    this.pos = createVector(100, height - 100);
    this.vel = createVector();
    this.acc = createVector();
    this.fitness = 0.0;
    this.tickCompleted = null;
    this.tickStuck = null;
  };

  // Reset newly created individuals
  this.reset();

  /**
   * Mate this individual with a partner, mutate it, and return a new child individual
   */
  this.mate = function (lifespan, mutationRate, partner) {
    let newDna = this.dna.crossover(lifespan, mutationRate, partner.dna);
    let mutationCount = newDna.mutate();
    let child = new Individual(lifespan, mutationRate, newDna);
    child.mutationCount += mutationCount;
    return child;
  }

  /**
   * Calculate the fitness for this individual based on distance to target and time taken to reach target
   */
  this.calcFitness = function () {

    let dFit = 1000 / Math.max(1, dist(this.pos.x, this.pos.y, target.x, target.y));
    if (this.tickCompleted) {
      // Individual arrived at goal, use best time to calculate fitness
      let tFit = pow((1 + (1 / this.tickCompleted)), 2);
      this.fitness = dFit * tFit;
      return;
    }

    // Still finding path
    this.fitness = dFit;

    if (this.tickStuck) {
      // Individual stuck, penalty
      this.fitness /= stuckPenaltyDivisor;
      return;
    }
  }

  /**
   * Update individual this tick simulation
   */
  this.update = function (tick) {
    
    if (this.tickCompleted || this.tickStuck) {
      return;
    }

    let d = dist(this.pos.x, this.pos.y, target.x, target.y);
    if (d < this.radius) {
      this.tickCompleted = tick;
      return;
    }
    
    // Check for screen edge & obstacle collisions
    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height
      || rectangles.some((r) => r.inBounds(this.pos.x, this.pos.y), this)) {
        // Collision detected, set velocity to 0
        this.vel.mult(0);
        this.acc.mult(0);
        this.tickStuck = tick;
        return;
    }

    // Add acceleration vector and update velocity/position
    this.acc.add(this.dna.getGene(tick));
    this.vel.mult(dampenVelocityRate); // dampen velocity
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  /**
   * Draw individual to screen
   */
  this.draw = function () {
    let color = this.tickStuck ? [255, 50, 50, 50] :
      (this.tickCompleted ? [20, 200, 100, 100] :
      [50, 100, 200, 100]);
    push();
    fill(color);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    ellipse(0, 0, this.radius * 2, this.radius * 2);
    pop();
  }
}