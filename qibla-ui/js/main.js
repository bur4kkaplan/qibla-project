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

  if (window.MathJax) {
    MathJax.typesetPromise();
  }
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
        const errLabel = selectedLang === 'tr' ? "Tahmini Sapma" : "Estimated Error";
        const confLabel = selectedLang === 'tr' ? "Doğruluk Oranı" : "Confidence";
        const qiblaLabel = selectedLang === 'tr' ? "Kıble Yönü" : "Qibla Direction";

        document.getElementById("error").innerText =
          `${errLabel}: ±${parseFloat(data.error).toFixed(4)}°`;
        document.getElementById("confidence").innerText =
          `${confLabel}: ≈ %${parseFloat(data.confidence).toFixed(2)}`;
        document.getElementById("qibla").innerText =
          `${qiblaLabel}: ${parseFloat(data.qibla).toFixed(4)}°`;
      });

    const map = L.map('map').setView([lat, lon], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18
    }).addTo(map);

    L.marker([lat, lon]).addTo(map).bindPopup(
      selectedLang === 'tr' ? "Konumunuz" : "Your Location"
    ).openPopup();

    const kaabaIcon = L.divIcon({
      html: '🕋',
      iconSize: [32, 32],
      className: 'kaaba-marker'
    });

    L.marker([kaabaLat, kaabaLon], { icon: kaabaIcon }).addTo(map).bindPopup(
      selectedLang === 'tr' ? "Kâbe" : "Kaaba"
    );

    L.polyline([[lat, lon], [kaabaLat, kaabaLon]], {
      color: 'red',
      weight: 3
    }).addTo(map);
  }

  function geoError(err) {
    const msg = selectedLang === 'tr'
      ? "Konum alınamadı: " + err.message
      : "Location error: " + err.message;
    document.getElementById("status").innerText = msg;
  }
}

// =================== AR: Yardımcı state ===================
const ARState = {
  supported: false,
  qiblaAngle: null,     // derece (0-360)
  heading: null,        // cihaz yönü (0-360)
  smoothHeading: null,  // filtrelenmiş yön
  stream: null,         // MediaStream referansı
  orientationHandler: null,
  havePermission: false
};

// Bazı eşikler
const DELTA_GREEN_MAX = 5;   // < 5° yeşil
const DELTA_YELLOW_MAX = 15; // 5-15° sarı, üstü kırmızı

// DOM referansları
const startArBtn     = document.getElementById('start-ar-btn');
const calibScreen    = document.getElementById('calibration-screen');
const calibDoneBtn   = document.getElementById('calibration-done-btn');
const calibCancelBtn = document.getElementById('calibration-cancel-btn');

const arContainer = document.getElementById('ar-container');
const arVideo     = document.getElementById('ar-video');
const arArrow     = document.getElementById('ar-arrow');
const hudHeading  = document.getElementById('hud-heading');
const hudQibla    = document.getElementById('hud-qibla');
const hudDelta    = document.getElementById('hud-delta');
const arExitBtn   = document.getElementById('ar-exit-btn');

// =================== AR: Destek kontrolü ===================
function isARSupported() {
  const hasOrientation = typeof window.DeviceOrientationEvent !== 'undefined';
  const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  return hasOrientation && hasMedia;
}

// iOS için yön izni gerekebilir
async function ensureOrientationPermission() {
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      const res = await DeviceOrientationEvent.requestPermission();
      return res === 'granted';
    }
    // Android/diğerleri genelde burada sorun çıkarmaz
    return true;
  } catch (e) {
    return false;
  }
}

// =================== AR: Kamera başlat/kapat ===================
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

// =================== AR: Pusula / yön dinleyicisi ===================
function startOrientationListener() {
  // Ekran dönüşünü basitçe dahil etmek istersen:
  const screenAngle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;

  ARState.orientationHandler = (e) => {
    let alpha = e.alpha;

    // Bazı cihazlarda alpha null olabilir
    if (alpha == null) return;

    // True north'a göre kabul edip ekran dönüşünü ekleyelim (kabaca düzeltme)
    let heading = (alpha + screenAngle) % 360;
    if (heading < 0) heading += 360;

    // Basit low-pass filtre (sarsıntıyı azaltmak için)
    if (ARState.smoothHeading == null) {
      ARState.smoothHeading = heading;
    } else {
      ARState.smoothHeading = 0.85 * ARState.smoothHeading + 0.15 * heading;
    }

    ARState.heading = heading;
    updateARUI();
  };

  // Mümkünse absolute'i tercih et
  window.addEventListener('deviceorientationabsolute', ARState.orientationHandler, true);
  // Bazı cihazlarda absolute gelmez; fallback:
  window.addEventListener('deviceorientation', ARState.orientationHandler, true);
}

function stopOrientationListener() {
  if (ARState.orientationHandler) {
    window.removeEventListener('deviceorientationabsolute', ARState.orientationHandler, true);
    window.removeEventListener('deviceorientation', ARState.orientationHandler, true);
    ARState.orientationHandler = null;
  }
}

// =================== AR: UI güncelleme ===================
function updateARUI() {
  if (ARState.qiblaAngle == null || ARState.smoothHeading == null) return;

  const heading = ARState.smoothHeading;
  const qibla   = ARState.qiblaAngle;

  // Fark: qibla - heading (0-360)
  const rawDelta = (qibla - heading + 360) % 360;

  // Oku, kullanıcının dönmesi gereken yöne çeviriyoruz (0° = tam yukarı)
  arArrow.style.transform = `translate(-50%, -50%) rotate(${rawDelta}deg)`;

  // Renk durumu
  arArrow.classList.remove('arrow-green','arrow-yellow','arrow-red');
  if (rawDelta < DELTA_GREEN_MAX || rawDelta > (360 - DELTA_GREEN_MAX)) {
    arArrow.classList.add('arrow-green');
    // Yakınken hafif titreşim (destekliyorsa)
    if (navigator.vibrate) navigator.vibrate(10);
  } else if (rawDelta < DELTA_YELLOW_MAX || rawDelta > (360 - DELTA_YELLOW_MAX)) {
    arArrow.classList.add('arrow-yellow');
  } else {
    arArrow.classList.add('arrow-red');
  }

  // HUD
  hudHeading.textContent = `${selectedLang === 'tr' ? 'Yön' : 'Heading'}: ${heading.toFixed(0)}°`;
  hudQibla.textContent   = `${selectedLang === 'tr' ? 'Kıble' : 'Qibla'}: ${qibla.toFixed(0)}°`;
  const deltaForUser = rawDelta <= 180 ? rawDelta : 360 - rawDelta; // kısa açı farkını göster
  hudDelta.textContent    = `${selectedLang === 'tr' ? 'Fark' : 'Delta'}: ${deltaForUser.toFixed(0)}°`;
}

// =================== AR: Akış kontrolü ===================
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
  // 1) Cihaz destekli mi?
  if (!isARSupported()) {
    alert(selectedLang === 'tr'
      ? 'Bu cihaz AR modunu desteklemiyor.'
      : 'This device does not support AR mode.');
    return;
  }
  // 2) Qibla açısı hazır mı? (değilse hızlıca yeniden hesapla)
  if (ARState.qiblaAngle == null) {
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 })
      );
      const { latitude: lat, longitude: lon, accuracy: acc } = pos.coords;
      const resp = await fetch(`/api/qibla?lat=${lat}&lon=${lon}&acc=${acc}`);
      const data = await resp.json();
      ARState.qiblaAngle = parseFloat(data.qibla);
    } catch (e) {
      alert(selectedLang === 'tr'
        ? 'Konum veya kıble hesaplaması alınamadı.'
        : 'Could not get location or qibla angle.');
      return;
    }
  }

  // 3) Kalibrasyon ekranına geç
  showCalibration();
}

// Kullanıcı "Kalibrasyonu Tamamladım" dediğinde gerçek AR başlar
async function beginRealAR() {
  try {
    // iOS için pusula izni
    const perm = await ensureOrientationPermission();
    if (!perm) {
      alert(selectedLang === 'tr'
        ? 'Pusula erişimi reddedildi.'
        : 'Compass access was denied.');
      return;
    }
    // Kamera
    await openCamera();
    // Yön dinleyicisi
    startOrientationListener();

    // UI
    hideCalibration();
    showAR();
    updateARUI(); // ilk durum
  } catch (e) {
    hideCalibration();
    closeCamera();
    stopOrientationListener();
    alert(selectedLang === 'tr'
      ? 'AR başlatılamadı. Tarayıcı izinlerini kontrol edin.'
      : 'Could not start AR. Check browser permissions.');
  }
}

function stopAR() {
  hideAR();
  closeCamera();
  stopOrientationListener();
}

// =================== Olay bağlama ===================
if (startArBtn) {
  startArBtn.addEventListener('click', startARFlow);
}
if (calibDoneBtn) {
  calibDoneBtn.addEventListener('click', beginRealAR);
}
if (calibCancelBtn) {
  calibCancelBtn.addEventListener('click', () => {
    hideCalibration();
  });
}
if (arExitBtn) {
  arExitBtn.addEventListener('click', stopAR);
}

// =================== Qıble hesaplandıktan sonra AR butonunu göster ===================
// Mevcut akışında kıble verisini aldıktan sonra bu fonksiyonu çağırırsan buton görünür.
// Eğer çağırmayı unutsan bile kullanıcı AR başlatırken kendi içinde tekrar hesaplayacak.
function enableARButton(qiblaAngleDeg) {
  ARState.qiblaAngle = qiblaAngleDeg;
  if (startArBtn) startArBtn.style.display = 'inline-block';
}

// ÖRNEK: Sen mevcut kodunda fetch(`/api/qibla?...`).then(data => { ... }); içinde
// kıble değerini yazdırdıktan sonra aşağıdakini ekleyebilirsin:
// enableARButton(parseFloat(data.qibla));