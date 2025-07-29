const readline = require("readline");
const crypto = require("crypto");
const Dice = require("./Dice");
const DiceSet = require("./DiceSet");

const args = process.argv.slice(2);

// Validation must provide at least 3 dice
if (args.length < 3) {
  console.log("Error: You must provide at least 3 dice.");
  console.log("Usage: node index.js 1,2,3,4,5,6 6,6,6,6,6,6 3,3,3,3,6,6 ...");
  process.exit(1);
}

// Validation of dice format
for (let i = 0; i < args.length; i++) {
  const faces = args[i].split(",").map(Number);

  if (faces.length !== 6) {
    console.log(`Error: Dice ${i + 1} must have exactly 6 faces.`);
    process.exit(1);
  }

  if (!faces.every(Number.isInteger)) {
    console.log(`Error: Dice ${i + 1} contains non-integer values.`);
    process.exit(1);
  }
}

// Construct DiceSet
const diceList = args.map((arg) => new Dice(arg.split(",").map(Number)));
const diceSet = new DiceSet(diceList);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function getHmac(secret, message) {
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

async function main() {
  // HMAC Implementation 
  const compChoice = Math.floor(Math.random() * 2).toString();
  const key = crypto.randomBytes(32).toString("hex");
  const hmac = getHmac(key, compChoice);

  console.log("Let's determine who makes the first move.");
  console.log(`I selected a random value in the range 0..1 (HMAC=${hmac}).`);
  console.log("Try to guess my selection.");
  console.log("0 - 0\n1 - 1\nX - exit\n? - help");

  let userGuess = await prompt("Your selection: ");

  if (userGuess.toLowerCase() === "x") {
    console.log("Exiting game.");
    rl.close();
    return;
  }

  if (userGuess === "?") {
    console.log("\nHELP:");
    console.log("Try to guess my secret number (0 or 1).");
    console.log("If you guess correctly, you will go first.");
    console.log("The computer has committed to a value using an HMAC.");
    console.log("After your guess, it will reveal the original value and key.");
    console.log("Then you’ll choose a die and play a round against the computer.\n");
    userGuess = await prompt("Your selection: ");
  }

  console.log(`My selection: ${compChoice} (KEY=${key})`);
  const userGoesFirst = userGuess === compChoice;
  console.log(userGoesFirst ? "You go first!" : "I go first!");

  // Die selection
  console.log("\nAvailable dice:");
  diceSet.getAllDice().forEach((dice, index) => {
    console.log(`${index + 1}: [${dice.getAllFaces().join(", ")}]`);
  });

  let userIndex = await prompt("Select your die (enter the number): ");
  userIndex = parseInt(userIndex) - 1;

  if (
    isNaN(userIndex) ||
    userIndex < 0 ||
    userIndex >= diceSet.getDiceCount()
  ) {
    console.log("Invalid selection. Exiting.");
    rl.close();
    return;
  }

  const userDice = diceSet.getDie(userIndex);

  // Computer selects random die 
  let compIndex;
  do {
    compIndex = Math.floor(Math.random() * diceSet.getDiceCount());
  } while (compIndex === userIndex && diceSet.getDiceCount() > 1);

  const compDice = diceSet.getDie(compIndex);

  // Rolling Logic
  const rollFace = (dice) => {
    const index = Math.floor(Math.random() * dice.getSidesCount());
    return dice.getFace(index);
  };

  const userRoll = rollFace(userDice);
  const compRoll = rollFace(compDice);

  console.log(`\nYou rolled: ${userRoll}`);
  console.log(`Computer rolled: ${compRoll}`);

  if (userRoll > compRoll) {
    console.log("You win!");
  } else if (compRoll > userRoll) {
    console.log("Computer wins!");
  } else {
    console.log("It's a draw!");
  }

  rl.close();
}

main();


