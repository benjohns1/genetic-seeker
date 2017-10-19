function DNA(lifespan, randomize) {
    this.genes = [];
    this.mutationRate = 0.02;
  
    let randomGene = function() {
      return p5.Vector.random2D().setMag(maxForce);
    };
    
    if (randomize !== false) {
      for (var i = 0; i < lifespan; i++) {
        this.genes[i] = randomGene();
      }
    }
  
    this.crossover = function(lifespan, partner) {
      let newDna = new DNA(lifespan, false);
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