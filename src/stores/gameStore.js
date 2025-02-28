import { defineStore } from "pinia";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { API_URL } from "@/constants";

let apiTimeout = null;

const updateScoreOnChain = async (secureId, score) => {
  try {
    const response = await axios.post(`${API_URL}/score`, {
      secureId,
      score,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to call score API:", error);
    return { error: error.message || "Failed to update score" };
  }
};

const debouncedCallAPI = (store, callback) => {
  if (apiTimeout) {
    clearTimeout(apiTimeout);
  }

  apiTimeout = setTimeout(async () => {
    try {
      const response = await updateScoreOnChain(store.secureId, store.currentScore);
      if (response.error) {
        callback({ error: response.error });
      } else {
        callback(response || { message: "Score updated" });
      }
    } catch (error) {
      callback({ error: "Failed to connect to server" });
    }
    apiTimeout = null;
  }, 1000);
};

export const useGameStore = defineStore("game", {
  state: () => {
    const secureId = uuidv4();

    return {
      bestScore: 0,
      currentScore: 0,
      timeElapsed: 0,
      isPlaying: false,
      cards: [],
      flippedCards: [],
      gameScore: 0,
      lastApiResponse: null,
      secureId,
      walletAddress: null,
      finalGameScore: 0,
    };
  },

  getters: {
    isGameComplete: (state) => state.cards.every((card) => card.matched),
    finalScore: (state) => state.finalGameScore,
  },

  actions: {
    initializeGame() {
      const values = ["🍎", "🍌", "🍒", "🍇", "🍉", "🍊", "🥝", "🍓"];
      const shuffled = [...values, ...values]
        .sort(() => Math.random() - 0.5)
        .map((value) => ({ value, flipped: false, matched: false }));

      this.cards = shuffled;
      this.currentScore = 0;
      this.gameScore = 0;
      this.timeElapsed = 0;
      this.flippedCards = [];
      this.isPlaying = false;
      this.finalGameScore = 0;
    },

    calculateFinalScore() {
      const timeBonus = Math.max(0, 1000 - this.timeElapsed * 10);
      this.finalGameScore = this.gameScore + timeBonus;
      
      if (this.finalGameScore > this.bestScore) {
        this.bestScore = this.finalGameScore;
      }
    },

    async flipCard(index) {
      if (index < 0 || index >= this.cards.length) {
        console.error("Invalid card index:", index);
        return false;
      }

      if (
        this.cards[index].flipped ||
        this.cards[index].matched ||
        this.flippedCards.length === 2
      ) {
        return false;
      }

      if (!this.isPlaying) {
        this.isPlaying = true;
      }

      this.cards[index].flipped = true;
      this.flippedCards.push(index);

      debouncedCallAPI(this, (response) => {
        this.lastApiResponse = response;
      });

      return true;
    },

    checkMatch() {
      if (this.flippedCards.length !== 2) {
        return false;
      }

      const [first, second] = this.flippedCards;

      if (!this.cards[first] || !this.cards[second]) {
        console.error("Invalid card indices:", first, second);
        this.flippedCards = [];
        return false;
      }

      const isMatch = this.cards[first].value === this.cards[second].value;

      if (isMatch) {
        this.cards[first].matched = true;
        this.cards[second].matched = true;
        this.currentScore += 100;
        this.gameScore += 100;
      } else {
        this.cards[first].flipped = false;
        this.cards[second].flipped = false;
        this.currentScore = Math.max(0, this.currentScore - 20);
        this.gameScore = Math.max(0, this.gameScore - 20);
      }

      this.updateScore();

      debouncedCallAPI(this, (response) => {
        this.lastApiResponse = response;
      });

      this.flippedCards = [];

      if (this.isGameComplete) {
        this.isPlaying = false;
        this.calculateFinalScore();
      }

      return isMatch;
    },

    incrementTime() {
      if (this.isPlaying) {
        this.timeElapsed++;
      }
    },

    updatePlayerAddress(address) {
      this.walletAddress = address;
    },

    resetPlayerAddress() {
      this.walletAddress = null;
    },

    updateScore() {
      if (this.isGameComplete) {
        this.isPlaying = false;
        this.calculateFinalScore();
      }
    },

    async saveScore() {
      if (!this.walletAddress || !this.isGameComplete) {
        throw new Error(
          "Cannot save score: wallet not connected or game not complete"
        );
      }

      try {
        const scoreResponse = await axios.post(`${API_URL}/score`, {
          secureId: this.secureId,
          score: this.finalGameScore,
        });

        if (scoreResponse.error) {
          throw new Error(scoreResponse.error);
        }

        const claimResponse = await axios.post(`${API_URL}/claim-score`, {
          secureId: this.secureId,
          player: this.walletAddress,
        });

        this.secureId = uuidv4();

        this.currentScore = 0;
        this.gameScore = 0;
        this.timeElapsed = 0;
        this.isPlaying = false;

        this.lastApiResponse = {
          transactionHash: claimResponse.data.transactionHash || claimResponse.data.hash,
          message: "Score claimed successfully!",
        };

        return claimResponse.data;
      } catch (error) {
        console.error("Failed to save score:", error);
        throw new Error(
          error.response?.data?.message || "Failed to save score"
        );
      }
    },
  },

  persist: {
    paths: ["bestScore"],
  },
});
