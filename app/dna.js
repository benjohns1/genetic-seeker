function DNA(lifespan, mutationRate, randomize) {
    this.genes = [];
    this.mutationRate = mutationRate === undefined ? 0.02 : mutationRate;
  
    let randomGene = function() {
      return p5.Vector.random2D().limit(maxForce);
    };
    
    if (randomize !== false) {
      for (var i = 0; i < lifespan; i++) {
        this.genes[i] = randomGene();
      }
    }
  
    this.crossover = function(lifespan, mutationRate, partner) {
      let newDna = new DNA(lifespan, mutationRate, false);
      var mid = floor(random(this.genes.length));
      for (var i = 0; i < this.genes.length; i++) {
        if (i > mid) {
          newDna.genes[i] = this.genes[i];
        } else {
          newDna.genes[i] = partner.genes[i];
        }
      }
      return newDna;
    }
  
    this.mutate = function() {
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