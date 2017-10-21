function DNA(lifespan, mutationRate, randomize) {
  this.genes = [];
  this.mutationRate = mutationRate === undefined ? 0.02 : mutationRate;

  let randomGene = function () {
    return p5.Vector.random2D().limit(maxForce);
  };

  // Randomly generate genes for new DNA
  if (randomize !== false) {
    for (var i = 0; i < lifespan; i++) {
      this.genes[i] = randomGene();
    }
  }

  this.getGene = function (tick) {
    if (tick >= this.genes.length) {
      // Generate a random new gene if DNA is not long enough
      this.genes[tick] = randomGene();
    }
    return this.genes[tick];
  }

  /**
   * Cross this DNA with a partner DNA
   * Randomly chooses midpoint and uses left or right side of split genes from each parent respectively
   */
  this.crossover = function (lifespan, mutationRate, partner) {
    let newDna = new DNA(lifespan, mutationRate, false);
    var mid = floor(random(this.genes.length));
    for (var i = 0; i < lifespan; i++) {
      if (i > mid && i < this.genes.length) {
        // Use gene from this parent
        newDna.genes[i] = this.genes[i];
      } else if (i < partner.genes.length) {
        // Use gene from partner
        newDna.genes[i] = partner.genes[i];
      } else {
        // This child has more genes than parents, randomly generate
        newDna.genes[i] = randomGene();
      }
    }
    return newDna;
  }

  /**
   * Randomly mutates genes, given a mutation rate chance
   */
  this.mutate = function () {
    let count = 0;
    for (let i = 0; i < this.genes.length; i++) {
      if (random(1) < this.mutationRate) {
        this.genes[i] = randomGene();
        count++;
      }
    }
    return count;
  }
}