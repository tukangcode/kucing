const $ = (id) => document.getElementById(id);
const sky    = $('sky');
const cat    = $('cat');
const stage  = document.querySelector('.cat-stage');
const eyesOpen  = $('eyes-open');
const eyesClosed= $('eyes-closed');
const timeEl  = $('time');
const dateEl  = $('date');
const moodEl  = $('mood');

const hariID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const bulanID = ['Januari','Februari','Maret','April','Mei','Juni',
                 'Juli','Agustus','September','Oktober','November','Desember'];

function moodTeks(jam) {
  if (jam >= 5 && jam < 10)  return 'Pagi semangat! 🌱';
  if (jam >= 10 && jam < 12) return 'Hampir siang, tetap semangat!';
  if (jam >= 12 && jam < 15) return 'Selamat siang, jangan lupa makan 😸';
  if (jam >= 15 && jam < 18) return 'Sore santai ~';
  if (jam >= 18 && jam < 22) return 'Selamat malam, selamat istirahat 🌙';
  return 'Waktunya tidur, selamat istirahat 💤';
}

function faseLangit(jam) {
  if (jam >= 5 && jam < 8)   return 'dawn';
  if (jam >= 8 && jam < 17) return 'day';
  if (jam >= 17 && jam < 19) return 'dusk';
  return 'night';
}

function sedangTidur(jam) {
  return jam >= 21 || jam < 5;
}

function kedip() {
  if (cat.classList.contains('sleeping')) return;
  eyesOpen.style.display = 'none';
  eyesClosed.style.display = '';
  setTimeout(() => {
    eyesOpen.style.display = '';
    eyesClosed.style.display = 'none';
  }, 160);
}

function update() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  timeEl.textContent =
    String(h).padStart(2,'0') + ':' +
    String(m).padStart(2,'0') + ':' +
    String(s).padStart(2,'0');

  dateEl.textContent =
    hariID[now.getDay()] + ', ' +
    now.getDate() + ' ' + bulanID[now.getMonth()] + ' ' +
    now.getFullYear();

  moodEl.textContent = moodTeks(h);

  sky.className = 'sky ' + faseLangit(h);

  const tidur = sedangTidur(h);
  cat.classList.toggle('sleeping', tidur);
  stage.classList.toggle('sleeping', tidur);
  eyesOpen.style.display  = tidur ? 'none' : '';
  eyesClosed.style.display= tidur ? '' : 'none';
}

// detak: update tiap detik, kedip acak
let lastBlink = 0;
function tick() {
  update();
  const now = Date.now();
  if (now - lastBlink > 2200 + Math.random() * 2500) {
    kedip();
    lastBlink = now;
  }
}
setInterval(tick, 1000);
update();

// service worker (PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
