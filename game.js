const wordLists = {
    easy: ['cat', 'dog', 'run', 'jump', 'play', 'fun'],
    medium: ['dragon', 'monkey', 'pencil', 'purple', 'castle'],
    hard: ['butterfly', 'chocolate', 'adventure', 'dangerous', 'beautiful']
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
    }

    initializeControls() {
        document.getElementById('up').addEventListener('click', () => this.navigateMenu(-1));
        document.getElementById('down').addEventListener('click', () => this.navigateMenu(1));
        document.getElementById('select-btn').addEventListener('click', () => this.selectMenuItem());
        document.getElementById('back-btn').addEventListener('click', () => this.goBack());
        document.getElementById('word-input').addEventListener('input', (e) => this.checkWord(e.target.value));
    }

    navigateMenu(direction) {
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
        document.getElementById('menu').classList.remove('active');
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('game-area').classList.remove('hidden');
        this.isPlaying = true;
        this.spawnWords();
    }

    spawnWords() {
        setInterval(() => {
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
        }, 2000);

        this.startWordAnimation();
    }

    startWordAnimation() {
        setInterval(() => {
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
        return words[Math.floor(Math.random() * words.length)];
    }

    getRandomSpeed() {
        return 0.5 + Math.random() * 1.5;
    }

    gameOver() {
        this.isPlaying = false;
        alert(`Game Over! Final Score: ${this.score}`);
        this.saveScore();
        location.reload();
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

    goBack() {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        
        document.getElementById('menu').classList.remove('hidden');
        document.getElementById('menu').classList.add('active');
        
        // Reset game if it's running
        if (this.isPlaying) {
            this.isPlaying = false;
            this.score = 0;
            this.lives = 3;
            this.activeWords.forEach(wordObj => wordObj.element.remove());
            this.activeWords = [];
        }
    }
}

// Initialize game
const game = new TypingGame();
