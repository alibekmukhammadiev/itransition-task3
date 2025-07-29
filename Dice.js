class Dice {
  constructor(faces) {
    if (!Array.isArray(faces) || faces.length !== 6) {
      throw new Error("Each die must have exactly 6 sides.");
    }
    this.faces = faces;
  }

  getFace(index) {
    return this.faces[index];
  }

  getSidesCount() {
    return this.faces.length;
  }

  getAllFaces() {
    return this.faces;
  }
}

module.exports = Dice;
