const readline = require('readline');
const crypto = require('crypto');
const Dice = require('./Dice');
const DiceSet = require('./DiceSet');


const args = process.argv.slice(2);

// No dice provided
if (args.length === 0) {
  console.log("Error: No dice provided.");
  console.log("Usage: node index.js dice1 dice2 dice3 ... (at least 3 dice)");
  process.exit(1);
}

// Only 2 dice
if (args.length < 3) {
  console.log("Error: At least 3 dice are required.");
  process.exit(1);
}

// Parse the dice
const diceSets = args.map(arg => arg.split(',').map(Number));

// Non-integer values
for (let i = 0; i < diceSets.length; i++) {
  for (let face of diceSets[i]) {
    if (!Number.isInteger(face)) {
      console.log(`Error: All dice faces must be integers. Found "${face}" in dice ${i + 1}`);
      process.exit(1);
    }
  }
}

// Invalid number of sides (not 6)
for (let i = 0; i < diceSets.length; i++) {
  if (diceSets[i].length !== 6) {
    console.log(`Error: Each die must have exactly 6 sides. Dice ${i + 1} has ${diceSets[i].length} sides.`);
    process.exit(1);
  }
}

const diceList = args.map(arg => {
  const faces = arg.split(',').map(Number);
  return new Dice(faces);
});

const diceSet = new DiceSet(diceList);

function getHmac(secret, message) {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  // Computer picks 0 or 1
  const compChoice = Math.floor(Math.random() * 2).toString();
  const key = crypto.randomBytes(32).toString('hex');
  const hmac = getHmac(key, compChoice);

  console.log("Let's determine who makes the first move.");
  console.log(`I selected a random value in the range 0..1 (HMAC=${hmac}).`);
  console.log("Try to guess my selection.\n0 - 0\n1 - 1\nX - exit\n? - help");

  const userGuess = await prompt("Your selection: ");
  if (userGuess.toLowerCase() === 'x') {
    console.log("Exiting game.");
    rl.close();
    return;
  }

  console.log(`My selection: ${compChoice} (KEY=${key})`);

  const userGoesFirst = userGuess === compChoice;
  console.log(userGoesFirst ? "You go first!" : "I go first!");

  rl.close();
}

main();

