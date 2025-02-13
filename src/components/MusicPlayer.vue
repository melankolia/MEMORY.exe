<template>
  <div class="fixed top-4 right-4">
    <button 
      @click="toggleMusic" 
      class="cd-player"
      :class="{ 'spinning': isPlaying }"
      title="Toggle Music"
    >
      <div class="cd-disc">
        <div class="cd-label">
          <span class="music-icon">{{ isPlaying ? '♪' : '▶' }}</span>
        </div>
        <div class="cd-center"></div>
        <div class="cd-grooves"></div>
      </div>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const bgm = new Audio('/sounds/background-music.mp3');
bgm.loop = true;
bgm.volume = 0.3;
const isPlaying = ref(false);

onMounted(async () => {
  try {
    await document.documentElement.requestFullscreen();
    document.exitFullscreen();
    await bgm.play();
    isPlaying.value = true;
  } catch (error) {
    console.log('Autoplay prevented - waiting for user interaction');
    const startAudio = async () => {
      try {
        await bgm.play();
        isPlaying.value = true;
        document.removeEventListener('click', startAudio);
      } catch (err) {
        console.error('Failed to play audio:', err);
      }
    };
    document.addEventListener('click', startAudio);
  }
});

const toggleMusic = async () => {
  try {
    if (isPlaying.value) {
      bgm.pause();
    } else {
      await bgm.play();
    }
    isPlaying.value = !isPlaying.value;
  } catch (error) {
    console.error('Failed to toggle audio:', error);
  }
};

onUnmounted(() => {
  bgm.pause();
  bgm.currentTime = 0;
  document.removeEventListener('click', startAudio);
});
</script>

<style scoped>
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
</style> 