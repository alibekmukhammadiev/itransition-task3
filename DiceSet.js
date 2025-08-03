class DiceSet {
  constructor(diceList) {
    this.diceList = diceList;
  }

  getAllDice() {
    return this.diceList;
  }

  getDie(index) {
    return this.diceList[index];
  }

  getDiceCount() {
    return this.diceList.length;
  }
}

module.exports = DiceSet; 
