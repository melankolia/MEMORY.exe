<template>
  <div class="fixed bottom-4 right-4 flex flex-col-reverse gap-2 z-50">
    <TransitionGroup name="slide-fade">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
      >
        <span class="text-lg">{{ toast.message }}</span>
        <button 
          @click="() => removeToast(toast.id)" 
          class="ml-4 pl-4 text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 3000
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
  toasts.value.push({ id, message });
  setTimeout(() => removeToast(id), props.duration);
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

watch(() => props.show, (newValue) => {
  if (newValue && props.message) {
    addToast(props.message);
  }
});
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Ensure proper stacking */
.slide-fade-move {
  transition: transform 0.3s ease;
}
</style> 