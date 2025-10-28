const apiKey = 'AIzaSyAWOPpR3OTlNB3z_OrZ2ZDk9ThPFDndvHo ';
let currentVideo = null;
let score = 0;

const videoThumb = document.getElementById('videoThumb');
const videoTitle = document.getElementById('videoTitle');
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const scoreDisplay = document.getElementById('score');

const avatarImg = document.getElementById('avatarImg');
const avatarText = document.getElementById('avatarText');

// Use only one avatar image
avatarImg.src = 'images/avatar.png';

// Confetti setup
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;
let confettiParticles = [];
let confettiInterval;

function createConfetti() {
  for (let i = 0; i < 150; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      r: Math.random() * 6 + 2,
      d: Math.random() * 20 + 10,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      tilt: Math.random() * 10 - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0
    });
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach(p => {
    ctx.beginPath();
    ctx.lineWidth = p.r;
    ctx.strokeStyle = p.color;
    ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
    ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
    ctx.stroke();
    p.tiltAngle += p.tiltAngleIncremental;
    p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
    p.x += Math.sin(0.01);
    p.tilt = Math.sin(p.tiltAngle) * 15;
    if (p.y > confettiCanvas.height) {
      p.y = -10;
      p.x = Math.random() * confettiCanvas.width;
    }
  });
}

function startConfetti() {
  createConfetti();
  confettiInterval = setInterval(drawConfetti, 20);
  setTimeout(stopConfetti, 3000);
}

function stopConfetti() {
  clearInterval(confettiInterval);
  confettiParticles = [];
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

// Fetch a random video
async function fetchRandomVideo() {
  const queries = ['music','fun','gaming','tech','comedy','travel','science'];
  const q = queries[Math.floor(Math.random()*queries.length)];

  try {
    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${q}&maxResults=20&key=${apiKey}`);
    const searchData = await searchRes.json();
    const randomVideo = searchData.items[Math.floor(Math.random() * searchData.items.length)];
    const videoId = randomVideo.id.videoId;

    const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${apiKey}`);
    const statsData = await statsRes.json();
    currentVideo = statsData.items[0];

    videoThumb.src = currentVideo.snippet.thumbnails?.medium?.url || currentVideo.snippet.thumbnails?.high?.url || '';
    videoTitle.textContent = currentVideo.snippet.title || 'Unknown';
    feedback.textContent = '';
    guessInput.value = '';
    avatarText.textContent = 'Type a guess...';
    avatarImg.style.animation = 'none';
    avatarImg.style.filter = 'none';
  } catch (err) {
    console.error(err);
    videoTitle.textContent = 'Failed to load video!';
    videoThumb.src = '';
  }
}

// Guess button logic
guessBtn.addEventListener('click', () => {
  const userGuess = parseInt(guessInput.value);
  if (!currentVideo || !userGuess) return;

  const actualViews = parseInt(currentVideo.statistics.viewCount);
  const diff = Math.abs(actualViews - userGuess);

  if (diff <= actualViews*0.1) {
    feedback.textContent = `🎉 Correct! Views: ${actualViews}`;
    score++;
    startConfetti();
  } else {
    feedback.textContent = `❌ Wrong! Views: ${actualViews}`;
  }
  scoreDisplay.textContent = `Score: ${score}`;
});

// Next video
nextBtn.addEventListener('click', fetchRandomVideo);

// Avatar reactions (lean, bounce, glow)
guessInput.addEventListener('input', () => {
  const userGuess = parseInt(guessInput.value);
  if (!currentVideo || !userGuess) {
    avatarText.textContent = 'Type a guess...';
    avatarImg.style.animation = 'none';
    avatarImg.style.filter = 'none';
    avatarImg.style.transform = 'none';
    return;
  }

  const actualViews = parseInt(currentVideo.statistics.viewCount);
  const diffRatio = Math.abs(actualViews - userGuess)/actualViews;

  if (diffRatio < 0.05) {
    avatarText.textContent = '🔥 Very close!';
    avatarImg.style.animation = 'lean-forward 0.5s infinite';
    avatarImg.style.filter = 'drop-shadow(0 0 10px gold)';
  } else if (diffRatio < 0.15) {
    avatarText.textContent = '🙂 Getting close!';
    avatarImg.style.animation = 'bounce-small 0.5s infinite';
    avatarImg.style.filter = 'drop-shadow(0 0 5px lightgreen)';
  } else {
    avatarText.textContent = '😬 Far off!';
    avatarImg.style.animation = 'none';
    avatarImg.style.filter = 'none';
    avatarImg.style.transform = 'none';
  }
});

// Load first video
fetchRandomVideo();
