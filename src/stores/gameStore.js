import { defineStore } from "pinia";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { API_URL } from "@/constants";

let apiTimeout = null;

const updateScore = async (secureId, score) => {
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
      const response = await updateScore(store.secureId, store.currentScore);
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
    };
  },

  getters: {
    isGameComplete: (state) => state.cards.every((card) => card.matched),
    finalScore: (state) => {
      const timePenalty = Math.max(0, 1000 - state.timeElapsed * 10);
      return Math.max(0, state.gameScore + timePenalty);
    },
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
    },

    async flipCard(index) {
      // Validate index
      if (index < 0 || index >= this.cards.length) {
        console.error("Invalid card index:", index);
        return false;
      }

      // Check if card can be flipped
      if (
        this.cards[index].flipped ||
        this.cards[index].matched ||
        this.flippedCards.length === 2
      ) {
        return false;
      }

      // Start game on first flip
      if (!this.isPlaying) {
        this.isPlaying = true;
      }

      // Flip card
      this.cards[index].flipped = true;
      this.flippedCards.push(index);

      // Update score via API
      debouncedCallAPI(this, (response) => {
        this.lastApiResponse = response;
      });

      return true;
    },

    checkMatch() {
      // Guard against invalid flipped cards state
      if (this.flippedCards.length !== 2) {
        return false;
      }

      const [first, second] = this.flippedCards;

      // Validate card indices
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

      // Update local score state
      this.updateScore();

      // Debounce the API call
      debouncedCallAPI(this, (response) => {
        this.lastApiResponse = response;
      });

      this.flippedCards = [];
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
        const finalScore = this.finalScore;
        if (finalScore > this.bestScore) {
          this.bestScore = finalScore;
        }
      }
    },

    async saveScore() {
      if (!this.walletAddress || !this.isGameComplete) {
        throw new Error(
          "Cannot save score: wallet not connected or game not complete"
        );
      }

      try {
        const response = await axios.post(`${API_URL}/claim-score`, {
          secureId: this.secureId,
          player: this.walletAddress,
        });

        // Update last API response for the snackbar
        this.lastApiResponse = {
          transactionHash: response.data.transactionHash || response.data.hash,
          message: "Score claimed successfully!",
        };

        return response.data;
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
