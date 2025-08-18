/* ======================== STATE ======================== */
let selectedLang = localStorage.getItem('lang') || 'tr';
const savedTheme = localStorage.getItem('theme') || 'dark';

/* Tema geçişi — içerik kaybolmadan ve SENKRON */
function applyTheme(target){
  const html = document.documentElement;
  const current = html.getAttribute('data-theme') || 'dark';
  if (target === current) return;

  // Tüm içerik için geçişleri aç
  html.classList.add('theme-transition');

  // 1. rAF: temayı uygula (renkler akmaya başlasın)
  requestAnimationFrame(()=>{
    html.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
    updateThemeToggleVisual();

    // 2. rAF: overlay wipe animasyonunu aynı anda başlat
    requestAnimationFrame(()=>{
      const wipe = document.getElementById('theme-wipe');
      if (wipe){
        wipe.classList.remove('theme-wipe-anim'); void wipe.offsetWidth;
        wipe.classList.add('theme-wipe-anim');
        wipe.addEventListener('animationend', function done(){
          wipe.classList.remove('theme-wipe-anim');
          html.classList.remove('theme-transition');
          wipe.removeEventListener('animationend', done);
        });
      } else {
        setTimeout(()=>html.classList.remove('theme-transition'), 320);
      }
    });
  });
}

function updateThemeToggleVisual(){
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
}

/* Dil metinleri (overline + iki satır başlık + CTA) */
const WELCOME_TEXTS = {
  tr: {
    overline: "Burak Kaplan’dan",
    titleTop: "Kıble Bulucu’ya",
    titleBottom: "Hoş Geldiniz",
    cta: "Başlayalım",
    infoTitle: "Genel Bilgilendirme",
    infoBtn: "Teknik Detaylar",
    confirm: "Anladım",
    status: "Konum Alınıyor..."
  },
  en: {
    overline: "Burak Kaplan’s",
    titleTop: "Qibla Finder",
    titleBottom: "Welcome",
    cta: "Get Started",
    infoTitle: "General Info",
    infoBtn: "Technical Details",
    confirm: "Got it",
    status: "Getting Location..."
  }
};

function applyLang(lang){
  if (lang === selectedLang) return;

  const overEl   = document.getElementById('welcome-overline');
  const topEl    = document.getElementById('title-top');
  const bottomEl = document.getElementById('title-bottom');
  const ctaText  = document.getElementById('welcome-cta-text');

  const els = [overEl, topEl, bottomEl, ctaText];

  // silme animasyonu
  els.forEach(el => { el.classList.remove('text-wipe-in'); void el.offsetWidth; el.classList.add('text-wipe-out'); });

  const onEnd = () => {
    selectedLang = lang;
    localStorage.setItem('lang', selectedLang);
    const t = WELCOME_TEXTS[selectedLang];

    overEl.textContent   = t.overline;
    topEl.textContent    = t.titleTop;
    bottomEl.textContent = t.titleBottom;
    ctaText.textContent  = t.cta;

    els.forEach(el => { el.classList.remove('text-wipe-out'); void el.offsetWidth; el.classList.add('text-wipe-in'); });

    // Bayrak vurguları
    document.getElementById('btn-lang-tr').classList.toggle('is-active', selectedLang==='tr');
    document.getElementById('btn-lang-en').classList.toggle('is-active', selectedLang==='en');

    // Diğer metinler (info ekranı)
    document.getElementById("info-title").innerText     = t.infoTitle;
    document.getElementById("details-button").innerText = t.infoBtn;
    document.getElementById("confirm-button").innerText = t.confirm;
    document.getElementById("status").innerText         = t.status;

    topEl.removeEventListener('animationend', onEnd);
  };
  topEl.addEventListener('animationend', onEnd, { once:true });
}

/* ======================== WELCOME ======================== */
function initWelcome(){
  // İlk ziyaret: daima dark varsayılan; kayıtlı varsa onu aç
  document.documentElement.setAttribute('data-theme', savedTheme || 'dark');
  updateThemeToggleVisual();

  // TR dışı kayıt varsa uygula
  if (selectedLang !== 'tr'){ applyLang(selectedLang); }
  else {
    const t = WELCOME_TEXTS.tr;
    document.getElementById("info-title").innerText     = t.infoTitle;
    document.getElementById("details-button").innerText = t.infoBtn;
    document.getElementById("confirm-button").innerText = t.confirm;
    document.getElementById("status").innerText         = t.status;
  }

  // Tema butonu
  document.getElementById('theme-toggle')?.addEventListener('click', ()=>{
    const now = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(now === 'dark' ? 'light' : 'dark');
  });

  // Dil (bayrak) butonları
  document.getElementById('btn-lang-tr')?.addEventListener('click', ()=>applyLang('tr'));
  document.getElementById('btn-lang-en')?.addEventListener('click', ()=>applyLang('en'));

  // CTA → akışa geç
  document.getElementById('welcome-cta')?.addEventListener('click', ()=>{
    selectLanguage(selectedLang);
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('info-screen').style.display    = 'block';
  });
}

window.onload = () => {
  document.getElementById("welcome-screen").style.display = "flex";
  initWelcome();
};

/* ======================== INFO/DETAILS/APP ======================== */
function selectLanguage(lang) {
  selectedLang = lang;
  const texts = {
    tr: {
      info: `Bu uygulama, cihazınızın coğrafi konumuna göre Kâbe yönünü (Kıble) hesaplar.\n\nKıble açısı, gerçek kuzeye göre saat yönünde ölçülür.`,
      title: "Genel Bilgilendirme",
      confirm: "Anladım",
      details: "Teknik Detaylar",
      detailsTitle: "Teknik Detaylar",
      status: "Konum Alınıyor...",
      detailsHTML: `
        <p><strong>1. Elipsoit Modeli</strong> — WGS84</p>
        <p><strong>2. Girdiler</strong> — Kullanıcı (φ₁, λ₁), Kâbe: 21.4225°, 39.8262°</p>
        <p><strong>3. Kıble Açısı</strong><br>
        \\[ \\theta = \\arctan2( \\sin(\\Delta \\lambda), \\cos(\\phi_1) \\cdot \\tan(\\phi_2) - \\sin(\\phi_1) \\cdot \\cos(\\Delta \\lambda) ) \\]</p>
      `
    },
    en: {
      info: `This app computes the Qibla angle from your location.\n\nAngle is clockwise from true north.`,
      title: "General Info",
      confirm: "Got it",
      details: "Technical Details",
      detailsTitle: "Technical Details",
      status: "Getting Location...",
      detailsHTML: `
        <p><strong>1. Ellipsoid</strong> — WGS84</p>
        <p><strong>2. Inputs</strong> — User (φ₁, λ₁), Kaaba: 21.4225°, 39.8262°</p>
        <p><strong>3. Qibla Angle</strong><br>
        \\[ \\theta = \\arctan2( \\sin(\\Delta \\lambda), \\cos(\\phi_1) \\cdot \\tan(\\phi_2) - \\sin(\\phi_1) \\cdot \\cos(\\Delta \\lambda) ) \\]</p>
      `
    }
  };

  const t = texts[lang];
  document.getElementById("info-title").innerText     = t.title;
  document.getElementById("info-text").innerText      = t.info;
  document.getElementById("confirm-button").innerText = t.confirm;
  document.getElementById("details-button").innerText = t.details;
  document.getElementById("details-title").innerText  = t.detailsTitle;
  document.getElementById("status").innerText         = t.status;
  document.getElementById("details-content").innerHTML= t.detailsHTML;

  if (window.MathJax) MathJax.typesetPromise();
}

function showDetails() { document.getElementById("info-screen").style.display = "none"; document.getElementById("details-screen").style.display = "block"; }
function hideDetails() { document.getElementById("details-screen").style.display = "none"; document.getElementById("info-screen").style.display = "block"; }

function startApp() {
  document.getElementById("info-screen").style.display = "none";
  document.getElementById("main-app").style.display = "block";

  const kaabaLat = 21.4225, kaabaLon = 39.8262;

  document.getElementById("status").innerText =
    selectedLang === 'tr' ? "Konum Alınıyor..." : "Getting Location...";

  navigator.geolocation.getCurrentPosition(success, geoError);

  function success(pos) {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const acc = pos.coords.accuracy;

    document.getElementById("status").style.display = "none";
    document.getElementById("output").style.display = "block";

    const latLabel = selectedLang === 'tr' ? "Enlem" : "Latitude";
    const lonLabel = selectedLang === 'tr' ? "Boylam" : "Longitude";
    document.getElementById("location").innerText =
      `${latLabel}: ${lat.toFixed(6)}°, ${lonLabel}: ${lon.toFixed(6)}°`;

    const accLabel = selectedLang === 'tr' ? "Konum Doğruluğu" : "Location Accuracy";
    document.getElementById("accuracy").innerText =
      `${accLabel}: ±${acc.toFixed(1)} m`;

    fetch(`https://api.bur4kkaplan.com/qibla?lat=${lat}&lon=${lon}&acc=${acc}`)
      .then(res => res.json())
      .then(data => {
        const errLabel  = selectedLang === 'tr' ? "Tahmini Sapma" : "Estimated Error";
        const confLabel = selectedLang === 'tr' ? "Doğruluk Oranı" : "Confidence";
        const qiblaLabel= selectedLang === 'tr' ? "Kıble Yönü"   : "Qibla Direction";

        document.getElementById("error").innerText      = `${errLabel}: ±${parseFloat(data.error).toFixed(4)}°`;
        document.getElementById("confidence").innerText = `${confLabel}: ≈ %${parseFloat(data.confidence).toFixed(2)}`;
        document.getElementById("qibla").innerText      = `${qiblaLabel}: ${parseFloat(data.qibla).toFixed(4)}°`;

        // Declination'ı sakla (Android için mutlak başlık düzeltmesi)
        ARState.declination = (typeof data.declination === 'number') ? data.declination : 0;

        // AR düğmesi
        enableARButton(Number.parseFloat(data.qibla));
      });

    const map = L.map('map').setView([lat, lon], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18
    }).addTo(map);

    L.marker([lat, lon]).addTo(map).bindPopup(
      selectedLang === 'tr' ? "Konumunuz" : "Your Location"
    ).openPopup();

    const kaabaIcon = L.divIcon({ html: '🕋', iconSize: [32, 32], className: 'kaaba-marker' });
    L.marker([kaabaLat, kaabaLon], { icon: kaabaIcon }).addTo(map).bindPopup(
      selectedLang === 'tr' ? "Kâbe" : "Kaaba"
    );
    L.polyline([[lat, lon], [kaabaLat, kaabaLon]], { color: 'red', weight: 3 }).addTo(map);
  }

  function geoError(err) {
    const msg = selectedLang === 'tr'
      ? "Konum alınamadı: " + err.message
      : "Location error: " + err.message;
    document.getElementById("status").innerText = msg;
  }
}

/* ======================== AR / CALIBRATION ======================== */
const UA = navigator.userAgent || navigator.vendor || '';
const IS_ANDROID = /Android/i.test(UA);

const ARState = {
  supported: false,
  qiblaAngle: null,
  heading: null,
  smoothHeading: null,
  stream: null,
  havePermission: false,
  headingBias: parseFloat(localStorage.getItem('headingBias') || '0'),
  declination: 0,
  lastSamples: [],
  maxSamples: 9,
  tiltOK: true,
  useAbsolute: false,
  orientationAbsHandler: null,
  orientationRelHandler: null,
  rafId: null,
  lastFrameTime: 0,
  needsUpdate: false
};

const DELTA_GREEN_MAX = 5;
const DELTA_YELLOW_MAX = 15;

const startArBtn     = document.getElementById('start-ar-btn');
const calibScreen    = document.getElementById('calibration-screen');
let   calibDoneBtn   = document.getElementById('calibration-done-btn');
let   calibCancelBtn = document.getElementById('calibration-cancel-btn');

const arContainer = document.getElementById('ar-container');
const arVideo     = document.getElementById('ar-video');
const arArrow     = document.getElementById('ar-arrow');
const hudHeading  = document.getElementById('hud-heading');
const hudQibla    = document.getElementById('hud-qibla');
const hudDelta    = document.getElementById('hud-delta');
const arExitBtn   = document.getElementById('ar-exit-btn');

function norm360(x){ x%=360; return x<0? x+360 : x; }
function clamp01(v){ return Math.max(0, Math.min(1, v)); }
function shortestDelta(a, b){ let d=(a-b)%360; if(d>180)d-=360; if(d<-180)d+=360; return d; }
function median(arr){ const a=[...arr].sort((x,y)=>x-y); const m=Math.floor(a.length/2); return arr.length%2?a[m]:(a[m-1]+a[m])/2; }

const DEG2RAD = Math.PI / 180;
function tiltCompensatedHeading(alpha, beta, gamma) {
  const _x = (beta  || 0) * DEG2RAD;
  const _y = (gamma || 0) * DEG2RAD;
  const _z = (alpha || 0) * DEG2RAD;

  const cX = Math.cos(_x), cY = Math.cos(_y), cZ = Math.cos(_z);
  const sX = Math.sin(_x), sY = Math.sin(_y), sZ = Math.sin(_z);

  const Vx = -cZ * sY - sZ * sX * cY;
  const Vy = -sZ * sY + cZ * sX * cY;

  let heading = Math.atan2(Vx, Vy) * (180 / Math.PI);
  if (heading < 0) heading += 360;

  const screenAngle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
  heading = norm360(heading + screenAngle);
  return heading;
}

function isARSupported() {
  const hasOrientation = typeof window.DeviceOrientationEvent !== 'undefined';
  const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  return hasOrientation && hasMedia;
}
async function ensureOrientationPermission() {
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      const res = await DeviceOrientationEvent.requestPermission();
      return res === 'granted';
    }
    return true;
  } catch {
    return false;
  }
}
async function openCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
  arVideo.srcObject = stream;
  await arVideo.play().catch(()=>{});
}
function closeCamera() {
  const stream = arVideo.srcObject;
  if (stream) stream.getTracks().forEach(t => t.stop());
  arVideo.srcObject = null;
}

/* ORIENTATION LISTENERS */
function startOrientationListener() {
  const handler = (e) => {
    const betaRaw  = (typeof e.beta  === 'number') ? e.beta  : 0;
    const gammaRaw = (typeof e.gamma === 'number') ? e.gamma : 0;
    const betaAbs  = Math.abs(betaRaw);
    const gammaAbs = Math.abs(gammaRaw);
    ARState.tiltOK = (betaAbs < 55 && gammaAbs < 55);

    let heading;
    let isiOSTrue = false;

    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) {
      heading = e.webkitCompassHeading;
      isiOSTrue = true;
    } else if (typeof e.alpha === 'number') {
      heading = tiltCompensatedHeading(e.alpha, betaRaw, gammaRaw);
    } else return;

    if (!isiOSTrue) heading = norm360(heading + (ARState.declination || 0));

    pushHeadingSample(heading, betaAbs, gammaAbs);
  };

  ARState.orientationAbsHandler = handler;
  ARState.orientationRelHandler = handler;

  window.addEventListener('deviceorientationabsolute', ARState.orientationAbsHandler, true);
  window.addEventListener('deviceorientation',          ARState.orientationRelHandler, true);

  startRenderLoop();
}
function stopOrientationListener() {
  if (ARState.orientationAbsHandler) window.removeEventListener('deviceorientationabsolute', ARState.orientationAbsHandler, true);
  if (ARState.orientationRelHandler) window.removeEventListener('deviceorientation', ARState.orientationRelHandler, true);
  ARState.orientationAbsHandler = ARState.orientationRelHandler = null;
  stopRenderLoop();
}

/* FILTER */
function pushHeadingSample(heading, betaAbs, gammaAbs) {
  ARState.lastSamples.push(heading);
  if (ARState.lastSamples.length > ARState.maxSamples) ARState.lastSamples.shift();

  const med  = median(ARState.lastSamples);
  const prev = (ARState.smoothHeading ?? med);
  const diff = Math.abs(shortestDelta(med, prev));

  let alpha = (diff > 10) ? 0.08 : (diff > 5 ? 0.12 : 0.18);
  if (ARState.smoothHeading == null) ARState.smoothHeading = med;
  else ARState.smoothHeading = norm360(prev + alpha * shortestDelta(med, prev));

  ARState.heading = heading;
  ARState.needsUpdate = true;
}

/* RENDER LOOP */
function startRenderLoop() {
  if (ARState.rafId) return;
  const targetMs = 1000 / 60;
  const tick = (ts) => {
    if (!ARState.rafId) return;
    if (!ARState.lastFrameTime || (ts - ARState.lastFrameTime) >= targetMs) {
      ARState.lastFrameTime = ts;
      if (ARState.needsUpdate) { ARState.needsUpdate = false; updateARUI(); }
    }
    ARState.rafId = requestAnimationFrame(tick);
  };
  ARState.rafId = requestAnimationFrame(tick);
}
function stopRenderLoop() {
  if (ARState.rafId) cancelAnimationFrame(ARState.rafId);
  ARState.rafId = 0; ARState.lastFrameTime = 0; ARState.needsUpdate = false;
}

/* UI UPDATE */
function updateARUI() {
  if (ARState.qiblaAngle == null || ARState.smoothHeading == null) return;

  const heading = ARState.smoothHeading;
  const qibla   = ARState.qiblaAngle;
  const rawDelta = (qibla - heading + 360) % 360;

  const arMat = document.getElementById('ar-mat');
  if (arMat) {
    arMat.style.transform = `translate(-50%, -50%) perspective(800px) rotateX(58deg) rotate(${rawDelta}deg)`;
  }
  arArrow.style.transform = `translate(-50%, -50%) rotate(${rawDelta}deg)`;

  arArrow.classList.remove('arrow-green','arrow-yellow','arrow-red');
  if (rawDelta < DELTA_GREEN_MAX || rawDelta > (360 - DELTA_GREEN_MAX))      arArrow.classList.add('arrow-green');
  else if (rawDelta < DELTA_YELLOW_MAX || rawDelta > (360 - DELTA_YELLOW_MAX))arArrow.classList.add('arrow-yellow');
  else                                                                         arArrow.classList.add('arrow-red');

  hudHeading.textContent = `${selectedLang === 'tr' ? 'Yön' : 'Heading'}: ${heading.toFixed(0)}°`;
  hudQibla.textContent   = `${selectedLang === 'tr' ? 'Kıble' : 'Qibla'}: ${qibla.toFixed(0)}°`;
  const deltaForUser = rawDelta <= 180 ? rawDelta : 360 - rawDelta;
  hudDelta.textContent    = `${selectedLang === 'tr' ? 'Fark' : 'Delta'}: ${deltaForUser.toFixed(0)}°`;
}

/* KALİBRASYON (özet akış) */
const Cal = { active:false, startTime:0, handler:null, ui:{} };

function initCalibrationUI() {
  const screen = document.getElementById('calibration-screen');
  const content = screen.querySelector('.modal-content');
  if (!content.querySelector('#calib-ui')) {
    const ui = document.createElement('div');
    ui.id = 'calib-ui';
    ui.innerHTML = `
      <div class="calib-steps">
        <div class="calib-step" id="calib-step-yaw">
          <div class="calib-anim yaw-spin"></div>
          <div class="calib-label">${selectedLang==='tr'?'Yatay döndür':'Spin horizontally'}</div>
        </div>
        <div class="calib-step" id="calib-step-pitch">
          <div class="calib-anim pitch-tilt"></div>
          <div class="calib-label">${selectedLang==='tr'?'Öne-arkaya eğ':'Tilt up/down'}</div>
        </div>
        <div class="calib-step" id="calib-step-roll">
          <div class="calib-anim roll-tilt"></div>
          <div class="calib-label">${selectedLang==='tr'?'Sağa-sola eğ':'Tilt left/right'}</div>
        </div>
      </div>

      <div class="calib-progress" aria-label="Calibration progress">
        <div class="calib-bar" id="calib-bar" style="width:0%"></div>
      </div>

      <div class="quality-line">
        <span id="quality-badge" class="quality-badge bad">${selectedLang==='tr'?'Kalite: Düşük':'Quality: Low'}</span>
        <span id="quality-hint" class="quality-hint">${selectedLang==='tr'?'Telefonu üç eksende hareket ettir':'Move phone on all 3 axes'}</span>
      </div>`;
    const btnRow = content.querySelector('.center-buttons');
    content.insertBefore(ui, btnRow);
  }

  Cal.ui = {
    stepYaw:   content.querySelector('#calib-step-yaw'),
    stepPitch: content.querySelector('#calib-step-pitch'),
    stepRoll:  content.querySelector('#calib-step-roll'),
    bar:   content.querySelector('#calib-bar'),
    badge: content.querySelector('#quality-badge'),
    hint:  content.querySelector('#quality-hint')
  };

  const doneBtn = document.getElementById('calibration-done-btn');
  if (doneBtn) doneBtn.disabled = true;
}

function startCalibration() {
  Cal.active = true;
  Cal.startTime = performance.now();

  Cal.handler = (e) => {
    const alpha = (typeof e.alpha==='number') ? e.alpha : null;
    const beta  = (typeof e.beta ==='number') ? e.beta  : 0;
    const gamma = (typeof e.gamma==='number') ? e.gamma : 0;

    const yawOK   = alpha != null ? true : false;
    const pitchOK = Math.abs(beta)  >  0;
    const rollOK  = Math.abs(gamma) >  0;

    if (yawOK)   Cal.ui.stepYaw.classList.add('done');
    if (pitchOK) Cal.ui.stepPitch.classList.add('done');
    if (rollOK)  Cal.ui.stepRoll.classList.add('done');

    // basit ilerleme
    const doneCount = (+Cal.ui.stepYaw.classList.contains('done')) + (+Cal.ui.stepPitch.classList.contains('done')) + (+Cal.ui.stepRoll.classList.contains('done'));
    const prog = Math.round((doneCount/3)*100);
    Cal.ui.bar.style.width = `${prog}%`;

    let qualityClass='bad', qualityText = selectedLang==='tr'?'Kalite: Düşük':'Quality: Low';
    if (prog>=60){ qualityClass='ok'; qualityText=selectedLang==='tr'?'Kalite: Orta':'Quality: Medium'; }
    if (prog>=85){ qualityClass='good'; qualityText=selectedLang==='tr'?'Kalite: Yüksek':'Quality: High'; }
    Cal.ui.badge.className = `quality-badge ${qualityClass}`;
    Cal.ui.badge.textContent = qualityText;

    const doneBtn = document.getElementById('calibration-done-btn');
    if (doneBtn){
      const minDurationOK = (performance.now() - Cal.startTime) > 5000;
      doneBtn.disabled = !(prog >= 85 && minDurationOK);
    }
  };

  window.addEventListener('deviceorientation', Cal.handler, true);
}

function stopCalibration() {
  Cal.active = false;
  if (Cal.handler) {
    window.removeEventListener('deviceorientation', Cal.handler, true);
    Cal.handler = null;
  }
}

/* AKIŞ KONTROL */
function androidNoticeText() {
  return (selectedLang === 'tr')
    ? 'ÖNEMLİ: Android cihazlarda AR pusula doğruluğu geliştirme aşamasındadır. Sonuçlar cihaza ve ortama göre değişebilir.'
    : 'IMPORTANT: On Android devices, AR compass accuracy is under active development. Results may vary by device and environment.';
}
function showCalibration() {
  const noticeEl = document.getElementById('android-notice');
  if (noticeEl) {
    if (IS_ANDROID) { noticeEl.textContent = androidNoticeText(); noticeEl.classList.remove('hidden'); }
    else { noticeEl.classList.add('hidden'); noticeEl.textContent=''; }
  }
  calibScreen.classList.remove('hidden');
  calibScreen.setAttribute('aria-hidden','false');
}
function hideCalibration() {
  calibScreen.classList.add('hidden');
  calibScreen.setAttribute('aria-hidden','true');
}

function showAR() {
  document.body.classList.add('ar-mode');
  arContainer.classList.remove('hidden');
  arContainer.setAttribute('aria-hidden','false');
}
function hideAR() {
  document.body.classList.remove('ar-mode');
  arContainer.classList.add('hidden');
  arContainer.setAttribute('aria-hidden','true');
}

async function startARFlow() {
  if (!isARSupported()) {
    alert(selectedLang === 'tr' ? 'Bu cihaz AR modunu desteklemiyor.' : 'This device does not support AR mode.');
    return;
  }

  const perm = await ensureOrientationPermission();
  if (!perm) {
    alert(selectedLang === 'tr'
      ? 'Pusula erişimi reddedildi. Lütfen tarayıcı ayarlarından hareket/yön erişimine izin verin.'
      : 'Compass access denied. Please allow motion/orientation access in your browser settings.');
    return;
  }

  if (ARState.qiblaAngle == null) {
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 })
      );
      const { latitude: lat, longitude: lon, accuracy: acc } = pos.coords;
      const resp = await fetch(`https://api.bur4kkaplan.com/qibla?lat=${lat}&lon=${lon}&acc=${acc}`);
      const data = await resp.json();
      ARState.qiblaAngle = parseFloat(data.qibla);
      ARState.declination = (typeof data.declination === 'number') ? data.declination : 0;
    } catch {
      alert(selectedLang === 'tr' ? 'Konum veya kıble hesaplaması alınamadı.' : 'Could not get location or qibla angle.');
      return;
    }
  }

  initCalibrationUI();
  startCalibration();
  showCalibration();
}

async function beginRealAR() {
  try {
    const bar = document.getElementById('calib-bar');
    const doneBtn = document.getElementById('calibration-done-btn');
    const minDurationOK = (performance.now() - Cal.startTime) > 5000;
    const progNow = parseInt(bar?.style.width || '0', 10);
    if (!minDurationOK || progNow < 85 || doneBtn?.disabled) {
      alert(selectedLang === 'tr' ? 'Kalibrasyon henüz tamamlanmadı.' : 'Calibration is not complete yet.');
      return;
    }

    stopCalibration();

    const perm = await ensureOrientationPermission();
    if (!perm) { alert(selectedLang === 'tr' ? 'Pusula erişimi reddedildi.' : 'Compass access was denied.'); return; }

    await openCamera();
    startOrientationListener();

    hideCalibration();
    showAR();
    ARState.needsUpdate = true;
  } catch {
    hideCalibration();
    closeCamera();
    stopOrientationListener();
    alert(selectedLang === 'tr' ? 'AR başlatılamadı. Tarayıcı izinlerini kontrol edin.' : 'Could not start AR. Check browser permissions.');
  }
}

function stopAR() {
  hideAR();
  closeCamera();
  stopOrientationListener();
}

/* ======================== EVENTLER ======================== */
if (startArBtn)     startArBtn.addEventListener('click', startARFlow);
if (calibDoneBtn)   calibDoneBtn.addEventListener('click', beginRealAR);
if (calibCancelBtn) calibCancelBtn.addEventListener('click', () => { stopCalibration(); hideCalibration(); });
if (arExitBtn)      arExitBtn.addEventListener('click', stopAR);

/* ======================== DİĞER ======================== */
function enableARButton(qiblaAngleDeg) {
  ARState.qiblaAngle = qiblaAngleDeg;
  if (startArBtn) startArBtn.style.display = 'inline-block';
}
