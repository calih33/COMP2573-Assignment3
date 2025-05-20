// Global variables 
var timer = null;
var matched = 0;
var flipped = 0;
var score = 0;
var flippedChances = false;
var timeLimit = 60;
var cardCount = 0;
var firstCard = null;
var secondCard = null;

// Update stats
function updateStats() {
  document.getElementById('total').innerText = 'Total of Pairs: ' + cardCount / 2;
  document.getElementById('correct').innerText = 'Matches: ' + matched;
  document.getElementById('remaining').innerText = 'Remaining: ' + (cardCount / 2 - matched);
  document.getElementById('flips').innerText = 'Clicks: ' + flipped;
  document.getElementById('score').innerText = 'Score: ' + score;
}

// Power-up
function startChanceTime() {
  if (flippedChances) return;
  flippedChances = true;

  var cards = document.querySelectorAll('.card:not(.matched)');
  for (var i = 0; i < cards.length; i++) {
    cards[i].classList.add('flip');
  }

  setTimeout(function() {
    for (var j = 0; j < cards.length; j++) {
      cards[j].classList.remove('flip');
    }
    flippedChances = false;
    document.getElementById('powerUpBtn').style.display = 'none';
  }, 1000);
}

// Start the timer
function startTimer() {
  var startTime = Date.now();

  timer = setInterval(function() {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    var remaining = timeLimit - elapsed;

    document.getElementById('timer').innerText = 'Time: ' + elapsed + '/' + timeLimit + ', Remaining: ' + remaining;

    if (elapsed === 3) {
      document.getElementById('powerUpBtn').style.display = 'inline-block';
    }

    if (elapsed >= timeLimit) {
      clearInterval(timer);
        document.getElementById('finalScore').textContent = score;
        var loseModal = new bootstrap.Modal(document.getElementById('loseModal'));
        loseModal.show();
    }
  }, 1000);
}

// Reset the game
function resetGame() {
  clearInterval(timer);
  matched = 0;
  flipped = 0;
  cardCount = 0;
  score = 0;
  updateStats();
  document.getElementById('game_display').innerHTML = '';
  location.reload();
}

// Start a new game
function startGame() {
  if (timer) clearInterval(timer);

  matched = 0;
  flipped = 0;
  score = 0;
  firstCard = null;
  secondCard = null;

  // Set difficulty
  var difficulty = document.getElementById('difficulty').value;
  var columnCount;

  if (difficulty === 'easy') {
    cardCount = 6;
    columnCount = 3;
    timeLimit = cardCount * 5;
  } else if (difficulty === 'normal') {
    cardCount = 12;
    columnCount = 4;
    timeLimit = cardCount * 5;
  } else if (difficulty === 'hard') {
    cardCount = 24;
    columnCount = 6;
    timeLimit = cardCount * 5;
  }

  startTimer();
  updateStats();

  // Setup game 
  var gameDisplay = document.getElementById('game_display');
  gameDisplay.style.display = 'grid';
  gameDisplay.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
  gameDisplay.innerHTML = '';

  // Generate Pokémon pairs
  var randomPokemonIds = [];
  for (var i = 0; i < cardCount / 2; i++) {
    var randomId = Math.floor(Math.random() * 810) + 1;
    randomPokemonIds.push(randomId);
    randomPokemonIds.push(randomId);
  }

  // shuffle cards
  randomPokemonIds.sort(function() {
    return 0.5 - Math.random();
  });

  // create cards
  for (var i = 0; i < randomPokemonIds.length; i++) {
    var card = document.createElement('div');
    card.className = 'card';

    var frontFace = document.createElement('img');
    frontFace.className = 'front_face';
    frontFace.alt = 'Pokemon';

    var backFace = document.createElement('img');
    backFace.className = 'back_face';
    backFace.src = 'back.webp';
    backFace.alt = 'Card Back';

    card.appendChild(frontFace);
    card.appendChild(backFace);

    gameDisplay.appendChild(card);
  }

  var frontFaces = gameDisplay.querySelectorAll('.front_face');

  // fetch Pokémon images
  for (let i = 0; i < randomPokemonIds.length; i++) {
    (function(i) {
      fetch('https://pokeapi.co/api/v2/pokemon/' + randomPokemonIds[i] + '/')
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          frontFaces[i].src = data.sprites.front_default;
        })
        .catch(function() {
          frontFaces[i].src = ''; // Fallback on error
        });
    })(i);
  }

  // event listeners to cards
  var cards = gameDisplay.querySelectorAll('.card');
  for (var n = 0; n < cards.length; n++) {
cards[n].addEventListener('click', function () {
  if (
    this.classList.contains('matched') || 
    this.classList.contains('flip') || 
    flippedChances || 
    firstCard && secondCard || 
    firstCard === this
  ) {
    return;
  }

  this.classList.add('flip');
  flipped++;
  updateStats();

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;

  var firstImg = firstCard.querySelector('.front_face').src;
  var secondImg = secondCard.querySelector('.front_face').src;

  if (firstImg === secondImg) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matched++;
    score++;
    updateStats();

    firstCard = null;
    secondCard = null;

    if (matched === cardCount / 2) {
      clearInterval(timer);
      setTimeout(function () {
        document.getElementById('finalScore').textContent = score;
        var winModal = new bootstrap.Modal(document.getElementById('winModal'));
        winModal.show();
      }, 500);
    }
  } else {
    setTimeout(function () {
      firstCard.classList.remove('flip');
      secondCard.classList.remove('flip');
      firstCard = null;
      secondCard = null;
    }, 800);
  }
});

  }
}

// game themes
function setTheme(theme) {
  document.body.classList.remove('light-theme', 'dark-theme', 'speed-theme');
  document.getElementById('game_display').classList.remove('light-theme', 'dark-theme', 'speed-theme');

  if (theme === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('game_display').classList.add('light-theme');
  } else if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    document.getElementById('game_display').classList.add('dark-theme');
  }
}

// eventlisteners for buttons
document.getElementById('lightBtn').onclick = function() {
  setTheme('light');
};
document.getElementById('playAgainBtn').onclick = function () {
  startGame();
};

document.getElementById('darkBtn').onclick = function() {
  setTheme('dark');
};
document.getElementById('startBtn').onclick = startGame;
document.getElementById('resetBtn').onclick = resetGame;
document.getElementById('powerUpBtn').onclick = startChanceTime;
document.getElementById('powerUpBtn').style.display = 'none';
