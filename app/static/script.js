const slider = document.getElementById("volumeSlider");
const input = document.getElementById("volumeInput");

let MasterVolume = 1;
const SOUND_GAIN_MULTIPLIER = 2.2;
const TTS_GAIN_MULTIPLIER = 1.4;

let audioContext = null;
let masterGainNode = null;

function ensureAudioContext() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;

        audioContext = new AudioContextClass();
        masterGainNode = audioContext.createGain();
        masterGainNode.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    return { audioContext, masterGainNode };
}

// --------------------
// MASTER VOLUME
// --------------------

function setMasterVolume(value) {
    const numericValue = Number(value);
    const clampedValue = Math.max(0, Math.min(100, Number.isFinite(numericValue) ? numericValue : 100));

    if (slider) slider.value = clampedValue;
    if (input) input.value = clampedValue;

    MasterVolume = clampedValue / 100;
}

if (slider) {
    slider.addEventListener("input", () => setMasterVolume(slider.value));
    slider.addEventListener("change", () => setMasterVolume(slider.value));
}

if (input) {
    input.addEventListener("input", () => setMasterVolume(input.value));
    input.addEventListener("change", () => setMasterVolume(input.value));
}


// --------------------
// PER-SOUND VOLUME
// --------------------

const soundVolumes = {};

function setSoundVolume(name, value) {
    const numericValue = Number(value);
    const clampedValue = Math.max(0, Math.min(100, Number.isFinite(numericValue) ? numericValue : 100));

    soundVolumes[name] = clampedValue / 100;

    // find the correct card
    const card = document.querySelector(`[data-sound="${name}"]`);
    if (!card) return;

    const slider = card.querySelector('input[type="range"]');
    const input = card.querySelector('input[type="number"]');

    // sync both fields
    slider.value = value;
    input.value = value;
}


// --------------------
// TEXT TO SPEECH
// --------------------

const ttsSlider = document.getElementById("ttsVolumeSlider");
const ttsInput = document.getElementById("ttsVolumeInput");
const ttsText = document.getElementById("ttsText");
const ttsButton = document.getElementById("ttsSpeakBtn");

let TTSVolume = 1;

function setTTSVolume(value) {
    const numericValue = Number(value);
    const clampedValue = Math.max(0, Math.min(100, Number.isFinite(numericValue) ? numericValue : 100));

    if (ttsSlider) ttsSlider.value = clampedValue;
    if (ttsInput) ttsInput.value = clampedValue;

    TTSVolume = clampedValue / 100;
}

function speakText() {
    const text = ttsText?.value.trim();
    if (!text) {
        alert("Type something first.");
        return;
    }

    if (!("speechSynthesis" in window) || typeof window.SpeechSynthesisUtterance === "undefined") {
        alert("Speech synthesis is not supported in this browser.");
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = Math.max(0, Math.min(1, MasterVolume * TTSVolume));

    window.speechSynthesis.speak(utterance);
}

if (ttsSlider && ttsInput && ttsText && ttsButton) {
    ttsSlider.addEventListener("input", () => setTTSVolume(ttsSlider.value));
    ttsInput.addEventListener("input", () => setTTSVolume(ttsInput.value));
    ttsButton.addEventListener("click", speakText);

    ttsText.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            speakText();
        }
    });

    setTTSVolume(100);
}

// --------------------
// PLAY SOUND
// --------------------

function playSound(name) {
    const audio = new Audio(`/static/sounds/${name}`);
    const soundVolume = soundVolumes[name] ?? 1;
    const gainValue = Math.max(0, Math.min(32, MasterVolume * soundVolume * SOUND_GAIN_MULTIPLIER));

    const audioContextInfo = ensureAudioContext();

    if (audioContextInfo) {
        const source = audioContextInfo.audioContext.createMediaElementSource(audio);
        source.connect(audioContextInfo.masterGainNode);
        audioContextInfo.masterGainNode.gain.value = gainValue;
    } else {
        audio.volume = Math.min(1, gainValue);
    }

    audio.play();
}

// --------------------
// Searchbar
// --------------------
const searchBar = document.getElementById("searchBar");

searchBar.addEventListener("input", () => {
    const query = searchBar.value
        .toLowerCase()
        .replace(/[\s_-]/g, "");

    document.querySelectorAll(".sound-card").forEach(card => {
        const soundName = card.querySelector(".sound-name")
            .textContent
            .toLowerCase()
            .replace(/[\s_-]/g, "");

        card.style.display = soundName.includes(query) ? "" : "none";
    });
});