<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-purple-50 p-4">
    <h1 class="text-4xl font-bold mb-8 text-purple-800">Memory Card Game</h1>
    <div class="grid grid-cols-4 gap-4 p-6 bg-white rounded-xl shadow-lg">
      <div 
        v-for="(card, index) in cards" 
        :key="index"
        class="relative w-24 h-32 cursor-pointer card-container"
        @click="flipCard(index)"
      >
        <div 
          class="card-inner"
          :class="{ 'is-flipped': card.flipped }"
        >
          <!-- Back face (showing when not flipped) -->
          <div class="card-face card-face-back flex items-center justify-center rounded-lg shadow-md">
            <div class="card-design">
              <div class="card-logo">
                <span class="text-2xl">?</span>
              </div>
            </div>
          </div>
          <!-- Front face (showing when flipped) -->
          <div 
            class="card-face card-face-front bg-purple-600 flex items-center justify-center text-white text-3xl font-bold rounded-lg shadow-md"
            :class="{ 'opacity-75': card.matched }"
          >
            {{ card.value }}
          </div>
        </div>
      </div>
    </div>
    <button 
      @click="restartGame" 
      class="mt-8 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold 
             hover:bg-purple-700 transform hover:scale-105 transition-all duration-300 
             shadow-md"
    >
      Restart Game
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const values = ['🍎', '🍌', '🍒', '🍇', '🍉', '🍊', '🥝', '🍓'];
const cards = ref([]);
const flippedCards = ref([]);

const shuffleCards = () => {
  const shuffled = [...values, ...values]
    .sort(() => Math.random() - 0.5)
    .map(value => ({ value, flipped: false, matched: false }));
  cards.value = shuffled;
};

const flipCard = (index) => {
  if (cards.value[index].flipped || flippedCards.value.length === 2) return;
  
  cards.value[index].flipped = true;
  flippedCards.value.push(index);

  if (flippedCards.value.length === 2) {
    setTimeout(checkMatch, 1000);
  }
};

const checkMatch = () => {
  const [first, second] = flippedCards.value;
  if (cards.value[first].value === cards.value[second].value) {
    cards.value[first].matched = true;
    cards.value[second].matched = true;
  } else {
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
</style>
