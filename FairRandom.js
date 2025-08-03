const crypto = require("crypto");

class FairRandom {
  constructor(range) {
    this.range = range;
    this.secret = crypto.randomBytes(32);
    this.computerValue = crypto.randomInt(range);
    this.hmac = this.computeHmac(this.secret, this.computerValue.toString());
  }

  computeHmac(key, message) {
    return crypto.createHmac("sha3-256", key).update(message).digest("hex");
  }

  getCommitment() {
    return this.hmac;
  }

  reveal(userValue) {
    const final = (this.computerValue + userValue) % this.range;
    return {
      computerValue: this.computerValue,
      secret: this.secret.toString("hex"),
      final,
    };
  }
}

module.exports = FairRandom;
