let audioContext = null;

export const playNotificationSound = () => {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        audioContext = audioContext || new AudioContextClass();
        if (audioContext.state === "suspended") audioContext.resume();

        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.setValueAtTime(660, now + 0.12);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    } catch {

    }
};