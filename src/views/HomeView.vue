<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-purple-200 p-4"
  >
    <MusicPlayer />

    <div class="logo-container mb-4">
      <div class="game-logo">
        <div class="title-wrapper">
          <div class="title-line">
            <span class="brain">🧠</span>
            <span class="memory-text">MEMORY.exe</span>
            <span class="brain flip">🧠</span>
          </div>
          <div class="subtitle">
            <span class="loading-text">LOADING CARDS</span>
            <div class="loading-dots">
              <span class="dot">.</span>
              <span class="dot">.</span>
              <span class="dot">.</span>
            </div>
            <span class="system-text">[SYSTEM32]</span>
          </div>
          <div class="meme-overlay">
            <span class="stonks">??</span>
            <span class="wow">wow</span>
            <span class="such">such memory</span>
            <span class="very">very cards</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add this wrapper div -->
    <div class="relative inline-block">
      <!-- Game Stats Panel -->
      <div class="game-stats-panel">
        <div class="stat-box">
          <span class="stat-label">Score</span>
          <span class="stat-value">{{ store.currentScore }}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Time</span>
          <span class="stat-value">{{ formatTime(store.timeElapsed) }}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Best</span>
          <span class="stat-value">{{ store.bestScore }}</span>
        </div>
        <button
          @click="showLeaderboard = true"
          class="stat-box hover:bg-purple-100 transition-colors cursor-pointer"
        >
          <span class="stat-label">Leaderboard</span>
          <span class="stat-value">🏆</span>
        </button>
      </div>

      <!-- Game container -->
      <div class="relative">
        <!-- Add TransitionGroup here, before the grid -->
        <TransitionGroup name="fade" class="pointer-events-none">
          <div
            v-for="popup in scorePopups"
            :key="popup.id"
            class="score-popup fixed text-2xl font-bold"
            :class="popup.type"
            :style="{
              left: `${popup.x}px`,
              top: `${popup.y}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 50,
            }"
          >
            {{ popup.text }}
          </div>
        </TransitionGroup>

        <div
          class="grid grid-cols-4 gap-4 p-4 bg-purple-900/20 rounded-xl backdrop-blur-sm"
        >
          <MemoryCard
            v-for="(card, index) in store.cards"
            :key="index"
            :value="card.value"
            :flipped="card.flipped"
            :matched="card.matched"
            :show-effect="cardEffects[index]"
            :index="index"
            @flip="flipCard(index)"
          />

          <!-- Game over overlay -->
          <div
            v-if="store.isGameComplete"
            class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/30 backdrop-blur-sm rounded-xl"
          >
            <!-- Final Score Display -->
            <div class="text-center mb-2">
              <h3 class="text-xl font-bold text-purple-100">Final Score</h3>
              <p
                class="text-3xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent"
              >
                {{ store.finalScore }}
              </p>
            </div>

            <!-- Save Score Button (shows only when wallet is connected) -->
            <button
              v-if="store.walletAddress && !scoreSaved"
              @click="handleSaveScore"
              :disabled="isSaving"
              class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 mb-2"
            >
              {{ isSaving ? "Saving..." : "Save Score" }}
            </button>

            <!-- Connect Wallet Button (shows when wallet is not connected) -->
            <button
              v-if="!store.walletAddress && !scoreSaved"
              @click="showLeaderboard = true"
              class="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all duration-200 mb-2"
            >
              Connect Wallet to Save Score
            </button>

            <!-- Play Again Button -->
            <button @click="restartGame" class="restart-button">
              <div class="button-wrapper">
                <span class="button-content">
                  <span class="restart-icon">↺</span>
                  <span class="button-text">Play Again</span>
                </span>
                <div class="button-particles">
                  <span></span><span></span><span></span><span></span>
                </div>
                <div class="button-glow"></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <Snackbar
      v-model:show="showSnackbar"
      :message="snackbarMessage"
      :duration="5000"
      :full-hash="fullTransactionHash"
    />

    <!-- Leaderboard Modal -->
    <LeaderboardModal
      :show="showLeaderboard"
      :scores="leaderboardScores"
      @close="showLeaderboard = false"
    />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
  import { useGameStore } from "@/stores/gameStore";
  import MusicPlayer from "@/components/MusicPlayer.vue";
  import MemoryCard from "@/components/MemoryCard.vue";
  import { useGameSounds } from "@/composables/useGameSounds";
  import Snackbar from "@/components/Snackbar.vue";
  import LeaderboardModal from "@/components/LeaderboardModal.vue";
  import axios from "axios";
  import { API_URL } from "@/constants";

  const store = useGameStore();
  const {
    playFlipSound,
    playMatchSound,
    playFailSound,
    playRestartSound,
    playFirstClickSound,
  } = useGameSounds();
  const timerInterval = ref(null);
  const isFirstClick = ref(true);
  const showSnackbar = ref(false);
  const snackbarMessage = ref("");
  const fullTransactionHash = ref("");
  const showLeaderboard = ref(false);
  const leaderboardScores = ref([]);
  const isSaving = ref(false);
  const scoreSaved = ref(false);
  const cardEffects = ref(Array(16).fill(""));
  const scorePopups = ref([]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    clearInterval(timerInterval.value);
    timerInterval.value = setInterval(() => {
      store.incrementTime();
    }, 1000);
  };

  const flipCard = (index) => {
    if (store.flipCard(index)) {
      if (isFirstClick.value) {
        playFirstClickSound();
        startTimer();
        isFirstClick.value = false;
      } else {
        playFlipSound();
      }

      if (store.flippedCards.length === 2) {
        const [first, second] = store.flippedCards;

        setTimeout(() => {
          const isMatch = store.checkMatch();
          if (isMatch) {
            cardEffects.value[first] = "match";
            cardEffects.value[second] = "match";
            playMatchSound();

            // Add score popup for match
            const firstCard = document.querySelector(
              `[data-card-index="${first}"]`
            );
            const secondCard = document.querySelector(
              `[data-card-index="${second}"]`
            );

            if (firstCard && secondCard) {
              const rect1 = firstCard.getBoundingClientRect();
              const rect2 = secondCard.getBoundingClientRect();

              // Calculate center position between the two cards
              const centerX = (rect1.left + rect2.left) / 2 + rect1.width / 2;
              const centerY = (rect1.top + rect2.top) / 2;

              scorePopups.value.push({
                id: Date.now(),
                x: centerX,
                y: centerY,
                text: "+150",
                type: "match",
              });
            }
          } else {
            cardEffects.value[first] = "mismatch";
            cardEffects.value[second] = "mismatch";
            playFailSound();

            // Add score popup for mismatch
            const firstCard = document.querySelector(
              `[data-card-index="${first}"]`
            );
            const secondCard = document.querySelector(
              `[data-card-index="${second}"]`
            );

            if (firstCard && secondCard) {
              const rect1 = firstCard.getBoundingClientRect();
              const rect2 = secondCard.getBoundingClientRect();

              const centerX = (rect1.left + rect2.left) / 2 + rect1.width / 2;
              const centerY = (rect1.top + rect2.top) / 2;

              scorePopups.value.push({
                id: Date.now(),
                x: centerX,
                y: centerY,
                text: "-10",
                type: "mismatch",
              });
            }
          }

          // Clean up old popups
          setTimeout(() => {
            scorePopups.value = scorePopups.value.filter(
              (popup) => Date.now() - popup.id < 1000
            );
          }, 1000);

          // Reset effects
          setTimeout(() => {
            cardEffects.value[first] = "";
            cardEffects.value[second] = "";
          }, 800);
        }, 600);
      }
    }
  };

  const startGame = () => {
    playRestartSound();
    store.initializeGame();
    clearInterval(timerInterval.value);
    isFirstClick.value = true;
  };

  const restartGame = () => {
    startGame();
    scoreSaved.value = false;
  };

  const handleSaveScore = async () => {
    if (!store.walletAddress) {
      showLeaderboard.value = true;
      return;
    }

    isSaving.value = true;
    try {
      const response = await store.saveScore();
      scoreSaved.value = true;

      // Show success message with transaction hash if available
      if (response.transactionHash || response.hash) {
        const hash = response.transactionHash || response.hash;
        const shortHash = `${hash.slice(0, 5)}...${hash.slice(-3)}`;
        snackbarMessage.value = `Score saved! Tx: ${shortHash}`;
        fullTransactionHash.value = hash;
      } else {
        snackbarMessage.value = "Score saved successfully!";
      }

      showSnackbar.value = true;
      await fetchLeaderboard(); // Refresh leaderboard after saving
    } catch (error) {
      console.error("Save score error:", error);
      snackbarMessage.value =
        error.message || "Failed to save score. Please try again.";
      showSnackbar.value = true;
      scoreSaved.value = false;
    } finally {
      isSaving.value = false;
    }
  };

  // Watch for API responses
  watch(
    () => store.lastApiResponse,
    (response) => {
      if (response) {
        let message = "";
        if (response.error) {
          message = response.error;
        } else {
          const hash = response.transactionHash;
          // Format hash to show first 5 and last 3 characters
          const shortHash = `${hash.slice(0, 5)}...${hash.slice(-3)}`;
          message = `Tx: ${shortHash}`;
          // Store full hash for clipboard
          snackbarMessage.value = message;
          fullTransactionHash.value = hash;
        }
        // First set show to false to reset the watcher
        showSnackbar.value = false;
        // Use nextTick to ensure the show transition triggers
        nextTick(() => {
          snackbarMessage.value = message;
          showSnackbar.value = true;
        });
      }
    },
    { immediate: true }
  );

  // Add this function to copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Optionally show a success message
      snackbarMessage.value = "Transaction hash copied to clipboard!";
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Clean up timer on unmount
  onUnmounted(() => {
    clearInterval(timerInterval.value);
  });

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/leaderboard`);
      // Sort scores from highest to lowest before assigning to leaderboardScores
      leaderboardScores.value = response.data.scores.sort(
        (a, b) =>
          // Convert scores to numbers for proper comparison
          Number(b.score) - Number(a.score)
      );
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  // Fetch leaderboard when mounted and when modal is opened
  onMounted(() => {
    startGame();
    fetchLeaderboard();
  });

  watch(showLeaderboard, (newValue) => {
    if (newValue) {
      fetchLeaderboard();
    }
  });
</script>

<style>
  @import "../styles/card.css";
  @import "../styles/game-stats.css";
  @import "../styles/logo.css";
  @import "../styles/restart-button.css";
  @import "../styles/music-player.css";
  @import "../styles/score-effects.css";
</style>
