// LAB02 - Rock Paper Scissors Game
// This is a Node.js console application.
// It uses the "prompt" npm package to ask the user for input.

// Import the prompt package so we can collect input from the user
const prompt = require("prompt");

// Start the prompt package before asking the user any questions
prompt.start();

// Ask the user to enter their choice.
// The answer will be stored inside result.userSelection.
prompt.get(["userSelection"], function (err, result) {
  // Check if there was an error while collecting user input
  if (err) {
    console.log("An error occurred while reading your input.");
    return;
  }

  // Convert the user's answer to uppercase.
  // This allows the user to type rock, Rock, ROCK, paper, etc.
  const userSelection = result.userSelection.toUpperCase();

  // Validate the user's input.
  // The user must only enter ROCK, PAPER, or SCISSORS.
  if (
    userSelection !== "ROCK" &&
    userSelection !== "PAPER" &&
    userSelection !== "SCISSORS"
  ) {
    console.log("Invalid selection. Please choose ROCK, PAPER, or SCISSORS.");
    return;
  }

  // Generate a random decimal number between 0 and 1.
  // Example values can be 0.12, 0.45, 0.91, etc.
  const randomNumber = Math.random();

  // Create a variable to store the computer's choice
  let computerSelection;

  // Use the random number to decide the computer's choice.
  // According to the lab instructions:
  // 0.00 - 0.34 should give PAPER
  // 0.35 - 0.67 should give SCISSORS
  // 0.68 - 1.00 should give ROCK
  if (randomNumber < 0.35) {
    computerSelection = "PAPER";
  } else if (randomNumber < 0.68) {
    computerSelection = "SCISSORS";
  } else {
    computerSelection = "ROCK";
  }

  // Display the user's selection in the console
  console.log("User Selection:", userSelection);

  // Display the computer's selection in the console
  console.log("Computer Selection:", computerSelection);

  // Check if both the user and the computer selected the same option.
  // If they are the same, the game is a tie.
  if (userSelection === computerSelection) {
    console.log("It's a tie");

    // Check all possible situations where the user wins.
    // ROCK beats SCISSORS.
    // PAPER beats ROCK.
    // SCISSORS beats PAPER.
  } else if (
    (userSelection === "ROCK" && computerSelection === "SCISSORS") ||
    (userSelection === "PAPER" && computerSelection === "ROCK") ||
    (userSelection === "SCISSORS" && computerSelection === "PAPER")
  ) {
    console.log("User Wins");

    // If it is not a tie and the user did not win,
    // then the computer must be the winner.
  } else {
    console.log("Computer Wins");
  }
});