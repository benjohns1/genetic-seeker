function Population(lifespan, popsize) {
    this.individuals = [];
    this.popsize = popsize === undefined ? 0 : popsize;
    this.lifespan = lifespan === undefined ? 100 : lifespan;
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
    this.pruneSaveRate = 0.5;
    this.pruneMutateRate = 0.01;
    this.bestOverallFitness = 0;
  
    if (popsize > 0) {
      for (var i = 0; i < this.popsize; i++) {
        this.individuals[i] = new Individual(lifespan);
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
      let newChild = parentA.mate(this.lifespan, parentB);
      this.mutationCount += newChild.mutationCount;
      this.individuals.push(newChild);
    };
  
    this.regenerate = function() {

      this.calcFitness();
      
      // Next generation
      this.generation++;
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

        // Reset individual for next generation
        individual.reset();

      }, this);
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
  
      return true;
    };
  
    this.drawInfo = function() {
      let x = 10, y = 20, width = 130;
      push();
      fill(200, 200, 200, 255);
      textAlign(RIGHT);
      text("Generation: \n" +
        "Tick: \n" +
        "New children: \n" +
        "Population: \n" +
        "\nLast Generation: \n" +
        "Total fitness: \n" +
        "Min fitness: \n" +
        "Max fitness: \n" +
        "Best overall fitness: \n" +
        "Mutations: ", x, y, width);
      textAlign(LEFT);
      text(this.generation + "\n" +
      this.tick + " / " + this.lifespan + "\n" +
      this.newChildren + "\n" +
      this.popsize + "\n" +
      "\n" + (this.generation > 0 ? this.generation - 1 : 0) + "\n" +
      this.previousTotalFitness.toFixed(2) + "\n" +
      this.previousMinFitness.toFixed(2) + "\n" +
      this.previousMaxFitness.toFixed(2) + "\n" +
      this.bestOverallFitness.toFixed(2) + "\n" +
      this.mutationCount, x + width, y, width);
      pop();
    }
  }