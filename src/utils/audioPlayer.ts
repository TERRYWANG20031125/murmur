// Interactive audio player using Web Audio API for gentle wind-bell & rain chime soundscapes

let audioCtx: AudioContext | null = null;
let currentOscillators: {stop: () => void} | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as {webkitAudioContext: typeof AudioContext})
        .webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playGentleWindChime(
  onTick?: (progress: number) => void,
  onEnd?: () => void,
  durationSec = 12,
) {
  stopCurrentAudio();
  const ctx = getAudioContext();

  const startTime = ctx.currentTime;
  const pentatonicFrequencies = [
    523.25, 587.33, 659.25, 783.99, 880.0, 1046.5,
  ]; // C5, D5, E5, G5, A5, C6 (serene pentatonic scale)

  let isPlaying = true;
  let timerId: number | null = null;

  // Trigger peaceful chimes periodically
  const noteTimings = [0.2, 1.4, 2.8, 4.2, 5.6, 7.0, 8.5, 10.1];
  const activeNodes: OscillatorNode[] = [];

  noteTimings.forEach((t) => {
    if (t < durationSec) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq =
        pentatonicFrequencies[
          Math.floor(Math.random() * pentatonicFrequencies.length)
        ];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + t);

      gain.gain.setValueAtTime(0.0001, startTime + t);
      gain.gain.exponentialRampToValueAtTime(0.06, startTime + t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + t + 2.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + t);
      osc.stop(startTime + t + 2.5);
      activeNodes.push(osc);
    }
  });

  const interval = setInterval(() => {
    if (!isPlaying) {
      clearInterval(interval);
      return;
    }
    const elapsed = ctx.currentTime - startTime;
    const progress = Math.min(1, elapsed / durationSec);
    if (onTick) onTick(progress);
    if (progress >= 1) {
      isPlaying = false;
      clearInterval(interval);
      if (onEnd) onEnd();
    }
  }, 100);

  timerId = interval as unknown as number;

  currentOscillators = {
    stop: () => {
      isPlaying = false;
      if (timerId) clearInterval(timerId);
      activeNodes.forEach((node) => {
        try {
          node.stop();
        } catch {
          // already stopped
        }
      });
      if (onEnd) onEnd();
    },
  };

  return currentOscillators;
}

export function playRainWhiteNoise(
  onTick?: (progress: number) => void,
  onEnd?: () => void,
  durationSec = 15,
) {
  stopCurrentAudio();
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Pink noise approximation for soothing rain
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.03;
    b6 = white * 0.115926;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.8);
  gain.gain.setValueAtTime(0.08, ctx.currentTime + durationSec - 1);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSec);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  noise.stop(ctx.currentTime + durationSec);

  const startTime = ctx.currentTime;
  let isPlaying = true;
  const interval = setInterval(() => {
    if (!isPlaying) {
      clearInterval(interval);
      return;
    }
    const elapsed = ctx.currentTime - startTime;
    const progress = Math.min(1, elapsed / durationSec);
    if (onTick) onTick(progress);
    if (progress >= 1) {
      isPlaying = false;
      clearInterval(interval);
      if (onEnd) onEnd();
    }
  }, 100);

  currentOscillators = {
    stop: () => {
      isPlaying = false;
      clearInterval(interval);
      try {
        noise.stop();
      } catch {
        // already stopped
      }
      if (onEnd) onEnd();
    },
  };

  return currentOscillators;
}

export function stopCurrentAudio() {
  if (currentOscillators) {
    currentOscillators.stop();
    currentOscillators = null;
  }
}
