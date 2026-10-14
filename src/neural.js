/* =================================================================
   EVOSIM: NEURAL ENGINE (src/neural.js)
   Feed-Forward Neural Network with Genetic Operators & Serialization
   ================================================================= */

class NeuralNetwork {
  constructor(inputCount = 7, hiddenCount = 8, outputCount = 2, weights = null) {
    this.inputCount = inputCount;
    this.hiddenCount = hiddenCount;
    this.outputCount = outputCount;

    // Weights: input -> hidden (inputCount * hiddenCount)
    // Biases: hidden (hiddenCount)
    // Weights: hidden -> output (hiddenCount * outputCount)
    // Biases: output (outputCount)

    this.numWeightsIH = this.inputCount * this.hiddenCount;
    this.numBiasesH = this.hiddenCount;
    this.numWeightsHO = this.hiddenCount * this.outputCount;
    this.numBiasesO = this.outputCount;

    this.totalGenes = this.numWeightsIH + this.numBiasesH + this.numWeightsHO + this.numBiasesO;

    if (weights && weights.length === this.totalGenes) {
      this.weights = new Float32Array(weights);
    } else {
      this.weights = new Float32Array(this.totalGenes);
      this.randomize();
    }

    // Cache activations for live visualizer
    this.lastInputs = new Float32Array(this.inputCount);
    this.lastHidden = new Float32Array(this.hiddenCount);
    this.lastOutputs = new Float32Array(this.outputCount);
  }

  randomize() {
    for (let i = 0; i < this.totalGenes; i++) {
      // Uniform random between -1.5 and 1.5
      this.weights[i] = (Math.random() * 2 - 1) * 1.5;
    }
  }

  // Activation function: Hyperbolic Tangent (Tanh) -> range [-1, 1]
  tanh(x) {
    return Math.tanh(x);
  }

  predict(inputs) {
    // 1. Copy inputs
    for (let i = 0; i < this.inputCount; i++) {
      this.lastInputs[i] = inputs[i] || 0;
    }

    let wIdx = 0;

    // 2. Compute Hidden Layer
    for (let h = 0; h < this.hiddenCount; h++) {
      let sum = 0;
      for (let i = 0; i < this.inputCount; i++) {
        sum += this.lastInputs[i] * this.weights[wIdx++];
      }
      // Add hidden bias
      sum += this.weights[this.numWeightsIH + h];
      this.lastHidden[h] = this.tanh(sum);
    }

    // Offset past hidden weights + hidden biases
    wIdx = this.numWeightsIH + this.numBiasesH;

    // 3. Compute Output Layer
    for (let o = 0; o < this.outputCount; o++) {
      let sum = 0;
      for (let h = 0; h < this.hiddenCount; h++) {
        sum += this.lastHidden[h] * this.weights[wIdx++];
      }
      // Add output bias
      sum += this.weights[this.numWeightsIH + this.numBiasesH + this.numWeightsHO + o];
      this.lastOutputs[o] = this.tanh(sum);
    }

    return this.lastOutputs;
  }

  // Clone with genetic mutations
  mutate(mutationRate = 0.08, mutationMagnitude = 0.4) {
    const childWeights = new Float32Array(this.weights);

    for (let i = 0; i < this.totalGenes; i++) {
      if (Math.random() < mutationRate) {
        if (Math.random() < 0.1) {
          // Complete random reset (5% chance of re-roll)
          childWeights[i] = (Math.random() * 2 - 1) * 1.5;
        } else {
          // Gaussian-like perturbation
          const delta = (Math.random() * 2 - 1) * mutationMagnitude;
          childWeights[i] = Math.max(-3, Math.min(3, childWeights[i] + delta));
        }
      }
    }

    return new NeuralNetwork(this.inputCount, this.hiddenCount, this.outputCount, childWeights);
  }

  // Genetic Crossover between two parent neural nets
  static crossover(parentA, parentB, mutationRate = 0.05) {
    const childWeights = new Float32Array(parentA.totalGenes);
    const splitPoint = Math.floor(Math.random() * parentA.totalGenes);

    for (let i = 0; i < parentA.totalGenes; i++) {
      let gene = i < splitPoint ? parentA.weights[i] : parentB.weights[i];
      // Mutation
      if (Math.random() < mutationRate) {
        gene += (Math.random() * 2 - 1) * 0.35;
      }
      childWeights[i] = Math.max(-3, Math.min(3, gene));
    }

    return new NeuralNetwork(parentA.inputCount, parentA.hiddenCount, parentA.outputCount, childWeights);
  }

  toJSON() {
    return {
      inputCount: this.inputCount,
      hiddenCount: this.hiddenCount,
      outputCount: this.outputCount,
      weights: Array.from(this.weights)
    };
  }

  static fromJSON(json) {
    return new NeuralNetwork(json.inputCount, json.hiddenCount, json.outputCount, json.weights);
  }
}

// Export for browser
window.NeuralNetwork = NeuralNetwork;
