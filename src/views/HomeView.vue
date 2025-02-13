<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-purple-200 p-4">
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
      </div>

      <!-- Game Board -->
      <div class="relative grid grid-cols-4 gap-4 p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
        <MemoryCard
          v-for="(card, index) in store.cards"
          :key="index"
          :value="card.value"
          :flipped="card.flipped"
          :matched="card.matched"
          @flip="flipCard(index)"
        />
        
        <!-- Centered restart button when game is over -->
        <div 
          v-if="store.isGameComplete"
          class="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-xl"
        >
          <button 
            @click="restartGame" 
            class="restart-button"
          >
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import MusicPlayer from '@/components/MusicPlayer.vue';
import MemoryCard from '@/components/MemoryCard.vue';
import { useGameSounds } from '@/composables/useGameSounds';

const store = useGameStore();
const { 
  playFlipSound, 
  playMatchSound, 
  playFailSound, 
  playRestartSound, 
  playFirstClickSound 
} = useGameSounds();
const timerInterval = ref(null);
const isFirstClick = ref(true);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      setTimeout(() => {
        const isMatch = store.checkMatch();
        if (isMatch) {
          playMatchSound();
        } else {
          playFailSound();
        }
      }, 1000);
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
};

// Clean up timer on unmount
onUnmounted(() => {
  clearInterval(timerInterval.value);
});

// Initialize game
onMounted(() => {
  startGame();
});
</script>

<style>
@import '../styles/card.css';
@import '../styles/game-stats.css';
@import '../styles/logo.css';
@import '../styles/restart-button.css';
@import '../styles/music-player.css';
</style>

