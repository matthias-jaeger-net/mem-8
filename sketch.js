let lives = 8;
let totalPairs = 8;
let values = [];
let flipped = [];
let matchedCount = 0;
let canClick = true;
let grid;
let flipSound, matchSound, winSound, restartSound, atmoSound, notMatchSound;
let livesContainer, winsContainer, coinContainer, gameContainer;
let winCount = 1;

function preload() {
  flipSound = loadSound("sounds/swipe-236674.mp3");
  matchSound = loadSound("sounds/button-pressed-38129.mp3");
  winSound = loadSound("sounds/success-1-6297.mp3");
  restartSound = loadSound("sounds/ui-sound-270349.mp3");
  notMatchSound = loadSound("sounds/error-8-206492.mp3");
}

function setup() {
  //randomSeed(1);
  noCanvas();
  snackBarontainer = select("#snackBarontainer")
  gameContainer = select("#game");
  livesContainer = select("#livesContainer");
  winsContainer = select("#winsContainer");
  coinContainer = select("#coinContainer");
  grid = select("#gameGrid");
  createBoard();
}

function draw() {
  winsContainer.html("✦ " + winCount);
  livesContainer.html("");

  let str = "";

  if (lives > 5) {
    str = "♥︎ " + lives;
  } else {
    for (let i = 1; i <= lives; i++) {
      str += "♥︎ ";
    }
  }
  livesContainer.html(str);

  // Clear any previous state first
  gameContainer.removeClass("warning");
  gameContainer.removeClass("danger");
  
  print(lives);
  if (lives < 4 && lives >= 2) {
    gameContainer.addClass("warning");
  } else if (lives < 2) {
    gameContainer.removeClass("warning");
    gameContainer.addClass("danger");
  }
}

function createCard(value) {
  const container = createDiv();
  container.addClass("card-container");

  const card = createDiv();
  card.addClass("card");
  card.attribute("data-value", value);

  const front = createDiv();
  front.addClass("card-face front");

  const back = createDiv();
  back.addClass("card-face back");
  back.html(value); // Set content using html()

  card.child(front);
  card.child(back);
  container.child(card);

  card.mousePressed(() => handleFlip(card));

  // Append the container to the main grid
  if (grid) {
    grid.child(container);
  }
}

function createBoard() {
  // Clear previous grid content if any
  grid.html(""); // Clear grid using html('')

  // Reset state variables
  values = [];
  flipped = [];
  matchedCount = 0;
  canClick = true;

  // 1. Generate pairs of values
  for (let i = 0; i < totalPairs; i++) {
    values.push(i);
    values.push(i);
  }

  // 2. Shuffle the values (Fisher-Yates algorithm)
  for (let i = values.length - 1; i > 0; i--) {
    const j = floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  // 3. Create card elements dynamically using p5.dom
  values.forEach((val) => {
    createCard(val);
  });
}

function handleFlip(card) {
  // Early exit if card is matched or already flipped
  if (card.hasClass("matched") || card.hasClass("flipped") || !canClick) return;

  // Prevent clicking the same card twice
  if (flipped.includes(card)) return;

  // Prevent clicking matched cards
  if (card.parent().classList.contains("matched")) return;

  card.addClass("flipped");
  flipSound.play();

  flipped.push(card);

  if (flipped.length === 2) {
    canClick = false; // temporarily disable clicks

    const [a, b] = flipped;
    const aValue = a.elt.dataset.value;
    const bValue = b.elt.dataset.value;

    if (aValue === bValue) {
      matchSound.play();
      triggerFeedback("match");
      a.addClass("matched");
      b.addClass("matched");

      flipped = [];
      canClick = true;
      matchedCount++;
      lives += 1;

      if (matchedCount === totalPairs) {
        setTimeout(() => {
          winSound.play();
          winCount++;
          restartGame(lives); // Keep remaining lives
        }, 2000);
      }
    } else {
      setTimeout(() => {
        notMatchSound.play();
        if (lives == 1) {
          winCount = 1;
          triggerRestartEffect();
          restartGame(8);
          restartSound.play();
          return;
        }
        lives--;
        triggerFeedback("bounce");

        a.removeClass("flipped");
        b.removeClass("flipped");
        flipped = [];
        canClick = true;
      }, 1000);
    }
  }
}

function restartGame(newLives) {
  lives = newLives; // Properly update global lives
  createBoard(); // Reset the board
}

function triggerRestartEffect() {
  const wrapper = select("#gameWrapper");
  if (!wrapper) return;

  wrapper.addClass("restart");
  setTimeout(() => {
    wrapper.removeClass("restart");
  }, 600); // Match animation time
}

function triggerFeedback(type) {
  const wrapper = select("#gameWrapper");
  if (!wrapper) return;

  const className = type === "match" ? "bounce" : "shake";
  wrapper.addClass(className);

  setTimeout(
    () => {
      wrapper.removeClass(className);
    },
    type === "match" ? 500 : 400
  ); // Match duration of each animation
}
