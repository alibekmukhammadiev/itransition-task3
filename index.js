const readline = require("readline");
const crypto = require("crypto");
const Dice = require("./Dice");
const DiceSet = require("./DiceSet");

const args = process.argv.slice(2);

// Validation of Input
if (args.length < 3) {
  console.log("Usage: node index.js dice1 dice2 dice3 ... (at least 3 dice)");
  console.log("Each dice should have exactly 6 comma-separated integers.");
  process.exit(1);
}

const diceList = [];
for (let i = 0; i < args.length; i++) {
  const faces = args[i].split(",").map(Number);
  if (faces.length !== 6 || faces.some(f => !Number.isInteger(f))) {
    console.log(`Invalid dice at position ${i + 1}. Must be 6 integers.`);
    process.exit(1);
  }
  diceList.push(new Dice(faces));
}

const diceSet = new DiceSet(diceList);

// HMAC Logic
function getHmac(secret, message) {
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  const compChoice = Math.floor(Math.random() * 2).toString();
  const key = crypto.randomBytes(32).toString("hex");
  const hmac = getHmac(key, compChoice);

  console.log("Let's determine who makes the first move.");
  console.log(`I selected a random value in the range 0..1 (HMAC=${hmac}).`);
  console.log("Try to guess my selection.");
  console.log("0 - 0\n1 - 1\nX - exit\n? - help");

  const userGuess = await prompt("Your selection: ");
  if (userGuess.toLowerCase() === "x") {
    console.log("Exiting game.");
    rl.close();
    return;
  }

  console.log(`My selection: ${compChoice} (KEY=${key})`);
  const userGoesFirst = userGuess === compChoice;
  console.log(userGoesFirst ? "You go first!" : "I go first!");

  // Game Starts from here
  console.log("\nAvailable dice:");
  diceSet.getAllDice().forEach((dice, index) => {
    console.log(`${index + 1}: [${dice.getAllFaces().join(', ')}]`);
  });

  let userIndex = await prompt("Select your die (enter the number): ");
  userIndex = parseInt(userIndex) - 1;

  if (isNaN(userIndex) || userIndex < 0 || userIndex >= diceSet.getDiceCount()) {
    console.log("Invalid selection. Exiting.");
    rl.close();
    return;
  }

  const userDice = diceSet.getDie(userIndex);

  // Computer picks random die 
  let compIndex;
  do {
    compIndex = Math.floor(Math.random() * diceSet.getDiceCount());
  } while (compIndex === userIndex); // if you want to avoid same dice

  const computerDice = diceSet.getDie(compIndex);

  const rollFace = (dice) => {
    const index = Math.floor(Math.random() * dice.getSidesCount());
    return dice.getFace(index);
  };

  const userRoll = rollFace(userDice);
  const compRoll = rollFace(computerDice);

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

