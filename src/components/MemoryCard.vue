<template>
  <div 
    class="relative w-24 h-32 cursor-pointer card-container"
    @click="$emit('flip')"
  >
    <div 
      class="card-inner"
      :class="{ 'is-flipped': flipped }"
    >
      <div class="card-face card-face-back flex items-center justify-center rounded-lg shadow-md">
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
defineProps({
  value: String,
  flipped: Boolean,
  matched: Boolean
});

defineEmits(['flip']);
</script>

<style scoped>
.card-container {
  perspective: 1000px;
  transform-style: preserve-3d;
}

/* ... rest of card styles ... */
</style> 