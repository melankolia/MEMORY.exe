<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-purple-900/80 backdrop-blur-sm transition-opacity duration-300"
      @click="$emit('close')"
    ></div>

    <!-- Modal -->
    <div
      class="relative bg-purple-900/95 backdrop-blur-md rounded-xl p-6 shadow-2xl max-w-md w-full mx-4 border border-purple-500/30 transform transition-all duration-300 scale-in-center"
      style="overflow: hidden; transform-origin: center center"
    >
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="flex justify-end">
          <button
            @click="$emit('close')"
            class="text-purple-300 hover:text-white transition-colors p-1.5 hover:bg-purple-700/50 rounded-lg"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="relative inline-block">
          <span class="text-4xl">🏆</span>
          <span
            class="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"
          ></span>
        </div>
        <h2
          class="text-2xl font-bold mt-3 mb-2 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent"
        >
          Memory Masters
        </h2>
        <p class="text-sm text-purple-300/80 mb-10">Top Players</p>
      </div>

      <!-- Top 3 Players Section -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <!-- Silver - 2nd Place -->
        <div class="relative order-1">
          <div
            class="flex flex-col items-center p-4 bg-purple-800/30 rounded-xl border border-purple-600/20"
          >
            <span class="text-3xl mb-2">🥈</span>
            <span class="text-lg font-bold text-purple-100">{{
              scores[1]?.score || "0"
            }}</span>
            <span class="text-xs text-purple-300/70 mt-1">{{
              formatAddress(scores[1]?.player || "")
            }}</span>
          </div>
        </div>

        <!-- Gold - 1st Place -->
        <div class="relative order-0">
          <div
            class="flex flex-col items-center p-4 bg-gradient-to-b from-purple-600/60 to-purple-700/60 rounded-xl border border-purple-400/30 transform -translate-y-2"
          >
            <div class="relative">
              <span class="text-4xl mb-2">🏆</span>
              <span
                class="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"
              ></span>
            </div>
            <span class="text-xl font-bold text-purple-100">{{
              scores[0]?.score || "0"
            }}</span>
            <span class="text-xs text-purple-300/70 mt-1">{{
              formatAddress(scores[0]?.player || "")
            }}</span>
          </div>
        </div>

        <!-- Bronze - 3rd Place -->
        <div class="relative order-2">
          <div
            class="flex flex-col items-center p-4 bg-purple-800/30 rounded-xl border border-purple-600/20"
          >
            <span class="text-3xl mb-2">🥉</span>
            <span class="text-lg font-bold text-purple-100">{{
              scores[2]?.score || "0"
            }}</span>
            <span class="text-xs text-purple-300/70 mt-1">{{
              formatAddress(scores[2]?.player || "")
            }}</span>
          </div>
        </div>
      </div>

      <!-- After Top 3 Players Section and before Current Player's Score Section -->
      <div class="mb-6">
        <h3
          class="text-sm text-purple-300/70 mb-3 font-medium flex items-center justify-between"
        >
          <span>Other Players</span>
          <span class="text-xs">(4-50)</span>
        </h3>

        <!-- Virtual Scroll Container -->
        <div class="h-32 overflow-y-auto custom-scrollbar">
          <div
            v-for="(score, index) in scores.slice(3, 50)"
            :key="score.player"
            class="flex items-center justify-between p-2.5 rounded-lg transition-colors"
            :class="{
              'bg-purple-800/20': isCurrentPlayer(score.player),
              'hover:bg-purple-800/10': !isCurrentPlayer(score.player),
            }"
          >
            <div class="flex items-center gap-2">
              <span class="text-sm text-purple-300/70 w-6"
                >#{{ index + 4 }}</span
              >
              <span class="text-sm font-medium text-purple-100">
                {{ formatAddress(score.player) }}
              </span>
            </div>
            <span class="text-sm font-bold text-purple-100">{{
              score.score
            }}</span>
          </div>
        </div>
      </div>

      <!-- Current Player's Score Section -->
      <div class="mb-8">
        <h3 class="text-sm text-purple-300/70 mb-3 font-medium">
          Your Performance
        </h3>
        <div
          class="bg-purple-800/40 rounded-xl border border-purple-600/20 p-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
              >
                <span class="text-lg">👤</span>
              </div>
              <div>
                <div class="text-sm text-purple-300/70">Current Score</div>
                <div class="text-xl font-bold text-purple-100">
                  {{ getCurrentPlayerScore() }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs text-purple-300/70">Rank</div>
              <div class="text-lg font-bold text-purple-100">
                #{{ getCurrentPlayerRank() }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="pt-6">
        <!-- Wallet Section -->
        <div
          v-if="!connectedAddress"
          class="p-5 bg-purple-800/40 rounded-xl border border-purple-600/20 text-center"
        >
          <button
            @click="handleConnect"
            :disabled="isConnecting"
            class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
          >
            <span class="text-sm">{{
              isConnecting ? "Connecting..." : "Connect Wallet"
            }}</span>
            <svg
              v-if="!isConnecting"
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </button>
          <p class="text-xs text-purple-300/70 mt-2">
            Connect to save your scores
          </p>
        </div>

        <div
          v-else
          class="flex items-center justify-between p-4 bg-purple-800/30 rounded-xl border border-purple-600/20"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
            >
              <span class="text-xs">👛</span>
            </div>
            <div class="text-left">
              <div class="text-xs text-purple-300/70">Connected as</div>
              <div class="text-sm font-medium text-purple-100">
                {{ formatAddress(connectedAddress) }}
              </div>
            </div>
          </div>
          <button
            @click="handleDisconnect"
            class="text-xs text-purple-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-purple-700/50 transition-colors border border-purple-500/20"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from "vue";
  import { useGameStore } from "@/stores/gameStore";
  import {
    connectWallet,
    getConnectedAccount,
    listenToAccountChanges,
  } from "@/services/wallet";

  const store = useGameStore();
  const connectedAddress = ref(null);
  const isConnecting = ref(false);
  const error = ref(null);
  const emit = defineEmits(["close", "refresh"]);

  const props = defineProps({
    show: Boolean,
    scores: {
      type: Array,
      default: () => [],
    },
  });

  const handleConnect = async () => {
    isConnecting.value = true;
    error.value = null;

    try {
      const address = await connectWallet();
      connectedAddress.value = address;
      store.updatePlayerAddress(address);
      emit("refresh");
    } catch (err) {
      error.value = err.message;
    } finally {
      isConnecting.value = false;
    }
  };

  const handleDisconnect = () => {
    connectedAddress.value = null;
    store.resetPlayerAddress();
    emit("refresh");
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async (address) => {
    try {
      await navigator.clipboard.writeText(address);
      // You could emit an event to show a toast notification
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const isCurrentPlayer = (playerAddress) => {
    // Check if the address matches either the connected wallet or the session ID
    if (connectedAddress.value) {
      return (
        playerAddress.toLowerCase() === connectedAddress.value.toLowerCase()
      );
    }
    return playerAddress === store.secureId;
  };

  const getCurrentPlayerScore = () => {
    const currentPlayer = props.scores.find((score) =>
      isCurrentPlayer(score.player)
    );
    return currentPlayer?.score || "0";
  };

  const getCurrentPlayerRank = () => {
    const currentPlayer = props.scores.findIndex((score) =>
      isCurrentPlayer(score.player)
    );
    return currentPlayer === -1 ? "-" : currentPlayer + 1;
  };

  // Listen for Escape key to close modal
  onMounted(async () => {
    // Check if already connected
    const account = await getConnectedAccount();
    if (account) {
      connectedAddress.value = account;
      store.updatePlayerAddress(account);
    }

    // Listen for account changes
    listenToAccountChanges((account) => {
      connectedAddress.value = account;
      if (account) {
        store.updatePlayerAddress(account);
      } else {
        store.resetPlayerAddress();
      }
      emit("refresh");
    });

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && props.show) {
        e.preventDefault();
        e.stopPropagation();
        emit("close");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });
</script>

<style scoped>
  @keyframes bounce-slow {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  @keyframes pulse-slow {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.9;
    }
  }

  .animate-bounce-slow {
    animation: bounce-slow 2s infinite;
  }

  .animate-pulse-slow {
    animation: pulse-slow 2s infinite;
  }

  @keyframes scale-in-center {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .scale-in-center {
    animation: scale-in-center 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  @keyframes fade-in {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-in > * {
    animation: fade-in 0.4s ease-out forwards;
  }

  /* Smooth scrollbar */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(168, 85, 247, 0.4) transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(88, 28, 135, 0.2);
    border-radius: 2px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(168, 85, 247, 0.4);
    border-radius: 2px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(168, 85, 247, 0.6);
  }

  .order-0 {
    transform: translateY(-8px);
    z-index: 2;
  }

  .order-1,
  .order-2 {
    transform: translateY(0);
    z-index: 1;
  }
</style>
