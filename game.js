const wordLists = {
    easy: ['cat', 'dog', 'run', 'jump', 'play', 'fun', 'hat', 'ball', 'skip', 'hop', 'sing', 'dance'],
    medium: ['dragon', 'monkey', 'pencil', 'purple', 'castle', 'forest', 'window', 'summer', 'winter', 'stream'],
    hard: ['butterfly', 'chocolate', 'adventure', 'dangerous', 'beautiful', 'mysterious', 'incredible', 'fascinating', 'wonderful', 'extraordinary']
};

const difficultySettings = {
    easy: { minSpeed: 0.3, maxSpeed: 0.8, spawnRate: 2500 },
    medium: { minSpeed: 0.5, maxSpeed: 1.2, spawnRate: 2000 },
    hard: { minSpeed: 0.8, maxSpeed: 1.8, spawnRate: 1500 }
};

class TypingGame {
    constructor() {
        this.score = 0;
        this.lives = 3;
        this.activeWords = [];
        this.currentDifficulty = 'easy';
        this.isPlaying = false;
        this.menuIndex = 0;
        this.difficultyIndex = 0;
        this.difficulties = ['easy', 'medium', 'hard'];
        this.initializeControls();
        this.spawnInterval = null;
        this.animationInterval = null;
        this.addKeyboardControls();
        this.usedWords = new Set();
        this.gameOverIndex = 0;
    }

    initializeControls() {
        document.getElementById('up').addEventListener('click', () => this.navigateMenu(-1));
        document.getElementById('down').addEventListener('click', () => this.navigateMenu(1));
        document.getElementById('select-btn').addEventListener('click', () => {
            if (document.querySelector('.game-over')) {
                this.handleGameOverSelection();
            } else {
                this.selectMenuItem();
            }
        });
        document.getElementById('back-btn').addEventListener('click', () => this.goBack());
        document.getElementById('word-input').addEventListener('input', (e) => this.checkWord(e.target.value));
        document.getElementById('contact-btn').addEventListener('click', () => this.showContactForm());
        document.getElementById('collaboration-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    addKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                this.navigateMenu(-1);
            } else if (e.key === 'ArrowDown') {
                this.navigateMenu(1);
            } else if (e.key === 'Enter') {
                this.selectMenuItem();
            } else if (e.key === 'Escape') {
                this.goBack();
            }
        });
    }

    navigateMenu(direction) {
        if (document.querySelector('.game-over')) {
            const menuItems = document.querySelectorAll('.game-over .menu-item');
            menuItems[this.gameOverIndex].classList.remove('selected');
            this.gameOverIndex = (this.gameOverIndex + direction + menuItems.length) % menuItems.length;
            menuItems[this.gameOverIndex].classList.add('selected');
            return;
        }

        if (document.getElementById('difficulty-select').classList.contains('active')) {
            this.navigateDifficulty(direction);
        } else {
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems[this.menuIndex].classList.remove('selected');
            this.menuIndex = (this.menuIndex + direction + menuItems.length) % menuItems.length;
            menuItems[this.menuIndex].classList.add('selected');
        }
    }

    navigateDifficulty(direction) {
        const difficultyItems = document.getElementById('difficulty-select').querySelectorAll('.menu-item');
        difficultyItems[this.difficultyIndex].classList.remove('selected');
        this.difficultyIndex = (this.difficultyIndex + direction + this.difficulties.length) % this.difficulties.length;
        difficultyItems[this.difficultyIndex].classList.add('selected');
    }

    selectMenuItem() {
        if (document.getElementById('difficulty-select').classList.contains('active')) {
            this.currentDifficulty = this.difficulties[this.difficultyIndex];
            this.goBack();
            return;
        }

        const menuItems = document.querySelectorAll('#menu .menu-item');
        const selected = menuItems[this.menuIndex].textContent;
        
        if (selected === 'Start Game') {
            this.startGame();
        } else if (selected === 'High Scores') {
            this.showHighScores();
        } else if (selected === 'Difficulty') {
            this.showDifficultySelection();
        }
    }

    startGame() {
        const gameArea = document.getElementById('game-area');
        gameArea.classList.add('loading');
        
        // Simulate loading game assets
        setTimeout(() => {
            gameArea.classList.remove('loading');
            document.getElementById('menu').classList.remove('active');
            document.getElementById('menu').classList.add('hidden');
            document.getElementById('game-area').classList.remove('hidden');
            this.isPlaying = true;
            this.score = 0;
            this.lives = 3;
            document.getElementById('score').textContent = `Score: ${this.score}`;
            document.getElementById('lives').textContent = `Lives: ${this.lives}`;
            document.getElementById('word-input').focus();
            this.usedWords.clear();
            this.spawnWords();
        }, 1000);
    }

    spawnWords() {
        const settings = difficultySettings[this.currentDifficulty];
        this.spawnInterval = setInterval(() => {
            if (this.isPlaying) {
                const word = this.getRandomWord();
                const wordElement = document.createElement('div');
                wordElement.className = 'word';
                wordElement.textContent = word;
                wordElement.style.left = `${Math.random() * 80}%`;
                wordElement.style.top = '0';
                
                document.getElementById('words-container').appendChild(wordElement);
                this.activeWords.push({
                    element: wordElement,
                    word: word,
                    speed: this.getRandomSpeed()
                });
            }
        }, settings.spawnRate);

        this.startWordAnimation();
    }

    startWordAnimation() {
        this.animationInterval = setInterval(() => {
            this.activeWords.forEach((wordObj, index) => {
                const currentTop = parseFloat(wordObj.element.style.top);
                wordObj.element.style.top = `${currentTop + wordObj.speed}px`;

                if (currentTop > 250) {
                    this.lives--;
                    document.getElementById('lives').textContent = `Lives: ${this.lives}`;
                    wordObj.element.remove();
                    this.activeWords.splice(index, 1);

                    if (this.lives <= 0) {
                        this.gameOver();
                    }
                }
            });
        }, 50);
    }

    checkWord(input) {
        const matchingWordIndex = this.activeWords.findIndex(
            wordObj => wordObj.word.toLowerCase() === input.toLowerCase()
        );

        if (matchingWordIndex !== -1) {
            const wordObj = this.activeWords[matchingWordIndex];
            wordObj.element.remove();
            this.activeWords.splice(matchingWordIndex, 1);
            this.score += wordObj.word.length;
            document.getElementById('score').textContent = `Score: ${this.score}`;
            document.getElementById('word-input').value = '';
        }
    }

    getRandomWord() {
        const words = wordLists[this.currentDifficulty];
        const availableWords = words.filter(word => !this.usedWords.has(word));
        
        // Reset used words if all words have been used
        if (availableWords.length === 0) {
            this.usedWords.clear();
            return words[Math.floor(Math.random() * words.length)];
        }
        
        const word = availableWords[Math.floor(Math.random() * availableWords.length)];
        this.usedWords.add(word);
        return word;
    }

    getRandomSpeed() {
        const settings = difficultySettings[this.currentDifficulty];
        return settings.minSpeed + Math.random() * (settings.maxSpeed - settings.minSpeed);
    }

    gameOver() {
        this.isPlaying = false;
        clearInterval(this.spawnInterval);
        clearInterval(this.animationInterval);
        this.usedWords.clear();
        this.gameOverIndex = 0;
        
        const gameArea = document.getElementById('game-area');
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over';
        gameOverScreen.innerHTML = `
            <h2>Game Over!</h2>
            <p>Final Score: ${this.score}</p>
            <div class="menu-item selected">Play Again</div>
            <div class="menu-item">Main Menu</div>
        `;
        
        gameArea.appendChild(gameOverScreen);
        
        this.saveScore();
    }

    handleGameOverSelection() {
        const menuItems = document.querySelectorAll('.game-over .menu-item');
        if (menuItems[this.gameOverIndex].textContent === 'Play Again') {
            location.reload();
        } else {
            this.cleanupGame();
            this.goBack();
            document.querySelector('.game-over').remove();
        }
    }

    cleanupGame() {
        // Clear all game state
        this.isPlaying = false;
        this.score = 0;
        this.lives = 3;
        this.usedWords.clear();
        this.activeWords = [];
        
        // Clear intervals
        clearInterval(this.spawnInterval);
        clearInterval(this.animationInterval);
        
        // Clear DOM elements
        const wordsContainer = document.getElementById('words-container');
        while (wordsContainer.firstChild) {
            wordsContainer.removeChild(wordsContainer.firstChild);
        }
        
        // Reset and hide input
        const input = document.getElementById('word-input');
        input.value = '';
        
        // Reset stats display
        document.getElementById('score').textContent = 'Score: 0';
        document.getElementById('lives').textContent = 'Lives: 3';
        
        // Hide game area completely
        document.getElementById('game-area').classList.add('hidden');
        
        // Remove any remaining game over screen
        const gameOverScreen = document.querySelector('.game-over');
        if (gameOverScreen) {
            gameOverScreen.remove();
        }
    }

    goBack() {
        this.cleanupGame();
        
        // Hide all sections first
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        
        // Show and activate menu
        const menu = document.getElementById('menu');
        menu.classList.remove('hidden');
        menu.classList.add('active');
        
        // Ensure proper menu item is selected
        const menuItems = menu.querySelectorAll('.menu-item');
        menuItems.forEach(item => item.classList.remove('selected'));
        menuItems[0].classList.add('selected');
        this.menuIndex = 0;
    }

    saveScore() {
        const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        highScores.push(this.score);
        highScores.sort((a, b) => b - a);
        localStorage.setItem('highScores', JSON.stringify(highScores.slice(0, 5)));
    }

    showHighScores() {
        const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        const highScoresList = document.getElementById('high-scores');
        highScoresList.innerHTML = '<h2>High Scores</h2>' + 
            highScores.map((score, index) => `<div>${index + 1}. ${score}</div>`).join('');
        
        document.getElementById('menu').classList.add('hidden');
        highScoresList.classList.remove('hidden');
    }

    showDifficultySelection() {
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('menu').classList.remove('active');
        const difficultyScreen = document.getElementById('difficulty-select');
        difficultyScreen.classList.remove('hidden');
        difficultyScreen.classList.add('active');
        
        // Highlight current difficulty
        const difficultyItems = difficultyScreen.querySelectorAll('.menu-item');
        difficultyItems.forEach(item => item.classList.remove('selected'));
        this.difficultyIndex = this.difficulties.indexOf(this.currentDifficulty);
        difficultyItems[this.difficultyIndex].classList.add('selected');
    }

    showContactForm() {
        // Hide all other sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        
        // Show and animate contact form
        const contactForm = document.getElementById('contact-form');
        contactForm.classList.remove('hidden');
        // Small delay to trigger animation
        setTimeout(() => {
            contactForm.classList.add('active');
        }, 50);
        
        // Focus on first input
        document.getElementById('name').focus();
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn');
        
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            try {
                alert('Thank you for your message! I will get back to you soon.');
                form.reset();
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                this.goBack();
            } catch (error) {
                this.handleError(error);
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        }, 1500);
    }

    handleError(error) {
        console.error('Game Error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Oops! Something went wrong. Please try again.';
        document.querySelector('.screen').appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 3000);
    }
}

// Initialize game
const game = new TypingGame();
