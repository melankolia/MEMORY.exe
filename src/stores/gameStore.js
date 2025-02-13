import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
  state: () => ({
    bestScore: 0,
    currentScore: 0,
    timeElapsed: 0,
    isPlaying: false,
    cards: [],
    flippedCards: [],
  }),

  getters: {
    isGameComplete: (state) => state.cards.every(card => card.matched),
    finalScore: (state) => state.currentScore + Math.max(0, 1000 - state.timeElapsed * 10),
  },

  actions: {
    initializeGame() {
      const values = ['🍎', '🍌', '🍒', '🍇', '🍉', '🍊', '🥝', '🍓'];
      const shuffled = [...values, ...values]
        .sort(() => Math.random() - 0.5)
        .map(value => ({ value, flipped: false, matched: false }));
      
      this.cards = shuffled;
      this.currentScore = 0;
      this.timeElapsed = 0;
      this.flippedCards = [];
      this.isPlaying = false;
    },

    updateBestScore() {
      if (this.finalScore > this.bestScore) {
        this.bestScore = this.finalScore;
      }
    },

    flipCard(index) {
      if (this.cards[index].flipped || this.flippedCards.length === 2) return false;
      
      if (!this.isPlaying) {
        this.isPlaying = true;
      }
      
      this.cards[index].flipped = true;
      this.flippedCards.push(index);
      return true;
    },

    checkMatch() {
      const [first, second] = this.flippedCards;
      const isMatch = this.cards[first].value === this.cards[second].value;

      if (isMatch) {
        this.cards[first].matched = true;
        this.cards[second].matched = true;
        this.currentScore += 100;
        
        if (this.isGameComplete) {
          this.isPlaying = false;
          this.updateBestScore();
        }
      } else {
        this.cards[first].flipped = false;
        this.cards[second].flipped = false;
        this.currentScore = Math.max(0, this.currentScore - 20);
      }
      
      this.flippedCards = [];
      return isMatch;
    },

    incrementTime() {
      if (this.isPlaying) {
        this.timeElapsed++;
      }
    },
  },

  persist: {
    paths: ['bestScore']
  }
}); 