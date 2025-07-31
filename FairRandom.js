const crypto = require("crypto");

class FairRandom {
    constructor(range) {
        this.range = range;
        this.secret = crypto.randomBytes(32);
        this.computerValue = this.secureRandomInt(range);
        this.hmac = this.computeHmac(this.secret, this.computerValue.toString());
    }

    secureRandomInt(max) {
        let random;
        const limit = Math.floor(256 / max) * max;
        do {
            random = crypto.randomBytes(1)[0];
        } while (random >= limit);
        return random % max;
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
            final
        };
    }
}

module.exports = FairRandom;
