// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Game variables
    let flippedCards = [];
    let matchedPairs = 0;
    let totalMoves = 0;
    let canFlip = true;
    let gameStarted = false;
    let timerInterval;
    let seconds = 0;
    
    // Get elements
    const introPage = document.getElementById('intro-page');
    const gamePage = document.getElementById('game-page');
    const playButton = document.getElementById('play-button');
    const homeButton = document.getElementById('home-btn');
    const restartButton = document.getElementById('restart-btn');
    const gameGrid = document.getElementById('game-grid');
    const timerElement = document.getElementById('timer');
    const movesElement = document.getElementById('moves');
    const matchesElement = document.getElementById('matches');
    const hintButton = document.getElementById('hint-btn');
    
    // Audio elements
    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');
    const winnerSound = document.getElementById('winnerSound');
    
    // Card configuration
    const cardsConfig = [
        { id: 'one', img: 'nivea5.png', pairGroup: 1 },
        { id: 'five', img: 'nivea5.png', pairGroup: 1 },
        { id: 'two', img: 'nivea2.png', pairGroup: 2 },
        { id: 'six', img: 'nivea2.png', pairGroup: 2 },
        { id: 'three', img: 'nivea3.png', pairGroup: 3 },
        { id: 'four', img: 'nivea3.png', pairGroup: 3 },
        { id: 'seven', img: 'nivea7.png', pairGroup: 4 },
        { id: 'nine', img: 'nivea7.png', pairGroup: 4 },
        { id: 'eight', img: 'nivea8.png', pairGroup: 5 },
        { id: 'ten', img: 'nivea8.png', pairGroup: 5 },
        { id: 'eleven', img: 'nivea1.png', pairGroup: 6 },
        { id: 'sixteen', img: 'nivea1.png', pairGroup: 6 },
        { id: 'twelve', img: 'nivea4.png', pairGroup: 7 },
        { id: 'fifteen', img: 'nivea4.png', pairGroup: 7 },
        { id: 'thirteen', img: 'nivea6.png', pairGroup: 8 },
        { id: 'fourteen', img: 'nivea6.png', pairGroup: 8 }
    ];

    // Play button - show game page
    playButton.addEventListener('click', function() {
        introPage.classList.add('hidden');
        gamePage.style.display = 'block';
        initializeGame();
        startTimer();
    });
    
    // Home button - show intro page
    homeButton.addEventListener('click', function() {
        resetGame();
        gamePage.style.display = 'none';
        introPage.classList.remove('hidden');
    });
    
    // Restart button
    restartButton.addEventListener('click', function() {
        resetGame();
        initializeGame();
        startTimer();
    });
    
    // Hint button
    hintButton.addEventListener('click', function() {
        const allCards = document.querySelectorAll('.memory-card:not(.matched)');
        allCards.forEach(card => {
            if (!card.classList.contains('flipped')) {
                card.classList.add('flipped');
                setTimeout(() => {
                    if (!card.classList.contains('matched')) {
                        card.classList.remove('flipped');
                    }
                }, 1500);
            }
        });
    });
    
    // Initialize the game
    function initializeGame() {
        flippedCards = [];
        matchedPairs = 0;
        totalMoves = 0;
        canFlip = true;
        gameStarted = false;
        
        gameGrid.innerHTML = '';
        updateStats();
        
        const cards = [...cardsConfig];
        shuffleArray(cards);
        
        cards.forEach((cardConfig) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.cardId = cardConfig.id;
            card.dataset.pairGroup = cardConfig.pairGroup;
            card.dataset.cardImg = cardConfig.img;
            
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <img src="assets/niveafront.png" alt="Card Front">
                    </div>
                    <div class="card-back">
                        <img src="assets/${cardConfig.img}" alt="Card ${cardConfig.id}">
                    </div>
                </div>
            `;
            
            card.addEventListener('click', function() {
                if (!gameStarted) {
                    gameStarted = true;
                }
                flipCard(this);
            });
            
            gameGrid.appendChild(card);
        });
    }
    
    // Flip card function
    function flipCard(card) {
        if (card.classList.contains('flipped') || 
            card.classList.contains('matched') || 
            flippedCards.length >= 2 || 
            !canFlip) {
            return;
        }
        
        card.classList.add('flipped');
        flippedCards.push(card);
        
        if (flippedCards.length === 2) {
            canFlip = false;
            totalMoves++;
            updateStats();
            
            const card1 = flippedCards[0];
            const card2 = flippedCards[1];
            
            const card1Group = card1.dataset.pairGroup;
            const card2Group = card2.dataset.pairGroup;
            const card1Img = card1.dataset.cardImg;
            const card2Img = card2.dataset.cardImg;
            const card1Id = card1.dataset.cardId;
            const card2Id = card2.dataset.cardId;
            
            const isMatch = (card1Group === card2Group) && 
                          (card1Img === card2Img) && 
                          (card1Id !== card2Id);
            
            if (isMatch) {
                setTimeout(() => {
                    card1.classList.add('matched');
                    card2.classList.add('matched');
                    matchedPairs++;
                    updateStats();
                    
                    // Play correct match sound
                    correctSound.currentTime = 0;
                    correctSound.play();
                    
                    flippedCards = [];
                    canFlip = true;
                    
                    if (matchedPairs === 8) {
                        endGame();
                    }
                }, 500);
            } else {
                // Play wrong match sound immediately
                wrongSound.currentTime = 0;
                wrongSound.play();
                
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    
                    flippedCards = [];
                    canFlip = true;
                }, 1000);
            }
        }
    }
    
    // Update game stats
    function updateStats() {
        movesElement.textContent = totalMoves;
        matchesElement.textContent = `${matchedPairs}/8`;
        
        const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        timerElement.textContent = `${minutes}:${secs}`;
    }
    
    // Start timer
    function startTimer() {
        seconds = 0;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (gameStarted) {
                seconds++;
                updateStats();
            }
        }, 1000);
    }
    
    // End game - UPDATED to show modal
    function endGame() {
        clearInterval(timerInterval);
        gameStarted = false;
        
        setTimeout(() => {
            const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            const timeString = `${minutes}:${secs}`;
            
            // Play winner sound
            winnerSound.currentTime = 0;
            winnerSound.play();
            
            showVictoryModal(timeString, totalMoves, matchedPairs);
        }, 500);
    }
    
    // Reset game
    function resetGame() {
        clearInterval(timerInterval);
        seconds = 0;
        flippedCards = [];
        matchedPairs = 0;
        totalMoves = 0;
        canFlip = true;
        gameStarted = false;
        updateStats();
    }
    
    // Shuffle array function
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Make functions globally accessible
    window.initializeGame = initializeGame;
    window.startTimer = startTimer;
    window.resetGame = resetGame;
});

// Victory Modal Functions
function showVictoryModal(time, moves, pairs) {
    const overlay = document.getElementById('victoryModalOverlay');
    const timeEl = document.getElementById('modalFinalTime');
    const movesEl = document.getElementById('modalMoves');
    const pairsEl = document.getElementById('modalPairs');

    timeEl.textContent = time;
    movesEl.textContent = moves;
    pairsEl.textContent = `${pairs}/8`;

    overlay.classList.add('show');
}

function hideVictoryModal() {
    document.getElementById('victoryModalOverlay').classList.remove('show');
}

function handlePlayAgain() {
    hideVictoryModal();
    window.resetGame();
    window.initializeGame();
    window.startTimer();
}

function handleGoHome() {
    hideVictoryModal();
    const gamePage = document.getElementById('game-page');
    const introPage = document.getElementById('intro-page');
    gamePage.style.display = 'none';
    introPage.classList.remove('hidden');
    window.resetGame();
}