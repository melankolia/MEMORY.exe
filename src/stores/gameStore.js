import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'https://creative-inspiration-production.up.railway.app';
let apiTimeout = null;

const callMatchAPI = async () => {
  try {
    const response = await axios.post(`${API_URL}/counter`);
    return response.data;
  } catch (error) {
    console.error('Failed to call match API:', error);
    throw error;
  }
};

const debouncedCallAPI = (callback) => {
  if (apiTimeout) {
    clearTimeout(apiTimeout);
  }
  
  apiTimeout = setTimeout(async () => {
    try {
      const response = await callMatchAPI();
      callback(response);
    } catch (error) {
      callback({ error: 'Failed to connect to server' });
    }
    apiTimeout = null;
  }, 1000); // 500ms debounce
};

export const useGameStore = defineStore('game', {
  state: () => ({
    bestScore: 0,
    currentScore: 0,
    timeElapsed: 0,
    isPlaying: false,
    cards: [],
    flippedCards: [],
    gameScore: 0,
    lastApiResponse: null,
  }),

  getters: {
    isGameComplete: (state) => state.cards.every(card => card.matched),
    finalScore: (state) => {
      const timePenalty = Math.max(0, 1000 - state.timeElapsed * 10);
      return Math.max(0, state.gameScore + timePenalty);
    },
  },

  actions: {
    initializeGame() {
      const values = ['🍎', '🍌', '🍒', '🍇', '🍉', '🍊', '🥝', '🍓'];
      const shuffled = [...values, ...values]
        .sort(() => Math.random() - 0.5)
        .map(value => ({ value, flipped: false, matched: false }));
      
      this.cards = shuffled;
      this.currentScore = 0;
      this.gameScore = 0;
      this.timeElapsed = 0;
      this.flippedCards = [];
      this.isPlaying = false;
    },

    async flipCard(index) {
      if (this.cards[index].flipped || this.flippedCards.length === 2) return false;
      
      if (!this.isPlaying) {
        this.isPlaying = true;
      }
      
      // Flip card immediately
      this.cards[index].flipped = true;
      this.flippedCards.push(index);

      // Debounced API call
      debouncedCallAPI((response) => {
        this.lastApiResponse = response;
      });

      return true;
    },

    async checkMatch() {
      const [first, second] = this.flippedCards;
      const isMatch = this.cards[first].value === this.cards[second].value;

      if (isMatch) {
        this.cards[first].matched = true;
        this.cards[second].matched = true;
        this.currentScore += 100;
        this.gameScore += 100;
        
        if (this.isGameComplete) {
          this.isPlaying = false;
          const finalScore = this.finalScore;
          if (finalScore > this.bestScore) {
            this.bestScore = finalScore;
          }
        }
      } else {
        this.cards[first].flipped = false;
        this.cards[second].flipped = false;
        this.currentScore = Math.max(0, this.currentScore - 20);
        this.gameScore = Math.max(0, this.gameScore - 20);
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