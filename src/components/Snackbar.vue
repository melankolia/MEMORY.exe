<template>
  <div class="fixed bottom-4 right-4 flex flex-col-reverse gap-2 z-50">
    <TransitionGroup name="slide-fade">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="relative overflow-hidden bg-purple-900/80 backdrop-blur-sm text-white px-2.5 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border border-purple-700/50"
      >
        <!-- Glow Effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"></div>

        <!-- Content wrapper -->
        <div class="relative flex items-center space-x-3">

          <!-- Message -->
          <div class="flex flex-col">
            <span class="text-sm font-bold text-fuchsia-300">Memory Game</span>
            <span class="text-sm text-gray-200">{{ toast.message }}</span>
          </div>

          <!-- Close Button -->
          <button 
            @click="() => removeToast(toast.id)" 
            class="pl-4 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-fuchsia-300 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Progress Bar with gradient -->
        <div 
          class="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-b-xl"
          :style="{ 
            width: `${toast.progress}%`,
            transition: 'width 5s linear'
          }"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 5000
  },
  show: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:show']);
const toasts = ref([]);
let nextId = 0;

const addToast = (message) => {
  const id = nextId++;
  const toast = { 
    id, 
    message,
    progress: 100,
    isError: message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')
  };

  // Always add new toast
  toasts.value.unshift(toast);
  
  // Limit number of toasts shown
  if (toasts.value.length > 5) {
    const oldToast = toasts.value.pop();
  }

  // Start progress animation
  nextTick(() => {
    toast.progress = 0;
  });

  // Remove toast after duration
  setTimeout(() => {
    removeToast(id);
  }, props.duration);
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
  if (toasts.value.length === 0) {
    emit('update:show', false);
  }
};

// Watch for new messages
watch(
  () => ({ show: props.show, message: props.message }),
  (newVal) => {
    if (newVal.show && newVal.message) {
      addToast(newVal.message);
    }
  },
  { immediate: true, deep: true }
);

onUnmounted(() => {
  toasts.value = [];
});
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-enter-from {
  transform: translateX(100px) scale(0.95);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(100px) scale(0.95);
  opacity: 0;
}

.slide-fade-move {
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Smoother shimmer animation */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 3s linear infinite;
}
</style> 