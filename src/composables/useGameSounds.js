export const useGameSounds = () => {
  const flipSound = new Audio('/sounds/flip.mp3');
  const matchSound = new Audio('/sounds/match.mp3');
  const failSound = new Audio('/sounds/fail.mp3');
  const restartSound = new Audio('/sounds/restart.mp3');
  const firstClickSound = new Audio('/sounds/start.mp3');

  const playSound = (sound) => {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  const playFlipSound = () => {
    const audio = new Audio('/sounds/flip.mp3');
    audio.volume = 0.3;
    audio.play();
  };

  const playMatchSound = () => {
    const audio = new Audio('/sounds/match.mp3');
    audio.volume = 0.3;
    audio.play();
  };

  const playFailSound = () => {
    const audio = new Audio('/sounds/fail.mp3');
    audio.volume = 0.2;
    audio.play();
  };

  const playRestartSound = () => {
    const audio = new Audio('/sounds/restart.mp3');
    audio.volume = 0.4;
    audio.play();
  };

  const playFirstClickSound = () => {
    const audio = new Audio('/sounds/start.mp3');
    audio.volume = 0.4;
    audio.play();
  };

  return {
    playFlipSound,
    playMatchSound,
    playFailSound,
    playRestartSound,
    playFirstClickSound
  };
}; 