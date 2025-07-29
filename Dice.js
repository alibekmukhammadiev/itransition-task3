class Dice {
  constructor(faces) {
      this.faces = faces;
  }

  getSidesCount() {
    return this.faces.length;
  }

  getFace(index) {
    return this.faces[index];
  }

  getAllFaces() {
    return this.faces;
  }
}

module.exports = Dice;