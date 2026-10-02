const $ = (id) => document.getElementById(id);
const sky = $('sky'), cat = $('cat'), stage = $('stage');
const eyes = { open: $('eyes-open'), closed: $('eyes-closed'), happy: $('eyes-happy') };
const blush = $('blush'), bubble = $('bubble');
const timeEl = $('time'), dateEl = $('date'), moodEl = $('mood');
const digital = $('digital'), analog = $('analog');
const handH = $('hand-h'), handM = $('hand-m'), handS = $('hand-s');
const alarmInfo = $('alarm-info'), dlg = $('alarm-dialog');
const ringing = $('ringing');

const hariID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const bulanID = ['Januari','Februari','Maret','April','Mei','Juni',
                 'Juli','Agustus','September','Oktober','November','Desember'];

/* ---------- suara meong (disintesis, tanpa file audio) ---------- */
let ctx = null;
function audio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function meong(pitch = 1, dur = 0.55) {
  const a = audio(), t = a.currentTime;
  const osc = a.createOscillator();
  const formant = a.createBiquadFilter();
  const gain = a.createGain();
  osc.type = 'sawtooth';
  // "mi-aaa-uw": naik lalu turun
  osc.frequency.setValueAtTime(520 * pitch, t);
  osc.frequency.linearRampToValueAtTime(820 * pitch, t + dur * 0.35);
  osc.frequency.linearRampToValueAtTime(480 * pitch, t + dur);
  formant.type = 'bandpass';
  formant.Q.value = 4;
  formant.frequency.setValueAtTime(900, t);
  formant.frequency.linearRampToValueAtTime(1800, t + dur * 0.4);
  formant.frequency.linearRampToValueAtTime(700, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.5, t + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(formant).connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}
function purr(dur = 1.2) {
  const a = audio(), t = a.currentTime;
  const osc = a.createOscillator(), lfo = a.createOscillator();
  const gain = a.createGain(), lfoGain = a.createGain();
  osc.type = 'sawtooth'; osc.frequency.value = 26;
  lfo.frequency.value = 3; lfoGain.gain.value = 0.08;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.12, t + 0.2);
  gain.gain.linearRampToValueAtTime(0.0001, t + dur);
  lfo.connect(lfoGain).connect(gain.gain);
  osc.connect(gain).connect(a.destination);
  osc.start(t); lfo.start(t);
  osc.stop(t + dur); lfo.stop(t + dur);
}

/* ---------- tampilan mata ---------- */
function setEyes(mode) {
  for (const k in eyes) eyes[k].style.display = k === mode ? '' : 'none';
}
function say(text, ms = 1400) {
  bubble.textContent = text;
  bubble.classList.add('show');
  clearTimeout(say.t);
  say.t = setTimeout(() => bubble.classList.remove('show'), ms);
}

/* ---------- interaksi: ketuk = meong, usap = elus ---------- */
let petDist = 0, lastX = null, lastY = null, petting = false, petTimer = null, downAt = 0;

cat.addEventListener('pointerdown', (e) => {
  cat.setPointerCapture(e.pointerId);
  lastX = e.clientX; lastY = e.clientY; petDist = 0; downAt = Date.now();
});
cat.addEventListener('pointermove', (e) => {
  if (lastX === null) return;
  petDist += Math.hypot(e.clientX - lastX, e.clientY - lastY);
  lastX = e.clientX; lastY = e.clientY;
  if (petDist > 60 && !petting) startPet();
  if (petting) { clearTimeout(petTimer); petTimer = setTimeout(stopPet, 600); }
});
cat.addEventListener('pointerup', () => {
  const tap = petDist < 15 && Date.now() - downAt < 400;
  lastX = lastY = null;
  if (tap) tapCat();
});
cat.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapCat(); }
});
cat.tabIndex = 0;

function tapCat() {
  if (isSleeping()) {
    meong(0.8, 0.4);
    say('Hmm... ngantuk 💤');
    return;
  }
  meong(0.9 + Math.random() * 0.3);
  cat.classList.remove('jump'); void cat.offsetWidth; cat.classList.add('jump');
  say(['Meong!', 'Miaw~', 'Nyaa!', 'Meong? 🐟'][Math.floor(Math.random() * 4)]);
  if (navigator.vibrate) navigator.vibrate(30);
}
function startPet() {
  petting = true;
  cat.classList.add('petted');
  setEyes('happy');
  blush.style.display = '';
  say('Purrr... 😻', 2000);
  purr(1.5);
  petTimer = setTimeout(stopPet, 600);
}
function stopPet() {
  petting = false;
  cat.classList.remove('petted');
  blush.style.display = 'none';
  setEyes(isSleeping() ? 'closed' : 'open');
}

/* ---------- jam, langit, mood ---------- */
function moodTeks(j) {
  if (j >= 5 && j < 10)  return 'Pagi semangat! 🌱';
  if (j >= 10 && j < 12) return 'Hampir siang, tetap semangat!';
  if (j >= 12 && j < 15) return 'Selamat siang, jangan lupa makan 😸';
  if (j >= 15 && j < 18) return 'Sore santai ~';
  if (j >= 18 && j < 21) return 'Selamat malam 🌙';
  return 'Waktunya tidur, selamat istirahat 💤';
}
function faseLangit(j) {
  if (j >= 5 && j < 8)   return 'dawn';
  if (j >= 8 && j < 17)  return 'day';
  if (j >= 17 && j < 19) return 'dusk';
  return 'night';
}
const isSleeping = () => { const j = new Date().getHours(); return j >= 21 || j < 5; };

// garis menit/jam di jam analog
(function buildTicks() {
  const g = $('ticks'), ns = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 60; i++) {
    const big = i % 5 === 0, l = document.createElementNS(ns, 'line');
    l.setAttribute('x1', 100); l.setAttribute('y1', big ? 12 : 10);
    l.setAttribute('x2', 100); l.setAttribute('y2', big ? 24 : 16);
    l.setAttribute('stroke', '#f3d6b0');
    l.setAttribute('stroke-width', big ? 3 : 1);
    l.setAttribute('transform', `rotate(${i * 6} 100 100)`);
    g.appendChild(l);
  }
})();

const pad = (n) => String(n).padStart(2, '0');

function update() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();

  timeEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  handH.setAttribute('transform', `rotate(${(h % 12) * 30 + m * 0.5} 100 100)`);
  handM.setAttribute('transform', `rotate(${m * 6 + s * 0.1} 100 100)`);
  handS.setAttribute('transform', `rotate(${s * 6} 100 100)`);
  analog.setAttribute('aria-label', `Jam analog, pukul ${pad(h)}.${pad(m)}`);

  dateEl.textContent = `${hariID[now.getDay()]}, ${now.getDate()} ${bulanID[now.getMonth()]} ${now.getFullYear()}`;
  moodEl.textContent = moodTeks(h);
  sky.className = 'sky ' + faseLangit(h);

  const tidur = isSleeping();
  cat.classList.toggle('sleeping', tidur);
  stage.classList.toggle('sleeping', tidur);
  if (!petting) setEyes(tidur ? 'closed' : 'open');

  checkAlarm(now);
}

let lastBlink = 0;
function tick() {
  update();
  const t = Date.now();
  if (!petting && !isSleeping() && t - lastBlink > 2200 + Math.random() * 2500) {
    setEyes('closed');
    setTimeout(() => { if (!petting && !isSleeping()) setEyes('open'); }, 160);
    lastBlink = t;
  }
}

/* ---------- mode analog / digital (disimpan) ---------- */
function setMode(mode) {
  const isAnalog = mode === 'analog';
  analog.hidden = !isAnalog;
  digital.hidden = isAnalog;
  $('btn-mode').textContent = isAnalog ? '🔢' : '🕰️';
  localStorage.setItem('mode', mode);
}
$('btn-mode').addEventListener('click', () => setMode(analog.hidden ? 'analog' : 'digital'));
setMode(localStorage.getItem('mode') || 'digital');

/* ---------- alarm ---------- */
const alarm = JSON.parse(localStorage.getItem('alarm') || '{"time":"06:00","on":false}');
let snoozeUntil = 0, firedKey = '', ringLoop = null, wakeLock = null;

function saveAlarm() {
  localStorage.setItem('alarm', JSON.stringify(alarm));
  alarmInfo.textContent = alarm.on ? `⏰ Alarm ${alarm.time}` : '';
  keepAwake(alarm.on);
}

// jaga layar tetap nyala selama alarm aktif (alarm web cuma jalan saat app terbuka)
async function keepAwake(on) {
  try {
    if (on && !wakeLock && 'wakeLock' in navigator && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if (!on && wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch { /* tidak didukung / ditolak: abaikan */ }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') keepAwake(alarm.on);
});

function checkAlarm(now) {
  if (ringLoop) return;
  if (snoozeUntil && now.getTime() >= snoozeUntil) {
    snoozeUntil = 0;
    startRing();
    return;
  }
  if (!alarm.on) return;
  const hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const key = now.toDateString() + hm;
  if (hm === alarm.time && firedKey !== key) {
    firedKey = key;
    startRing();
  }
}

function startRing() {
  ringing.hidden = false;
  $('btn-stop').focus();
  const ring = () => {
    meong(1.1, 0.5);
    setTimeout(() => meong(1.25, 0.45), 600);
    if (navigator.vibrate) navigator.vibrate([300, 200, 300]);
  };
  ring();
  ringLoop = setInterval(ring, 1800);
}
function stopRing() {
  clearInterval(ringLoop);
  ringLoop = null;
  ringing.hidden = true;
  if (navigator.vibrate) navigator.vibrate(0);
}

$('btn-stop').addEventListener('click', () => {
  stopRing();
  say('Selamat pagi! 😺', 2500);
});
$('btn-snooze').addEventListener('click', () => {
  stopRing();
  snoozeUntil = Date.now() + 5 * 60 * 1000;
  alarmInfo.textContent = '⏰ Ditunda 5 menit';
});

$('btn-alarm').addEventListener('click', () => {
  $('alarm-time').value = alarm.time;
  $('alarm-on').checked = alarm.on;
  dlg.showModal();
});
$('btn-test').addEventListener('click', () => meong());
dlg.addEventListener('close', () => {
  if (dlg.returnValue !== 'save') return;
  alarm.time = $('alarm-time').value || '06:00';
  alarm.on = $('alarm-on').checked;
  audio(); // buka kunci audio lewat sentuhan user, supaya alarm bisa bunyi nanti
  saveAlarm();
  if (alarm.on) say(`Oke, bangunin jam ${alarm.time} 🐾`, 2500);
});

/* ---------- mulai ---------- */
saveAlarm();
update();
setInterval(tick, 1000);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
