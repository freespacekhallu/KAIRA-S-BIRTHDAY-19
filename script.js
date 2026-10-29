
"use strict";

// ---------------------------------------------
// 1. BIRTHDAY MUSIC PLAYER
// ---------------------------------------------

const music = document.getElementById("birthdayMusic");
const playMusic = document.getElementById("playMusic");
const musicMini = document.getElementById("musicMini");
const muteMusic = document.getElementById("muteMusic");
const restartMusic = document.getElementById("restartMusic");
const volume = document.getElementById("volume");
const musicStatus = document.getElementById("musicStatus");
const equalizer = document.getElementById("equalizer");
const progressFill = document.getElementById("progressFill");
const progressTrack = document.getElementById("progressTrack");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

let isMuted = false;
let previousVolume = Number(volume.value);

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function updateMusicUI() {
  const playing = !music.paused && !music.ended;

  playMusic.textContent = playing ? "Ⅱ" : "▶";
  playMusic.setAttribute(
    "aria-label",
    playing ? "Pause birthday music" : "Play birthday music"
  );

  musicMini.textContent = playing ? "♫ MUSIC ON" : "♫ MUSIC OFF";
  equalizer.classList.toggle("playing", playing);
}

async function startMusic() {
  try {
    musicStatus.textContent = "Loading your song...";

    await music.play();

    musicStatus.textContent = "Enjoy the music ♡";
    updateMusicUI();
  } catch (error) {
    console.error("Music playback error:", error);

    if (error.name === "NotAllowedError") {
      musicStatus.textContent =
        "Click Play again to allow music in your browser.";
    } else {
      musicStatus.textContent =
        "Music could not load. Check music/birthday.mp3.";
    }
  }
}

function toggleMusic() {
  if (music.paused) {
    startMusic();
  } else {
    music.pause();
    updateMusicUI();
    musicStatus.textContent = "Music paused ♡";
  }
}

playMusic.addEventListener("click", toggleMusic);
musicMini.addEventListener("click", toggleMusic);

music.addEventListener("play", updateMusicUI);
music.addEventListener("pause", updateMusicUI);

music.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(music.duration);
  musicStatus.textContent = "Your song is ready ♡";
});

music.addEventListener("timeupdate", () => {
  currentTime.textContent = formatTime(music.currentTime);

  if (Number.isFinite(music.duration) && music.duration > 0) {
    progressFill.style.width =
      `${(music.currentTime / music.duration) * 100}%`;
  }
});

music.addEventListener("ended", () => {
  updateMusicUI();
  musicStatus.textContent = "Song finished. Play it again ♡";
});

music.addEventListener("error", () => {
  const code = music.error ? music.error.code : 0;

  const errors = {
    1: "Audio loading was cancelled.",
    2: "Could not load the music file. Check the path.",
    3: "The MP3 could not be decoded.",
    4: "Audio file not found or unsupported."
  };

  musicStatus.textContent =
    errors[code] || "Music error. Check your MP3 file and filename.";

  console.error("Audio element error:", music.error);
});

volume.addEventListener("input", () => {
  music.volume = Number(volume.value);
  isMuted = music.volume === 0;
  music.muted = isMuted;
  muteMusic.textContent = isMuted ? "×" : "♫";
});

muteMusic.addEventListener("click", () => {
  if (!isMuted && music.volume > 0) {
    previousVolume = music.volume;
    music.volume = 0;
    volume.value = "0";
    isMuted = true;
  } else {
    music.volume = previousVolume || 0.8;
    volume.value = String(music.volume);
    isMuted = false;
  }

  music.muted = isMuted;
  muteMusic.textContent = isMuted ? "×" : "♫";
});

restartMusic.addEventListener("click", () => {
  music.currentTime = 0;
  startMusic();
});

progressTrack.addEventListener("click", (event) => {
  if (!Number.isFinite(music.duration) || music.duration <= 0) return;

  const rect = progressTrack.getBoundingClientRect();
  const fraction = Math.max(
    0,
    Math.min(1, (event.clientX - rect.left) / rect.width)
  );

  music.currentTime = fraction * music.duration;
});

// ---------------------------------------------
// 2. OPEN THE SURPRISE
// ---------------------------------------------

const openSurprise = document.getElementById("openSurprise");
const surpriseSection = document.getElementById("surprise");

openSurprise.addEventListener("click", () => {
  surpriseSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  showToast("A little surprise, made just for you ♡");
  burstParticles(window.innerWidth / 2, window.innerHeight / 2, 45);
});

// ---------------------------------------------
// 3. RANDOM BIRTHDAY WISHES
// ---------------------------------------------

const wishes = [
  "May this year bring you happiness you never expected.",
  "May your dreams become plans, and your plans become memories.",
  "You deserve little moments that turn into your favourite memories.",
  "May you always find a reason to smile, even on ordinary days.",
  "Here is to new beginnings, beautiful adventures, and endless joy.",
  "May the kindness you give return to you in the most beautiful ways."
];

let previousWish = -1;

document.getElementById("newWish").addEventListener("click", () => {
  let index;

  do {
    index = Math.floor(Math.random() * wishes.length);
  } while (index === previousWish && wishes.length > 1);

  previousWish = index;

  const wishText = document.getElementById("wishText");
  wishText.textContent = wishes[index];

  burstParticles(window.innerWidth / 2, window.innerHeight / 2, 15);
});

// ---------------------------------------------
// 4. BIRTHDAY CAKE CANDLE
// ---------------------------------------------

const cakeButton = document.getElementById("cakeButton");
const flame = document.getElementById("flame");
const cakeMessage = document.getElementById("cakeMessage");

let candleOff = false;

cakeButton.addEventListener("click", () => {
  candleOff = !candleOff;
  flame.classList.toggle("off", candleOff);

  if (candleOff) {
    cakeMessage.textContent = "YOUR WISH IS OUT IN THE UNIVERSE ✨";
    burstParticles(window.innerWidth / 2, window.innerHeight / 2, 55);
    showToast("May your wish come true ♡");
  } else {
    cakeMessage.textContent = "YOUR WISH IS WAITING ♡";
  }
});

// ---------------------------------------------
// 5. STAR-CATCHING MINI GAME
// ---------------------------------------------

const gameArea = document.getElementById("gameArea");
const gameIntro = document.getElementById("gameIntro");
const startGame = document.getElementById("startGame");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const gameMessage = document.getElementById("gameMessage");

let score = 0;
let timeLeft = 15;
let gameActive = false;
let gameInterval = null;
let starTimeout = null;

function removeGameStar() {
  const star = gameArea.querySelector(".game-star");
  if (star) star.remove();
}

function spawnStar() {
  if (!gameActive) return;

  removeGameStar();

  const star = document.createElement("button");
  star.className = "game-star";
  star.type = "button";
  star.textContent = "✦";
  star.setAttribute("aria-label", "Catch star");

  const maxX = Math.max(0, gameArea.clientWidth - 48);
  const maxY = Math.max(0, gameArea.clientHeight - 48);

  star.style.left = `${Math.random() * maxX}px`;
  star.style.top = `${Math.random() * maxY}px`;

  star.addEventListener("click", () => {
    if (!gameActive) return;

    score += 1;
    scoreDisplay.textContent = String(score);

    const rect = star.getBoundingClientRect();
    burstParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);

    removeGameStar();
    clearTimeout(starTimeout);
    spawnStar();
  });

  gameArea.appendChild(star);

  starTimeout = setTimeout(() => {
    removeGameStar();
    spawnStar();
  }, 1100);
}

function endGame() {
  gameActive = false;
  clearInterval(gameInterval);
  clearTimeout(starTimeout);
  removeGameStar();

  gameMessage.textContent =
    `You collected ${score} star${score === 1 ? "" : "s"}! ✨`;

  gameIntro.style.display = "flex";
  gameIntro.innerHTML = `
    <span>✦</span>
    <p>You collected ${score} magical star${score === 1 ? "" : "s"}!</p>
    <button class="gold-button" id="playAgain">PLAY AGAIN</button>
  `;

  document.getElementById("playAgain").addEventListener("click", beginGame);
}

function beginGame() {
  clearInterval(gameInterval);
  clearTimeout(starTimeout);

  score = 0;
  timeLeft = 15;
  gameActive = true;

  scoreDisplay.textContent = "0";
  timerDisplay.textContent = "15";
  gameMessage.textContent = "Catch as many stars as you can!";
  gameIntro.style.display = "none";

  removeGameStar();
  spawnStar();

  gameInterval = setInterval(() => {
    timeLeft -= 1;
    timerDisplay.textContent = String(timeLeft);

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

startGame.addEventListener("click", beginGame);

// ---------------------------------------------
// 6. FINAL BIRTHDAY WISH
// ---------------------------------------------

const finalButton = document.getElementById("finalButton");
const finalMessage = document.getElementById("finalMessage");

finalButton.addEventListener("click", () => {
  finalMessage.textContent =
    "Happy Birthday! Keep smiling, keep shining, always. ♡";

  burstParticles(window.innerWidth / 2, window.innerHeight / 2, 70);
  showToast("Sending you a little golden magic ✨");
});

// ---------------------------------------------
// 7. TOAST NOTIFICATIONS
// ---------------------------------------------

const toast = document.getElementById("toast");
let toastTimeout;

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// ---------------------------------------------
// 8. GOLDEN PARTICLE BACKGROUND
// ---------------------------------------------

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];
let canvasWidth = 0;
let canvasHeight = 0;
let particleFrame = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);

  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;

  canvas.width = Math.floor(canvasWidth * ratio);
  canvas.height = Math.floor(canvasHeight * ratio);

  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createParticle(x, y, burst = false) {
  return {
    x,
    y,
    vx: burst ? (Math.random() - 0.5) * 5 : (Math.random() - 0.5) * 0.3,
    vy: burst ? (Math.random() - 0.5) * 5 : -0.15 - Math.random() * 0.45,
    size: burst ? 1 + Math.random() * 3 : 0.5 + Math.random() * 1.8,
    life: burst ? 45 + Math.random() * 35 : 200 + Math.random() * 200,
    maxLife: burst ? 80 : 400,
    alpha: 0.3 + Math.random() * 0.6,
    burst
  };
}

function burstParticles(x, y, amount = 30) {
  for (let i = 0; i < amount; i++) {
    particles.push(createParticle(x, y, true));
  }

  if (particles.length > 500) {
    particles.splice(0, particles.length - 500);
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  particleFrame++;

  if (particleFrame % 4 === 0 && particles.length < 100) {
    particles.push(
      createParticle(Math.random() * canvasWidth, canvasHeight + 5)
    );
  }

  particles = particles.filter((p) => p.life > 0);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;

    const opacity = Math.min(p.alpha, p.life / 30);

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(230, 190, 105, ${opacity})`;
    ctx.fill();
  }

  requestAnimationFrame(animateParticles);
}

resizeCanvas();
animateParticles();

window.addEventListener("resize", resizeCanvas);

// Set the initial player state.
updateMusicUI();
