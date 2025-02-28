<template>
  <div
    class="relative w-24 h-32 cursor-pointer card-container"
    @click="$emit('flip')"
    :data-card-index="index"
  >
    <div
      class="card-inner"
      :class="{
        'is-flipped': flipped,
      }"
    >
      <div
        class="card-face card-face-back flex items-center justify-center rounded-lg shadow-md"
      >
        <div class="card-design">
          <div class="card-logo">
            <span class="text-2xl">?</span>
          </div>
        </div>
      </div>
      <div
        class="card-face card-face-front bg-purple-600 flex items-center justify-center text-white text-3xl font-bold rounded-lg shadow-md"
        :class="{ 'opacity-75': matched }"
      >
        {{ value }}
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    value: String,
    flipped: Boolean,
    matched: Boolean,
    index: Number,
    showEffect: String,
  });

  defineEmits(["flip"]);
</script>

<style scoped>
  .card-container {
    perspective: 1000px;
    transform-style: preserve-3d;
    position: relative;
  }

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
    will-change: transform;
  }

  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .card-face-front {
    transform: rotateY(180deg);
  }

  .card-face-back {
    transform: rotateY(0deg);
  }

  .is-flipped {
    transform: rotateY(180deg);
  }
</style>
