function Population(lifespan, popsize, mutationRate, pruneSaveRate, pruneMutateRate) {
    this.individuals = [];
    this.popsize = popsize === undefined ? 0 : popsize;
    this.lifespan = lifespan === undefined ? 100 : lifespan;
    this.mutationRate = mutationRate === undefined ? 0.02 : mutationRate;
    this.pruneSaveRate = pruneSaveRate === undefined ? 0.5 : pruneSaveRate;
    this.pruneMutateRate = pruneMutateRate === undefined ? 0.01 : pruneMutateRate;
    this.tick = 0;
    this.totalFitness = 0;
    this.maxFitness = 0;
    this.minFitness = Infinity;
    this.paused = false;
    this.generation = 1;
    this.newChildren = this.popsize;
    this.previousMaxFitness = 0;
    this.previousMinFitness = 0;
    this.previousTotalFitness = 0;
    this.mutationCount = 0;
    this.bestOverallFitness = 0;
    this.highestOverallTotalFitness = 0;
    this.maxOverallMutations = 0;
    this.stats = [];
  
    if (popsize > 0) {
      for (var i = 0; i < this.popsize; i++) {
        this.individuals[i] = new Individual(this.lifespan, this.mutationRate);
      }
    }
  
    this.togglePause = function() {
      this.paused = !this.paused;
    };
  
    this.calcFitness = function() {
      this.totalFitness = 0;
      this.maxFitness = 0;
      this.minFitness = Infinity;
      this.individuals.forEach(function(individual) {
        individual.calcFitness();
        this.totalFitness += individual.fitness;
        if (individual.fitness > this.maxFitness) {
          this.maxFitness = individual.fitness;
        }
        if (individual.fitness < this.minFitness) {
          this.minFitness = individual.fitness;
        }
      }, this);
    };

    this.prune = function() {
        let newIndividuals = [];
        let meanFitness = this.totalFitness / this.popsize;
        this.totalFitness = 0;
        this.individuals.forEach(function(individual) {
            if (individual.fitness > meanFitness
              || random(1) < this.pruneSaveRate) {
                // Save individuals with above average fitness, or chance to save those below average
                this.totalFitness += individual.fitness;
                if (random(1) < this.pruneMutateRate) {
                    // Chance to mutate existing individuals
                    this.mutationCount += individual.dna.mutate();
                }
                newIndividuals.push(individual);
            }
        }, this);
        this.individuals = newIndividuals;
    };
    
    this.addNewChild = function(parentA, parentB) {
      let newChild = parentA.mate(this.lifespan, this.mutationRate, parentB);
      this.mutationCount += newChild.mutationCount;
      this.individuals.push(newChild);
    };
  
    this.regenerate = function() {

      this.calcFitness();
      
      // Next generation
      this.generation++;
      if (this.totalFitness > this.highestOverallTotalFitness) {
        this.highestOverallTotalFitness = this.totalFitness;
      }
      if (this.maxFitness > this.bestOverallFitness) {
          this.bestOverallFitness = this.maxFitness;
      } else {
          // Increase population lifespan if fitness didn't improve
          this.lifespan++;
      }
      this.previousMaxFitness = this.maxFitness;
      this.previousMinFitness = this.minFitness;
      this.previousTotalFitness = this.totalFitness;
      this.tick = 0;
      this.mutationCount = 0;

      this.prune();
  
      let pairings = [];
      this.newChildren = this.popsize - this.individuals.length;
      for (let i = 0; i < this.newChildren; i++) {
        pairings.push({
          a: random(0, this.totalFitness),
          b: random(0, this.totalFitness)
        });
      }

      this.individuals.forEach(function(individual) {
        pairings.forEach(function(pairing) {
          if (pairing.done) {
            return;
          }
          pairing.a -= individual.fitness;
          pairing.b -= individual.fitness;
          if (pairing.a <= 0) {
            pairing.parentA = individual;
            if (pairing.parentB) {
              this.addNewChild(pairing.parentA, pairing.parentB);
              pairing.done = true;
              return;
            }
          }
          if (pairing.b <= 0) {
            pairing.parentB = individual;
            if (pairing.parentA) {
              this.addNewChild(pairing.parentA, pairing.parentB);
              pairing.done = true;
              return;
            }
          }
        }, this);

        if (this.mutationCount > this.maxOverallMutations) {
          this.maxOverallMutations = this.mutationCount;
        }

        // Reset individual for next generation
        individual.reset();

      }, this);
      
      this.saveStats();
    };
  
    this.run = function() {
  
      let paused = this.paused;
  
      this.individuals.forEach(function(individual) {
        if (!paused) {
          individual.update(this.tick);
        }
        individual.draw();
      }, this);
  
      if (!paused) {
        this.tick++;
        if (this.tick >= this.lifespan) {
          return false;
        }
      }
  
      this.drawInfo();
      this.drawStats();
  
      return true;
    };

    this.saveStats = function() {
      let prev = (this.generation > 0 ? this.generation - 1 : 0);

      // Previous generation
      if (!(prev in this.stats)) {
        this.stats[prev] = {
          lifespan: this.lifespan,
          newChildren: this.popsize,
          popsize: this.popsize
        };
      }
      this.stats[prev].mutations = this.mutationCount;
      this.stats[prev].totalFitness = this.totalFitness;
      this.stats[prev].minFitness = this.minFitness;
      this.stats[prev].maxFitness = this.maxFitness;

      this.stats[this.generation] = {
        lifespan: this.lifespan,
        newChildren: this.newChildren,
        popsize: this.popsize
      };
    };

    this.drawStats = function() {
      push();

      let w = 400, h = 150, x = width - w, y = height;
      let xStep = w / this.stats.length;
      let fitnessStep = h / this.bestOverallFitness;
      let totalFitnessStep = h / this.highestOverallTotalFitness;
      let mutationStep = h / this.maxOverallMutations;
      let colors = {
        totalFitness: [255, 255, 255],
        maxFitness: [20, 200, 100],
        minFitness: [255, 50, 50],
        mutations: [120, 120, 255]
      }
      textAlign(RIGHT);
      fill(colors.totalFitness);
      text("Total fitness (0 - " + ceil(this.highestOverallTotalFitness) + ")", x, y - h - 60, w - 10);
      fill(colors.maxFitness);
      text("Max fitness (0 - " + ceil(this.bestOverallFitness) + ")", x, y - h - 45, w - 10);
      fill(colors.minFitness);
      text("Min fitness (0 - " + ceil(this.bestOverallFitness) + ")", x, y - h - 30, w - 10);
      fill(colors.mutations);
      text("Mutations (0 - " + ceil(this.maxOverallMutations) + ")", x, y - h - 15, w - 10);
      let prev = {
        x: x,
        maxFitness: y,
        minFitness: y,
        totalFitness: y,
        mutations: y
      };
      let next;
      this.stats.forEach(function(stat, gen) {
        next = {
          x: x + (xStep * gen),
          maxFitness: y - (fitnessStep * stat.maxFitness),
          minFitness: y - (fitnessStep * stat.minFitness),
          totalFitness: y - (totalFitnessStep * stat.totalFitness),
          mutations: y - (mutationStep * stat.mutations)
        }
        stroke(colors.totalFitness);
        line(prev.x, prev.totalFitness, next.x, next.totalFitness);
        stroke(colors.maxFitness);
        line(prev.x, prev.maxFitness, next.x, next.maxFitness);
        stroke(colors.minFitness);
        line(prev.x, prev.minFitness, next.x, next.minFitness);
        stroke(colors.mutations);
        line(prev.x, prev.mutations, next.x, next.mutations);
        Object.assign(prev, next);
      });

      pop();
    };
  
    this.drawInfo = function() {
      let infoPairs = [
        ["This Generation:", this.generation],
        ["Tick: ", this.tick + " / " + this.lifespan],
        ["Population:", this.popsize],
        ["New children:", this.newChildren],
        ["Mutations:", this.mutationCount],
        ["\nLast Generation:", "\n" + (this.generation > 0 ? this.generation - 1 : 0)],
        ["Total fitness:", this.previousTotalFitness.toFixed(2)],
        ["Min fitness:", this.previousMinFitness.toFixed(2)],
        ["Max fitness:", this.previousMaxFitness.toFixed(2)],
        ["\nBest overall fitness:", "\n" + this.bestOverallFitness.toFixed(2)],
      ];

      let left = "";
      let right = "";
      infoPairs.forEach(function(curr) {
        left += curr[0] + "\n";
        right += curr[1] + "\n";
      });

      let x = 10, y = 20, w = 130;
      push();

      fill(200, 200, 200, 255);
      textAlign(RIGHT);
      text(left, x, y, w);
      textAlign(LEFT);
      text(right, x + w, y, w);

      pop();
    }
  }