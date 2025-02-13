<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-purple-200 p-4">
    <MusicPlayer />
    <div class="logo-container mb-8">
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
            <span class="stonks">📈</span>
            <span class="wow">wow</span>
            <span class="such">such memory</span>
            <span class="very">very cards</span>
          </div>
        </div>
      </div>
    </div>
    <div class="relative grid grid-cols-4 gap-4 p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
      <MemoryCard
        v-for="(card, index) in cards"
        :key="index"
        :value="card.value"
        :flipped="card.flipped"
        :matched="card.matched"
        @flip="flipCard(index)"
      />
      
      <!-- Centered restart button when game is over -->
      <div 
        v-if="isGameComplete"
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
</template>

<script setup>
import { ref, computed } from 'vue';
import MusicPlayer from '@/components/MusicPlayer.vue';
import MemoryCard from '@/components/MemoryCard.vue';
import { useGameSounds } from '@/composables/useGameSounds';

const { playFlipSound, playMatchSound, playFailSound } = useGameSounds();

const values = ['🍎', '🍌', '🍒', '🍇', '🍉', '🍊', '🥝', '🍓'];
const cards = ref([]);
const flippedCards = ref([]);

// Add computed property to check if game is complete
const isGameComplete = computed(() => {
  return cards.value.every(card => card.matched);
});

const shuffleCards = () => {
  const shuffled = [...values, ...values]
    .sort(() => Math.random() - 0.5)
    .map(value => ({ value, flipped: false, matched: false }));
  cards.value = shuffled;
};

const flipCard = (index) => {
  if (cards.value[index].flipped || flippedCards.value.length === 2) return;
  
  playFlipSound();
  
  cards.value[index].flipped = true;
  flippedCards.value.push(index);

  if (flippedCards.value.length === 2) {
    setTimeout(checkMatch, 1000);
  }
};

const checkMatch = () => {
  const [first, second] = flippedCards.value;
  if (cards.value[first].value === cards.value[second].value) {
    playMatchSound();
    cards.value[first].matched = true;
    cards.value[second].matched = true;
  } else {
    playFailSound();
    cards.value[first].flipped = false;
    cards.value[second].flipped = false;
  }
  flippedCards.value = [];
};

const restartGame = () => {
  shuffleCards();
  flippedCards.value = [];
};

// Shuffle on mount
shuffleCards();
</script>

<style>
.card-container {
  perspective: 1000px;
  transform-style: preserve-3d;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-style: preserve-3d;
  will-change: transform;
}

.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  -webkit-transform-style: preserve-3d; /* Add for Safari */
  transform-style: preserve-3d;
  transition: box-shadow 0.3s ease;
  will-change: transform;
}

.card-face-front {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #9333ea, #7e22ce);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.card-face-back {
  transform: rotateY(0deg);
  background: linear-gradient(135deg, #9333ea, #7e22ce);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.card-design {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: repeating-linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.1) 0px,
    rgba(255, 255, 255, 0.1) 2px,
    transparent 2px,
    transparent 8px
  );
}

.card-logo {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7e22ce;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Update hover transitions to match flip speed */
.card-container:hover .card-inner {
  transform: translateY(-2px);
  transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.card-container:hover .card-inner.is-flipped {
  transform: translateY(-2px) rotateY(180deg);
  transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.card-container:hover .card-face {
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
}

input[type="range"] {
  -webkit-appearance: none;
  height: 4px;
  background: #e9d5ff;
  border-radius: 2px;
  background-image: linear-gradient(#9333ea, #9333ea);
  background-repeat: no-repeat;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #9333ea;
  cursor: pointer;
  box-shadow: 0 0 2px 0 #555;
  transition: background .3s ease-in-out;
}

input[type="range"]::-webkit-slider-thumb:hover {
  background: #7e22ce;
}

/* CD Player Styles */
.cd-player {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  position: relative;
  background: #222;
  padding: 2px;
  cursor: pointer;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cd-player:hover {
  transform: scale(1.05);
}

.cd-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #d1d1d1, #f5f5f5);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cd-label {
  position: absolute;
  inset: 20%;
  border-radius: 50%;
  background: linear-gradient(135deg, #9333ea, #7e22ce);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.music-icon {
  color: white;
  font-size: 18px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.cd-center {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #222;
  border: 1px solid #666;
  z-index: 3;
  position: relative;
}

.cd-grooves {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    rgba(0, 0, 0, 0.05) 0px,
    rgba(0, 0, 0, 0.05) 1px,
    transparent 1px,
    transparent 2px
  );
  z-index: 1;
}

.cd-disc::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 45%,
    rgba(255, 255, 255, 0.7) 50%,
    rgba(255, 255, 255, 0.4) 55%,
    transparent 100%
  );
  z-index: 4;
}

.spinning {
  animation: spin 4s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.cd-player {
  animation-play-state: paused;
}

.cd-player.spinning {
  animation-play-state: running;
}

.logo-container {
  position: relative;
  padding: 1rem;
}

.game-logo {
  position: relative;
  padding: 1rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.title-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.title-line {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brain {
  font-size: 3rem;
  animation: pulse 2s ease-in-out infinite;
}

.brain.flip {
  transform: scaleX(-1);
}

.memory-text {
  font-family: 'Courier New', monospace;
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
  letter-spacing: -2px;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
}

.subtitle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.3rem 1rem;
  border-radius: 4px;
  position: relative;
}

.loading-text {
  color: #7e22ce;
  font-weight: bold;
}

.loading-dots {
  display: flex;
  gap: 2px;
}

.dot {
  animation: loadingDots 1.5s infinite;
  color: #7e22ce;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

.system-text {
  font-size: 0.8em;
  color: #9333ea;
  opacity: 0.7;
  margin-left: 0.5rem;
  font-style: italic;
}

@keyframes loadingDots {
  0%, 100% {
    opacity: 0.2;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.meme-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.stonks {
  position: absolute;
  top: -20px;
  right: -30px;
  font-size: 2.5rem;
  transform: rotate(30deg);
  animation: float 3s ease-in-out infinite;
}

.wow, .such, .very {
  position: absolute;
  font-family: 'Comic Sans MS', cursive;
  color: #9333ea;
  font-size: 1.2rem;
  opacity: 0;
  animation: appear 5s ease-in-out infinite;
}

.wow {
  top: 0;
  left: -50px;
  animation-delay: 0s;
  transform: rotate(-15deg);
}

.such {
  bottom: -20px;
  left: 20%;
  animation-delay: 1s;
  transform: rotate(10deg);
}

.very {
  top: 20px;
  right: -60px;
  animation-delay: 2s;
  transform: rotate(15deg);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes appear {
  0%, 100% { opacity: 0; transform: translateY(10px); }
  10%, 90% { opacity: 0; }
  50% { opacity: 1; transform: translateY(0); }
}

.restart-button {
  position: relative;
  margin-top: 2rem;
  padding: 1rem 2.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  color: white;
  background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  z-index: 50;
}

.button-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.restart-icon {
  font-size: 1.4rem;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.restart-button:hover .restart-icon {
  transform: rotate(360deg) scale(1.2);
}

.button-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #9333ea, #7e22ce, #9333ea);
  background-size: 200% 200%;
  animation: glow 3s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 14px;
  filter: blur(8px);
}

.restart-button:hover .button-glow {
  opacity: 1;
}

.button-particles span {
  position: absolute;
  pointer-events: none;
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  opacity: 0;
  transform: translate(-50%, -50%);
}

.restart-button:hover .button-particles span {
  animation: particles 0.8s ease-in-out forwards;
}

.button-particles span:nth-child(1) { left: 25%; top: 0; }
.button-particles span:nth-child(2) { left: 75%; top: 0; animation-delay: 0.1s !important; }
.button-particles span:nth-child(3) { left: 25%; bottom: 0; animation-delay: 0.2s !important; }
.button-particles span:nth-child(4) { left: 75%; bottom: 0; animation-delay: 0.3s !important; }

@keyframes glow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes particles {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
  }
  20% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(3);
  }
}

.restart-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(147, 51, 234, 0.4);
}

.restart-button:active {
  transform: translateY(1px) scale(0.98);
}

/* Update overlay animation */
.absolute {
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

