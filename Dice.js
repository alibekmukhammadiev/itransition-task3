class Dice {
  constructor(faces) {
    if (!Array.isArray(faces) || faces.length < 2) {
      throw new Error("Each die must have at least 2 sides.");
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
