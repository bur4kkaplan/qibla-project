let selectedLang = 'tr';

window.onload = () => {
  document.getElementById("language-screen").style.display = "block";
};

function selectLanguage(lang) {
  selectedLang = lang;
  document.getElementById("language-screen").style.display = "none";
  document.getElementById("info-screen").style.display = "block";

  const texts = {
    tr: {
      info: `Bu uygulama, cihazınızın coğrafi konumuna göre Kâbe yönünü (Kıble) derece cinsinden hesaplar.\n\nKıble açısı, gerçek kuzeye göre saat yönünde ölçülür. Örneğin, kıble açısı 147.32° ise kuzeye dönüp saat yönünde 147.32° döndüğünüzde doğru yöne bakmış olursunuz.\n\nKonum doğruluğuna göre hata payı ve güven oranı da gösterilir.\n\nHesaplama detaylarını öğrenmek için Teknik Detaylar'a göz atabilirsiniz.`,
      title: "Genel Bilgilendirme",
      confirm: "Anladım",
      details: "Teknik Detaylar",
      detailsTitle: "Teknik Detaylar",
      status: "Konum Alınıyor...",
      detailsHTML: `
        <p><strong>1. Elipsoit Modeli</strong><br>
        Hesaplamalarda Dünya bir küre değil, elipsoit olarak modellenmiştir. Kullanılan model: <em>WGS84</em>.</p>
        <p><strong>2. Girdi Verileri</strong><br>
        Kullanıcı enlem (ϕ₁) ve boylam (λ₁), Kâbe koordinatları (ϕ₂ = 21.4225°, λ₂ = 39.8262°)</p>
        <p><strong>3. Kıble Açısı Formülü</strong><br>
        \\[ \\theta = \\arctan2( \\sin(\\Delta \\lambda), \\cos(\\phi_1) \\cdot \\tan(\\phi_2) - \\sin(\\phi_1) \\cdot \\cos(\\Delta \\lambda) ) \\]</p>
        <p><strong>4. Hata Payı</strong><br>
        Konum doğruluğu (örneğin ±20m) dairesel bölge olarak modellenir ve açısal sapma buradan tahmin edilir.</p>
        <p><strong>5. Güven Oranı</strong><br>
        Sapma küçükse, güven oranı yüksek olur. Oran logaritmik modele göre hesaplanır.</p>
      `
    },
    en: {
      info: `This app calculates the Qibla direction in degrees based on your location.\n\nThe Qibla angle is measured clockwise from true north. For example, if it's 147.32°, turn 147.32° clockwise from north.\n\nThe app also shows the margin of error and confidence based on your location accuracy.\n\nYou can view the calculation steps by clicking Technical Details.`,
      title: "General Info",
      confirm: "Got it",
      details: "Technical Details",
      detailsTitle: "Technical Details",
      status: "Getting Location...",
      detailsHTML: `
        <p><strong>1. Ellipsoid Model</strong><br>
        Earth is modeled as an ellipsoid, not a sphere. Model used: <em>WGS84</em>.</p>
        <p><strong>2. Input Parameters</strong><br>
        User latitude (ϕ₁) and longitude (λ₁), Kaaba coordinates (ϕ₂ = 21.4225°, λ₂ = 39.8262°)</p>
        <p><strong>3. Qibla Angle Formula</strong><br>
        \\[ \\theta = \\arctan2( \\sin(\\Delta \\lambda), \\cos(\\phi_1) \\cdot \\tan(\\phi_2) - \\sin(\\phi_1) \\cdot \\cos(\\Delta \\lambda) ) \\]</p>
        <p><strong>4. Error Margin</strong><br>
        Location accuracy (e.g., ±20m) is modeled as a circular region and maximum deviation angle is estimated.</p>
        <p><strong>5. Confidence Level</strong><br>
        Smaller error → higher confidence. Based on a logarithmic model.</p>
      `
    }
  };

  const t = texts[lang];
  document.getElementById("info-title").innerText = t.title;
  document.getElementById("info-text").innerText = t.info;
  document.getElementById("confirm-button").innerText = t.confirm;
  document.getElementById("details-button").innerText = t.details;
  document.getElementById("details-title").innerText = t.detailsTitle;
  document.getElementById("status").innerText = t.status;
  document.getElementById("details-content").innerHTML = t.detailsHTML;

  if (window.MathJax) MathJax.typesetPromise();
}

function showDetails() {
  document.getElementById("info-screen").style.display = "none";
  document.getElementById("details-screen").style.display = "block";
}

function hideDetails() {
  document.getElementById("details-screen").style.display = "none";
  document.getElementById("info-screen").style.display = "block";
}

function startApp() {
  document.getElementById("info-screen").style.display = "none";
  document.getElementById("main-app").style.display = "block";

  const kaabaLat = 21.4225;
  const kaabaLon = 39.8262;

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

        const angle = Number.parseFloat(data.qibla);
        enableARButton(angle);
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

const ARState = {
  supported: false,
  qiblaAngle: null,
  heading: null,
  smoothHeading: null,
  stream: null,
  orientationHandler: null,
  havePermission: false,
  headingBias: parseFloat(localStorage.getItem('headingBias') || '0'),
  lastSamples: [],
  maxSamples: 9,
  tiltOK: true
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

const sunBtn = document.getElementById('sunlock-btn');
const arMat  = document.getElementById('ar-mat');

function norm360(x){ x%=360; return x<0? x+360 : x; }
function clamp01(v){ return Math.max(0, Math.min(1, v)); }

function median(arr){
  const a = [...arr].sort((x,y)=>x-y);
  const m = Math.floor(a.length/2);
  return a.length%2 ? a[m] : (a[m-1]+a[m])/2;
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
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' }, audio: false
  });
  arVideo.srcObject = stream;
  ARState.stream = stream;
  await arVideo.play().catch(()=>{});
}

function closeCamera() {
  if (ARState.stream) {
    ARState.stream.getTracks().forEach(t => t.stop());
    ARState.stream = null;
  }
  arVideo.srcObject = null;
}

function startOrientationListener() {
  const screenAngle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;

  ARState.orientationHandler = (e) => {
    const beta  = (typeof e.beta === 'number') ? Math.abs(e.beta) : 0;
    const gamma = (typeof e.gamma=== 'number') ? Math.abs(e.gamma): 0;
    ARState.tiltOK = (beta < 55 && gamma < 55);

    let heading;
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) {
      heading = e.webkitCompassHeading;
    } else {
      let alpha = e.alpha;
      if (alpha == null) return;
      heading = norm360(alpha + screenAngle);
    }

    heading = norm360(heading - ARState.headingBias);

    if (ARState.tiltOK) {
      ARState.lastSamples.push(heading);
      if (ARState.lastSamples.length > ARState.maxSamples) ARState.lastSamples.shift();
      const med = median(ARState.lastSamples);

      if (ARState.smoothHeading == null) {
        ARState.smoothHeading = med;
      } else {
        const diff = Math.abs(med - ARState.smoothHeading);
        const alphaEMA = (diff > 10) ? 0.08 : (diff > 5 ? 0.12 : 0.18);
        ARState.smoothHeading = norm360(ARState.smoothHeading*(1-alphaEMA) + med*alphaEMA);
      }

      ARState.heading = heading;
      updateARUI();
    }
  };

  window.addEventListener('deviceorientationabsolute', ARState.orientationHandler, true);
  window.addEventListener('deviceorientation', ARState.orientationHandler, true);
}

function stopOrientationListener() {
  if (ARState.orientationHandler) {
    window.removeEventListener('deviceorientationabsolute', ARState.orientationHandler, true);
    window.removeEventListener('deviceorientation', ARState.orientationHandler, true);
    ARState.orientationHandler = null;
  }
}

function updateARUI() {
  if (ARState.qiblaAngle == null || ARState.smoothHeading == null) return;

  if (!ARState.tiltOK) {
    hudDelta.textContent = selectedLang === 'tr' ? 'Telefonu dikleştir' : 'Hold phone flatter';
    return;
  }

  const heading = ARState.smoothHeading;
  const qibla   = ARState.qiblaAngle;
  const rawDelta = (qibla - heading + 360) % 360;

  // Seccade: yere yatırılmış görünümü koru, kıble yönüne çevir
  if (arMat) {
    arMat.style.transform =
      `translate(-50%, -50%) perspective(800px) rotateX(58deg) rotate(${rawDelta}deg)`;
  }

  // Ok
  arArrow.style.transform = `translate(-50%, -50%) rotate(${rawDelta}deg)`;

  arArrow.classList.remove('arrow-green','arrow-yellow','arrow-red');
  if (rawDelta < DELTA_GREEN_MAX || rawDelta > (360 - DELTA_GREEN_MAX)) {
    arArrow.classList.add('arrow-green');
    if (navigator.vibrate) navigator.vibrate(10);
  } else if (rawDelta < DELTA_YELLOW_MAX || rawDelta > (360 - DELTA_YELLOW_MAX)) {
    arArrow.classList.add('arrow-yellow');
  } else {
    arArrow.classList.add('arrow-red');
  }

  hudHeading.textContent = `${selectedLang === 'tr' ? 'Yön' : 'Heading'}: ${heading.toFixed(0)}°`;
  hudQibla.textContent   = `${selectedLang === 'tr' ? 'Kıble' : 'Qibla'}: ${qibla.toFixed(0)}°`;
  const deltaForUser = rawDelta <= 180 ? rawDelta : 360 - rawDelta;
  hudDelta.textContent    = `${selectedLang === 'tr' ? 'Fark' : 'Delta'}: ${deltaForUser.toFixed(0)}°`;
}

/* ----------------------------- Kalibrasyon UI + Mantık ----------------------------- */

const Cal = {
  active: false,
  startTime: 0,
  lastAlpha: null,
  yawUnwrapped: 0,
  yawMin: 0,
  yawMax: 0,
  pitchMin:  999, pitchMax: -999,
  rollMin:   999, rollMax:  -999,
  handler: null,
  ui: {
    stepsWrap: null,
    stepYaw: null,
    stepPitch: null,
    stepRoll: null,
    bar: null,
    badge: null,
    hint: null
  }
};

function shortestDelta(a, b){
  let d = a - b;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

function initCalibrationUI() {
  const content = calibScreen.querySelector('.modal-content');
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
      </div>
    `;
    const btnRow = content.querySelector('.center-buttons');
    content.insertBefore(ui, btnRow);
  }
  Cal.ui.stepsWrap = content.querySelector('.calib-steps');
  Cal.ui.stepYaw   = content.querySelector('#calib-step-yaw');
  Cal.ui.stepPitch = content.querySelector('#calib-step-pitch');
  Cal.ui.stepRoll  = content.querySelector('#calib-step-roll');
  Cal.ui.bar       = content.querySelector('#calib-bar');
  Cal.ui.badge     = content.querySelector('#quality-badge');
  Cal.ui.hint      = content.querySelector('#quality-hint');

  if (!calibDoneBtn)   calibDoneBtn   = document.getElementById('calibration-done-btn');
  if (!calibCancelBtn) calibCancelBtn = document.getElementById('calibration-cancel-btn');
  calibDoneBtn.disabled = true;
}

function startCalibration() {
  Cal.active = true;
  Cal.startTime = performance.now();
  Cal.lastAlpha = null;
  Cal.yawUnwrapped = 0;
  Cal.yawMin = 0; Cal.yawMax = 0;
  Cal.pitchMin = 999; Cal.pitchMax = -999;
  Cal.rollMin  = 999; Cal.rollMax  = -999;

  Cal.handler = (e) => {
    const alpha = (typeof e.alpha==='number') ? e.alpha : null;
    const beta  = (typeof e.beta ==='number') ? e.beta  : 0;
    const gamma = (typeof e.gamma==='number') ? e.gamma : 0;

    if (alpha != null) {
      if (Cal.lastAlpha == null) {
        Cal.lastAlpha = alpha;
        Cal.yawUnwrapped = alpha;
        Cal.yawMin = alpha; Cal.yawMax = alpha;
      } else {
        const d = shortestDelta(alpha, Cal.lastAlpha);
        Cal.yawUnwrapped += d;
        Cal.lastAlpha = alpha;
        if (Cal.yawUnwrapped < Cal.yawMin) Cal.yawMin = Cal.yawUnwrapped;
        if (Cal.yawUnwrapped > Cal.yawMax) Cal.yawMax = Cal.yawUnwrapped;
      }
    }

    if (beta < Cal.pitchMin) Cal.pitchMin = beta;
    if (beta > Cal.pitchMax) Cal.pitchMax = beta;
    if (gamma < Cal.rollMin) Cal.rollMin = gamma;
    if (gamma > Cal.rollMax) Cal.rollMax = gamma;

    updateCalibrationUI();
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

function updateCalibrationUI() {
  const yawSweep   = Math.abs(Cal.yawMax - Cal.yawMin);   // hedef ~270°
  const pitchRange = Math.abs(Cal.pitchMax - Cal.pitchMin); // hedef ~80°
  const rollRange  = Math.abs(Cal.rollMax  - Cal.rollMin);  // hedef ~80°

  const yawOK   = yawSweep   >= 270;
  const pitchOK = pitchRange >= 80;
  const rollOK  = rollRange  >= 80;

  Cal.ui.stepYaw.classList.toggle('done',   yawOK);
  Cal.ui.stepPitch.classList.toggle('done', pitchOK);
  Cal.ui.stepRoll.classList.toggle('done',  rollOK);

  const pYaw   = clamp01(yawSweep/270);
  const pPitch = clamp01(pitchRange/80);
  const pRoll  = clamp01(rollRange/80);
  const prog   = Math.round(((pYaw + pPitch + pRoll) / 3) * 100);

  Cal.ui.bar.style.width = `${prog}%`;
  // (Opsiyonel) yüzde arttıkça minik bir parlaklık hissi
  if (prog < 33) {
    Cal.ui.bar.style.filter = 'brightness(1)';
  } else if (prog < 66) {
    Cal.ui.bar.style.filter = 'brightness(1.05)';
  } else {
    Cal.ui.bar.style.filter = 'brightness(1.1)';
  }

  let qualityClass = 'bad';
  let qualityText  = selectedLang==='tr' ? 'Kalite: Düşük' : 'Quality: Low';
  let hintText     = selectedLang==='tr' ? 'Telefonu üç eksende hareket ettir' : 'Move phone on all 3 axes';
  if (prog >= 85) {
    qualityClass = 'good';
    qualityText  = selectedLang==='tr' ? 'Kalite: Yüksek' : 'Quality: High';
    hintText     = selectedLang==='tr' ? 'Harika! Devam edebilirsin.' : 'Great! You can proceed.';
  } else if (prog >= 60) {
    qualityClass = 'ok';
    qualityText  = selectedLang==='tr' ? 'Kalite: Orta'  : 'Quality: Medium';
    hintText     = selectedLang==='tr' ? 'Biraz daha çevir, tam tur dene' : 'Rotate more, try a full spin';
  }
  Cal.ui.badge.className = `quality-badge ${qualityClass}`;
  Cal.ui.badge.textContent = qualityText;
  Cal.ui.hint.textContent = hintText;

  const minDurationOK = (performance.now() - Cal.startTime) > 5000;
  calibDoneBtn.disabled = !(prog >= 85 && minDurationOK);
}

/* ----------------------------- Akış Kontrol ----------------------------- */

function showCalibration() {
  calibScreen.classList.remove('hidden');
  calibScreen.setAttribute('aria-hidden', 'false');
}
function hideCalibration() {
  calibScreen.classList.add('hidden');
  calibScreen.setAttribute('aria-hidden', 'true');
}

function showAR() {
  arContainer.classList.remove('hidden');
  arContainer.setAttribute('aria-hidden', 'false');
}
function hideAR() {
  arContainer.classList.add('hidden');
  arContainer.setAttribute('aria-hidden', 'true');
}

async function startARFlow() {
  if (!isARSupported()) {
    alert(selectedLang === 'tr' ? 'Bu cihaz AR modunu desteklemiyor.' : 'This device does not support AR mode.');
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
    // EK GÜVENLİK: Kalibrasyon tamamlanmadan asla ilerletme
    const bar = document.getElementById('calib-bar');
    const doneBtn = document.getElementById('calibration-done-btn');
    const minDurationOK = (performance.now() - Cal.startTime) > 5000;
    const progNow = parseInt(bar?.style.width || '0', 10);
    if (!minDurationOK || progNow < 85 || doneBtn?.disabled) {
      alert(selectedLang === 'tr'
        ? 'Kalibrasyon henüz tamamlanmadı.'
        : 'Calibration is not complete yet.');
      return;
    }

    stopCalibration();

    const perm = await ensureOrientationPermission();
    if (!perm) {
      alert(selectedLang === 'tr' ? 'Pusula erişimi reddedildi.' : 'Compass access was denied.');
      return;
    }
    await openCamera();
    startOrientationListener();

    hideCalibration();
    showAR();
    updateARUI();
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

if (startArBtn) startArBtn.addEventListener('click', startARFlow);
if (calibDoneBtn) calibDoneBtn.addEventListener('click', beginRealAR);
if (calibCancelBtn) calibCancelBtn.addEventListener('click', () => { stopCalibration(); hideCalibration(); });
if (arExitBtn) arExitBtn.addEventListener('click', stopAR);

function enableARButton(qiblaAngleDeg) {
  ARState.qiblaAngle = qiblaAngleDeg;
  if (startArBtn) startArBtn.style.display = 'inline-block';
}

function sunAzimuthDeg(date, latDeg, lonDeg) {
  const rad = Math.PI/180, deg = 180/Math.PI;
  const d = (date - new Date(Date.UTC(date.getUTCFullYear(),0,1))) / 86400000 + 1;
  const g = rad*(357.529 + 0.98560028*d);
  const q = rad*(280.459 + 0.98564736*d);
  const L = (q + rad*(1.915*Math.sin(g) + 0.020*Math.sin(2*g)));
  const e = rad*23.4397;
  const RA = Math.atan2(Math.cos(e)*Math.sin(L), Math.cos(L));
  const dec= Math.asin(Math.sin(e)*Math.sin(L));
  const eqt= (q - RA)*deg/15;
  const utcHours = date.getUTCHours() + date.getUTCMinutes()/60 + date.getUTCSeconds()/3600;
  const lst = (utcHours + eqt + lonDeg/15)*15*rad;
  const H = lst - RA;
  const lat = latDeg*rad;
  let A = Math.atan2(Math.sin(H), Math.cos(H)*Math.sin(lat) - Math.tan(dec)*Math.cos(lat)) * deg + 180;
  return norm360(A);
}

if (sunBtn) {
  sunBtn.addEventListener('click', async () => {
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      const now = new Date();
      const sunAz = sunAzimuthDeg(now, lat, lon);
      const currentHeading = (ARState.smoothHeading ?? ARState.heading);
      if (currentHeading == null) {
        alert(selectedLang === 'tr' ? 'Başlık verisi yok. Biraz bekleyip tekrar deneyin.' : 'No heading yet. Please try again shortly.');
        return;
      }
      const bias = norm360(currentHeading - sunAz);
      ARState.headingBias = bias;
      localStorage.setItem('headingBias', String(bias));
      alert(selectedLang === 'tr' ? 'Güneş ile senkron tamamlandı. Düzeltme uygulandı.' : 'Sun lock complete. Correction applied.');
    } catch {
      alert(selectedLang === 'tr' ? 'Güneş senkronu yapılamadı.' : 'Sun lock failed.');
    }
  });
}