export function useGameSounds() {
  const flipSound = new Audio('/sounds/flip.mp3');
  const matchSound = new Audio('/sounds/match.mp3');
  const failSound = new Audio('/sounds/fail.mp3');

  const playSound = (sound) => {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  return {
    playFlipSound: () => playSound(flipSound),
    playMatchSound: () => playSound(matchSound),
    playFailSound: () => playSound(failSound)
  };
} 