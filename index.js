const readline = require("readline");
const Dice = require("./Dice");
const DiceSet = require("./DiceSet");
const FairRandom = require("./FairRandom");

// For generating table
const Table = require("cli-table3");

const args = process.argv.slice(2);

// Validating CLI args
if (args.length < 3) {
  console.log("Error: You must provide at least 3 dice.");
  console.log("Usage: node index.js 2,2,4,4,9,9 1,1,6,6,8,8 3,3,5,5,7,7");
  process.exit(1);
}

let diceList;
try {
  diceList = args.map((arg, idx) => {
    const faces = arg.split(",").map(Number);
    if (!faces.every(Number.isInteger))
      throw new Error(`Dice ${idx + 1} has non-integer values.`);
    if (faces.length < 2)
      throw new Error(`Dice ${idx + 1} must have at least 2 faces.`);
    return new Dice(faces);
  });

  // Checking for all dice have same number of sides or not
  const sideCount = diceList[0].getSidesCount();
  if (!diceList.every((d) => d.getSidesCount() === sideCount)) {
    throw new Error("All dice must have the same number of sides.");
  }
} catch (err) {
  console.log("Error:", err.message);
  process.exit(1);
}
const diceSet = new DiceSet(diceList);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const ask = (q) => new Promise((res) => rl.question(q, res));

// Computing probabilities for help table
function calculateWinProbabilities(diceSet) {
  const n = diceSet.getDiceCount();
  const table = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let wins = 0,
        total = 0;
      const a = diceSet.getDie(i).getAllFaces();
      const b = diceSet.getDie(j).getAllFaces();
      for (const x of a)
        for (const y of b) {
          if (x > y) wins++;
          total++;
        }
      table[i][j] = (wins / total).toFixed(4);
    }
  }
  return table;
}

function displayHelpTable(diceSet) {
  console.log("\nProbability of user winning against each die:");
  const headers = ["User dice vs. Computer"].concat(
    diceSet.getAllDice().map((d) => d.getAllFaces().join(","))
  );
  const table = new Table({ head: headers });
  const probs = calculateWinProbabilities(diceSet);
  diceSet.getAllDice().forEach((die, i) => {
    const row = [die.getAllFaces().join(",")];
    for (let j = 0; j < diceSet.getDiceCount(); j++) {
      row.push(probs[i][j]);
    }
    table.push(row);
  });
  console.log(table.toString());
}

async function fairRoll(range) {
  const fair = new FairRandom(range);
  console.log(
    `I selected a random value in 0..${
      range - 1
    } (HMAC=${fair.getCommitment()})`
  );
  let userVal;
  while (true) {
    userVal = await ask(`Enter your number (0..${range - 1}): `);
    userVal = parseInt(userVal);
    if (!isNaN(userVal) && userVal >= 0 && userVal < range) break;
    console.log("Invalid input.");
  }
  const reveal = fair.reveal(userVal);
  console.log(`Computer value: ${reveal.computerValue}`);
  console.log(`Key: ${reveal.secret}`);
  console.log(`Final result: (computer + user) mod ${range} = ${reveal.final}`);
  return reveal.final;
}

async function main() {
  console.log("Welcome to the Non-Transitive Dice Fair Play Simulator!");
  console.log("Type ? at any prompt for help.");

  // Determining who picks first using fair protocol
  console.log("\nLet's decide who picks a die first!");
  const firstMove = await fairRoll(2);
  const userGoesFirst = firstMove === 1;
  console.log(
    userGoesFirst ? "You will choose first!" : "Computer will choose first!"
  );

  // If user request table then displaying table
  let choice = await ask(
    "Type 'help' to see probability table or press Enter to continue: "
  );
  if (choice.toLowerCase() === "help") displayHelpTable(diceSet);

  // Selection of Dice
  console.log("\nAvailable dice:");
  diceSet
    .getAllDice()
    .forEach((d, i) =>
      console.log(`${i + 1}: [${d.getAllFaces().join(", ")}]`)
    );
  let userIndex;
  if (userGoesFirst) {
    userIndex = parseInt(await ask("Select your die (1..n): ")) - 1;
  } else {
    userIndex = Math.floor(Math.random() * diceSet.getDiceCount());
    console.log(
      `Computer chose die ${userIndex + 1}: [${diceSet
        .getDie(userIndex)
        .getAllFaces()
        .join(", ")}]`
    );
  }
  if (userIndex < 0 || userIndex >= diceSet.getDiceCount()) {
    console.log("Invalid selection.");
    process.exit(1);
  }
  const compIndex = userGoesFirst
    ? (() => {
        let idx;
        do {
          idx = Math.floor(Math.random() * diceSet.getDiceCount());
        } while (idx === userIndex);
        return idx;
      })()
    : parseInt(await ask("Select your die (1..n): ")) - 1;

  console.log(
    `Computer chose die ${compIndex + 1}: [${diceSet
      .getDie(compIndex)
      .getAllFaces()
      .join(", ")}]`
  );

  // Fair roll for each
  console.log("\nNow rolling your die:");
  const userFaceIndex = await fairRoll(
    diceSet.getDie(userIndex).getSidesCount()
  );
  const userRoll = diceSet.getDie(userIndex).getFace(userFaceIndex);
  console.log(`Your roll: ${userRoll}`);

  console.log("\nNow rolling computer's die:");
  const compFaceIndex = await fairRoll(
    diceSet.getDie(compIndex).getSidesCount()
  );
  const compRoll = diceSet.getDie(compIndex).getFace(compFaceIndex);
  console.log(`Computer roll: ${compRoll}`);

  // Deciding who is the winner
  console.log(
    userRoll > compRoll
      ? "You win!"
      : compRoll > userRoll
      ? "Computer wins!"
      : "It's a draw!"
  );
  rl.close();
}

main();
