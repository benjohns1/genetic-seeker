

function Individual(lifespan, mutationRate, dna) {
    this.radius = 15;
    this.dna = dna ? dna : new DNA(lifespan, mutationRate);
    this.pos;
    this.vel;
    this.acc;
    this.fitness;
    this.tickCompleted;
    this.stuck;
    this.mutationCount = 0;
    this.maxVelocity = 3.0;
    
    this.reset = function() {
        this.pos = createVector(width/2, height - 50);
        this.vel = createVector();
        this.acc = createVector();
        this.fitness = 0.0;
        this.tickCompleted = null;
        this.stuck = false;
    };

    this.reset();
  
    this.applyForce = function(force) {
      
      // Check for collisions
      if (rects.some(function(r) {
        if (this.pos.x > r.x && this.pos.x < r.x + r.w
          && this.pos.y > r.y && this.pos.y < r.y + r.h) {
          return true;
        }
  
        if (this.pos.x > width || this.pos.x < 0) {
          return true;
        }
  
        if (this.pos.y > height || this.pos.y < 0) {
          return true;
        }
  
      }, this)) {
        this.vel = createVector(0, 0, 0);
        this.stuck = true;
        return; // collision detected
      }
  
      this.acc.add(force);
    }
  
    this.mate = function(lifespan, mutationRate, partner) {
      let newDna = this.dna.crossover(lifespan, mutationRate, partner.dna);
      let mutationCount = newDna.mutate();
      let child = new Individual(lifespan, mutationRate, newDna);
      child.mutationCount += mutationCount;
      return child;
    }
  
    this.calcFitness = function() {
  
      let d = dist(this.pos.x, this.pos.y, target.x, target.y);
      if (this.tickCompleted) {
        // Individual arrived at goal, use time to calculate fitness
        this.fitness = (1000 / d) * (populationLifespan / this.tickCompleted);
        return;
      }
  
      // Still finding path
      this.fitness = 1000 / d;
  
      if (this.stuck) {
        // Individual stuck, penalty
        this.fitness /= 10;
        return;
      }
    }
  
    this.update = function(tick) {
      
      let d = dist(this.pos.x, this.pos.y, target.x, target.y);
      if (d < this.radius) {
        this.tickCompleted = tick;
      }
  
      if (this.tickCompleted) {
        return;
      }
  
      this.applyForce(this.dna.genes[tick]);
  
      this.vel.add(this.acc).limit(this.maxVelocity);
      this.pos.add(this.vel);
      this.acc.mult(0);
    }
  
    this.draw = function() {
      push();
      fill(50, 100, 200, 100);
      translate(this.pos.x, this.pos.y);
      rotate(this.vel.heading());
      rectMode(CENTER);
      ellipse(0, 0, this.radius * 2, this.radius * 2);
      pop();
    }
  }