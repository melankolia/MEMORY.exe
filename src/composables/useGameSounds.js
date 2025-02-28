export const useGameSounds = () => {
  const sounds = {
    flip: new Audio("/sounds/flip.mp3"),
    match: new Audio("/sounds/match.mp3"),
    fail: new Audio("/sounds/fail.mp3"),
    restart: new Audio("/sounds/restart.mp3"),
    firstClick: new Audio("/sounds/start.mp3"),
  };

  // Initialize volumes
  sounds.flip.volume = 0.3;
  sounds.match.volume = 0.3;
  sounds.fail.volume = 0.2;
  sounds.restart.volume = 0.4;
  sounds.firstClick.volume = 0.4;

  const playSound = (soundName) => {
    const sound = sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  };

  return {
    playFlipSound: () => playSound("flip"),
    playMatchSound: () => playSound("match"),
    playFailSound: () => playSound("fail"),
    playRestartSound: () => playSound("restart"),
    playFirstClickSound: () => playSound("firstClick"),
  };
};
