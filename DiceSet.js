class DiceSet {
  constructor() {
    this.diceList = [];
  }

  addDice(dice) {
    this.diceList.push(dice);
  }

  getAllDice() {
    return this.diceList;
  }

  getDiceCount() {
    return this.diceList.length;
  }
  getDie(index) {
    return this.diceList[index];
  }
}

module.exports = DiceSet;
