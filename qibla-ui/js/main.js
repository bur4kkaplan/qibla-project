/* ======================== STATE ======================== */
let selectedLang = localStorage.getItem('lang') || 'tr';
const savedTheme = localStorage.getItem('theme') || 'dark';

/* Tema geçişi — içerik kaybolmadan */
function applyTheme(target){
  const html = document.documentElement;
  const current = html.getAttribute('data-theme') || 'dark';
  if (target === current) return;

  // Renk değişimleri akıcı olsun diye geçici transition sınıfı ekle
  html.classList.add('theme-transition');

  // Hedef temayı HEMEN uygula (içerik yerinde, renkleri smooth değişsin)
  html.setAttribute('data-theme', target);
  localStorage.setItem('theme', target);
  updateThemeToggleVisual();

  // Wipe filmi: alttan üste yarı saydam geçiş
  const wipe = document.getElementById('theme-wipe');
  if (wipe){
    wipe.classList.remove('theme-wipe-anim');
    void wipe.offsetWidth; // reflow
    wipe.classList.add('theme-wipe-anim');
    wipe.addEventListener('animationend', function done(){
      wipe.classList.remove('theme-wipe-anim');
      html.classList.remove('theme-transition');
      wipe.removeEventListener('animationend', done);
    });
  }else{
    // overlay yoksa da transition sınıfını kısa süre sonra kaldır
    setTimeout(()=>html.classList.remove('theme-transition'), 320);
  }
}

function updateThemeToggleVisual(){
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
}

/* Dil metinleri (overline dahil) */
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
    titleTop: "Welcome to the",
    titleBottom: "Qibla Finder",
    cta: "Get Started",
    infoTitle: "General Info",
    infoBtn: "Technical Details",
    confirm: "Got it",
    status: "Getting Location..."
  }
};

/* === YENİ: How-it ekranı metinleri === */
const HOWIT_TEXTS = {
  tr: {
    title: "Uygulama Nasıl Çalışıyor?",
    lead:
      "Kıble Bulucu, neredeysen orada Kâbe’nin yönünü bulmana yardım eden küçük bir yol arkadaşıdır. " +
      "Telefonunun konumunu alır, pusulayı akıllıca düzeltir ve doğru açıyı saniyeler içinde yüksek doğrulukla verir. " +
      "Haritada bakman gereken yönü görür, istersen kameranın üzerinde beliren okla adım adım yönelirsin. " +
      "Tüm işlem cihazında gerçekleşir; görüntün ve konumun kimseyle paylaşılmaz.",
    w1: "Doğru çalışması için konum izni gerekir.",
    w2: "Konum doğruluğu cihaz ve ortam koşullarına bağlıdır.",
    w3: "Uygulama geliştirme aşamasındadır.",
    tech: "Teknik Detaylar",
    cont: "Devam Et"
  },
  en: {
    title: "How does the app work?",
    lead:
      "Qibla Finder is a small companion that helps you find the Kaaba’s direction wherever you are. " +
      "It reads your location, smartly corrects the compass, and gives you the precise angle within seconds. " +
      "You can see the direction on the map, or follow an arrow over your camera view step-by-step. " +
      "Everything runs on your device; your image and location are not shared with anyone.",
    w1: "Location permission is required for proper operation.",
    w2: "Accuracy depends on your device and surroundings.",
    w3: "The app is under active development.",
    tech: "Technical Details",
    cont: "Continue"
  }
};

/* === YENİ: Teknik Detaylar ekranı başlık + TOC etiketleri (13 madde) === */
const TECH_TEXTS = {
  tr: {
    title: "Teknik Detaylar",
    toc: [
      "Kapsam", "Veri", "WGS84", "Azimut", "Sapma",
      "Başlık", "Filtre/Kalibr.", "Doğruluk", "Harita",
      "AR", "Performans", "Gizlilik", "Sağlamlık"
    ],
    metaSource: "Kaynak kodu GitHub’da yayınlanmıştır:",
    metaAI: "Bu uygulama yapay zekâ kullanılarak geliştirilmiştir.",
    metaAria: "GitHub deposu: bur4kkaplan/qibla-project"
  },
  en: {
    title: "Technical Details",
    toc: [
      "Scope", "Inputs", "WGS84", "Azimuth", "Declination",
      "Heading", "Filter/Calib.", "Accuracy", "Map",
      "AR", "Performance", "Privacy", "Robustness"
    ],
    metaSource: "The source code is available on GitHub:",
    metaAI: "This application was built using AI.",
    metaAria: "GitHub repository: bur4kkaplan/qibla-project"
  }
};

/* === YENİ: Teknik Detaylar – içerik gövdeleri (TR/EN) === */
const TECH_SECTIONS = {
  tr: {
    scope: {
      title: "Kapsam ve Hedef",
      html: `
      <p>Kullanıcının bulunduğu konumdan Kâbe’ye olan <strong>başlangıç azimutu</strong> hesaplanmış, sonuç <em>gerçek kuzeye</em> göre normalize edilmiş ve yön hem harita üzerinde hem de AR katmanında görselleştirilmiştir. Hesaplamalar <strong>WGS84</strong> referans elipsoidi esas alınarak gerçekleştirilmiştir.</p>`
    },
    inputs: {
      title: "Veri Çekimi ve İzinler",
      html: `
      <ul>
        <li><strong>Konum</strong> <code>navigator.geolocation</code> ile alınmıştır (enlem, boylam, doğruluk).</li>
        <li><strong>Yön</strong> verisi <code>DeviceOrientation</code> olaylarından toplanmış, iOS’ta varsa <code>webkitCompassHeading</code> kullanılmıştır.</li>
        <li>Gerekli izinler kullanıcıdan istenmiş, reddinde AR devre dışı bırakılmıştır.</li>
      </ul>`
    },
    geodesy: {
      title: "Jeodezik Model ve Dönüşümler (WGS84)",
      html: `
      <p>Dünya WGS84 elipsoidiyle modellenmiştir. Kâbe koordinatları sabitlenmiştir: <code>φ₂=21.4225°</code>, <code>λ₂=39.8262°</code>. Tüm trigonometrik işlemler radyan cinsinden yürütülmüş; çıktı açıları şu şekilde normalize edilmiştir:</p>
      \\[
        \\mathrm{norm}_{360}(\\theta) = (\\theta \\bmod 360 + 360)\\bmod 360
      \\]`
    },
    bearing: {
      title: "Azimut (Great-Circle) Hesabı",
      html: `
      <p>Kullanıcı <code>(φ₁, λ₁)</code> → Kâbe <code>(φ₂, λ₂)</code> başlangıç azimutu aşağıdaki bağıntıyla hesaplanmıştır:</p>
      \\[
        \\theta = \\operatorname{atan2}\\!\\Big(\\sin\\Delta\\lambda,\\ \\cos\\phi_1\\cdot\\tan\\phi_2 - \\sin\\phi_1\\cdot\\cos\\Delta\\lambda\\Big),\\quad
        \\Delta\\lambda = \\lambda_2-\\lambda_1
      \\]
      <p><code>atan2</code> kullanımı antimeridyen ve yüksek enlemlerde nümerik kararlılık sağlamıştır.</p>`
    },
    declination: {
      title: "Manyetik Kuzey → Gerçek Kuzey (Declination)",
      html: `
      <p>Manyetometreden gelen başlık manyetik kuzeye göredir. Yerel sapma <code>D</code> eklenerek gerçek kuzeye dönüştürme yapılmıştır:</p>
      \\[
        h_{\\text{true}} \\approx h_{\\text{mag}} + D
      \\]
      <p><code>D</code> değeri jeomanyetik bir modelden (WMM/IGRF) türetilmiştir.</p>`
    },
    heading: {
      title: "Başlık Türetimi ve Ekran Yönü Telafisi",
      html: `
      <p>Eğim etkisi giderildikten sonra başlık ekran yönü ile telafi edilmiş, declination ve kalibrasyon bias’ı uygulanmıştır:</p>
      \\[
        h \\leftarrow \\mathrm{norm}_{360}\\big(h_{\\text{raw}} + \\text{screenAngle}\\big) \\\\
        h \\leftarrow \\mathrm{norm}_{360}\\big(h + D - b\\big)
      \\]`
    },
    filterCalib: {
      title: "Filtreleme ve Kalibrasyon",
      html: `
      <ul>
        <li><strong>Median</strong> pencere ile tekil sıçramalar bastırılmıştır.</li>
        <li><strong>EMA</strong> ile pürüzsüzlük/tepkisellik dengelenmiştir.</li>
        <li><strong>Tilt bekçisi</strong> ile aşırı eğimlerde güncelleme azaltılmıştır.</li>
        <li><strong>Kalibrasyon</strong> için 3 eksende kısa hareket istenmiş; eşikler sağlandığında küçük bir bias <code>b</code> saklanmıştır.</li>
      </ul>`
    },
    accuracy: {
      title: "Doğruluk ve Güven Puanı",
      html: `
      <p>Konum doğruluk yarıçapı <code>r</code> ve Kâbe’ye uzaklık <code>d</code> ile en kötü durum açısal hata yaklaşıklandırılmıştır:</p>
      \\[
        \\varepsilon \\approx \\arctan\\!\\Big(\\frac{r}{d}\\Big)
      \\]
      <p>Güven puanı 0–100 aralığına tekdüze bir dönüşümle haritalanmış; anlık fark <code>Δ</code> eşiklere göre renklendirilmiştir.</p>`
    },
    map: {
      title: "Harita Çizimi",
      html: `
      <p>Leaflet + OpenStreetMap kullanılmış; kullanıcı ve Kâbe işaretlenmiş, aralarına great-circle hattı çizilmiştir. Antimeridyen geçişinde çizgi segmentlere ayrılmıştır.</p>`
    },
    ar: {
      title: "AR Boru Hattı",
      html: `
      <p>Arka kamera <code>getUserMedia</code> ile açılmış; ok/seccade SVG’si <code>rawDelta = norm360(θ - h)</code> kadar döndürülmüştür. 60 Hz hedefiyle <code>requestAnimationFrame</code> döngüsü kullanılmıştır.</p>`
    },
    perf: {
      title: "Performans ve Enerji",
      html: `
      <p>DOM güncellemeleri toplu işlenmiş, transform/opacity animasyonları kompozitör düzeyinde tutulmuştur. Tema/dil geçişleri tek timeline’da senkronize edilmiştir.</p>`
    },
    privacy: {
      title: "Gizlilik ve Güvenlik",
      html: `
      <p>Kamera kareleri işlenmemiş ve cihazı terk etmemiş; konum verisi yalnız oturum içi kullanılmıştır. Gerekiyorsa dış çağrılar kimliksiz ve logsuz yapılmıştır.</p>`
    },
    robust: {
      title: "Hata Durumları ve Sağlamlık",
      html: `
      <p>İzin reddinde AR devre dışı bırakılmış; sensör desteği yoksa kullanıcı bilgilendirilmiştir. Sınır durumlarında sarmalama ve <code>atan2</code> ile nümerik istikrar sağlanmıştır.</p>`
    },
    meta: {
      source: "Kaynak kodu GitHub’da yayınlanmıştır:",
      ai: "Bu uygulama yapay zekâ kullanılarak geliştirilmiştir."
    }
  },
  en: {
    scope: {
      title: "Scope and Goal",
      html: `
      <p>The <strong>forward azimuth</strong> from the user to the Kaaba has been computed, normalized to <em>true north</em>, and rendered on both map and AR layers. Calculations have been performed under the <strong>WGS84</strong> reference ellipsoid.</p>`
    },
    inputs: {
      title: "Data Acquisition & Permissions",
      html: `
      <ul>
        <li><strong>Location</strong> is obtained via <code>navigator.geolocation</code> (lat, lon, accuracy).</li>
        <li><strong>Orientation</strong> is read from <code>DeviceOrientation</code>; on iOS, <code>webkitCompassHeading</code> is used when present.</li>
        <li>Required permissions are requested; on denial, AR is disabled while map mode remains available.</li>
      </ul>`
    },
    geodesy: {
      title: "Geodesy & Transforms (WGS84)",
      html: `
      <p>Earth is modeled with WGS84. Kaaba coords are fixed: <code>φ₂=21.4225°</code>, <code>λ₂=39.8262°</code>. Trigonometry uses radians; output angles are normalized as:</p>
      \\[
        \\mathrm{norm}_{360}(\\theta) = (\\theta \\bmod 360 + 360)\\bmod 360
      \\]`
    },
    bearing: {
      title: "Azimuth (Great-Circle) Computation",
      html: `
      <p>Forward azimuth from <code>(φ₁, λ₁)</code> to <code>(φ₂, λ₂)</code> is computed as:</p>
      \\[
        \\theta = \\operatorname{atan2}\\!\\Big(\\sin\\Delta\\lambda,\\ \\cos\\phi_1\\cdot\\tan\\phi_2 - \\sin\\phi_1\\cdot\\cos\\Delta\\lambda\\Big),\\quad
        \\Delta\\lambda = \\lambda_2-\\lambda_1
      \\]
      <p><code>atan2</code> ensures numerical stability near the antimeridian and high latitudes.</p>`
    },
    declination: {
      title: "Magnetic → True North (Declination)",
      html: `
      <p>Magnetometer heading is referenced to magnetic north. Adding local declination <code>D</code> yields true-north heading:</p>
      \\[
        h_{\\text{true}} \\approx h_{\\text{mag}} + D
      \\]
      <p><code>D</code> is obtained from a geomagnetic model (WMM/IGRF).</p>`
    },
    heading: {
      title: "Heading Derivation & Screen Compensation",
      html: `
      <p>Tilt compensation is applied, then screen orientation, declination and calibration bias:</p>
      \\[
        h \\leftarrow \\mathrm{norm}_{360}\\big(h_{\\text{raw}} + \\text{screenAngle}\\big) \\\\
        h \\leftarrow \\mathrm{norm}_{360}\\big(h + D - b\\big)
      \\]`
    },
    filterCalib: {
      title: "Filtering & Calibration",
      html: `
      <ul>
        <li><strong>Median</strong> window suppresses outliers.</li>
        <li><strong>EMA</strong> balances smoothness vs responsiveness.</li>
        <li><strong>Tilt guard</strong> reduces updates at extreme tilt.</li>
        <li><strong>Calibration</strong> stores a small bias <code>b</code> once 3-axis motion thresholds are satisfied.</li>
      </ul>`
    },
    accuracy: {
      title: "Accuracy & Confidence",
      html: `
      <p>With location accuracy radius <code>r</code> and great-circle distance to Kaaba <code>d</code>, worst-case angular error is approximated by:</p>
      \\[
        \\varepsilon \\approx \\arctan\\!\\Big(\\frac{r}{d}\\Big)
      \\]
      <p>A monotonic mapping converts \\(\\varepsilon\\) to a 0–100 confidence score; the instantaneous difference <code>Δ</code> is color-coded by thresholds.</p>`
    },
    map: {
      title: "Map Rendering",
      html: `
      <p>Leaflet with OpenStreetMap tiles is used; user and Kaaba markers are drawn with a great-circle line between them. Polyline segments avoid antimeridian wrap.</p>`
    },
    ar: {
      title: "AR Pipeline",
      html: `
      <p>Back camera is opened via <code>getUserMedia</code>; the arrow/seccade SVG is rotated by <code>rawDelta = norm360(θ - h)</code>. Rendering is synchronized at 60 Hz using <code>requestAnimationFrame</code>.</p>`
    },
    perf: {
      title: "Performance & Power",
      html: `
      <p>DOM updates are batched; transform/opacity animations remain on the compositor. Theme/language transitions are synchronized on a single timeline.</p>`
    },
    privacy: {
      title: "Privacy & Security",
      html: `
      <p>No camera frames are processed or persisted; location data is used in-session only. Network calls (if any) are anonymous and log-free.</p>`
    },
    robust: {
      title: "Failure Modes & Robustness",
      html: `
      <p>On permission denial, AR is disabled while map mode remains. Edge cases (antimeridian, high latitudes) are handled via wrapping and <code>atan2</code>.</p>`
    },
    meta: {
      source: "The source code is available on GitHub:",
      ai: "This application was built using AI."
    }
  }
};

/* === YENİ: i18n yardımcıları (tech ekranı için) === */
function setTechTitleAndChips(lang){
  const t = TECH_TEXTS[lang] || TECH_TEXTS.tr;
  const titleEl = document.getElementById('tech-title');
  if (titleEl) titleEl.textContent = t.title;

  const chips = document.querySelectorAll('.tech-toc .toc-chip');
  t.toc.forEach((label, i) => { if (chips[i]) chips[i].textContent = label; });
}
function setTechMetaTexts(lang){
  const t = TECH_TEXTS[lang] || TECH_TEXTS.tr;
  const sourceEl = document.querySelector('#tech-meta [data-i18n="tech.meta.source"]');
  const aiEl     = document.querySelector('#tech-meta [data-i18n="tech.meta.ai"]');
  const linkEl   = document.querySelector('#tech-meta .meta-link');
  if (sourceEl) sourceEl.textContent = t.metaSource;
  if (aiEl)     aiEl.textContent     = t.metaAI;
  if (linkEl)   linkEl.setAttribute('aria-label', t.metaAria);
}

/* DOM içine teknik metin gövdelerini bas */
function populateTechContent(lang){
  const pack = TECH_SECTIONS[lang] || TECH_SECTIONS.tr;

  const map = {
    scope:  pack.scope,
    inputs: pack.inputs,
    geodesy: pack.geodesy,
    bearing: pack.bearing,
    declination: pack.declination,
    heading: pack.heading,
    filterCalib: pack.filterCalib,
    accuracy: pack.accuracy,
    map: pack.map,
    ar: pack.ar,
    perf: pack.perf,
    privacy: pack.privacy,
    robust: pack.robust
  };

  // Başlıklar
  for (const [id, sec] of Object.entries(map)){
    const card = document.getElementById(`tech-${id}`);
    if (!card) continue;
    const h2 = card.querySelector('h2');
    const body = card.querySelector('.tech-body');
    if (h2 && sec.title) h2.textContent = sec.title;
    if (body && sec.html) body.innerHTML = sec.html;
  }

  // Meta kart
  setTechMetaTexts(lang);

  // Formülleri türüt
  if (window.MathJax && typeof MathJax.typesetPromise === 'function'){
    MathJax.typesetPromise().catch(()=>{});
  }
}

/* === YENİ: Teknik Detaylar başlık + TOC + gövdeleri güncelle === */
function updateTechTexts(lang){
  setTechTitleAndChips(lang);
  populateTechContent(lang);
}

/* === YENİ: How-it ekranı metinlerini güncelle === */
function updateHowItTexts(lang){
  const t = HOWIT_TEXTS[lang] || HOWIT_TEXTS.tr;

  // başlık + açıklama
  const howTitle = document.getElementById('howit-title');
  const howLead  = document.getElementById('howit-lead');
  if (howTitle) howTitle.textContent = t.title;
  if (howLead)  howLead.textContent  = t.lead;

  // uyarılar (li içindeki son span metinleridir)
  const warnTexts = document.querySelectorAll('#howit-warnings li span:last-child');
  if (warnTexts[0]) warnTexts[0].textContent = t.w1;
  if (warnTexts[1]) warnTexts[1].textContent = t.w2;
  if (warnTexts[2]) warnTexts[2].textContent = t.w3;

  // alt butonlar
  const techBtn = document.getElementById('howit-tech');
  const contBtn = document.getElementById('howit-continue');
  if (techBtn) techBtn.textContent = t.tech;
  if (contBtn) contBtn.textContent = t.cont;
}

function applyLang(lang){
  if (lang === selectedLang) return;

  const overEl   = document.getElementById('welcome-overline');
  const topEl    = document.getElementById('title-top');
  const bottomEl = document.getElementById('title-bottom');
  const ctaText  = document.getElementById('welcome-cta-text');

  const animEls = [overEl, topEl, bottomEl, ctaText].filter(Boolean);

  // önce “sil” animasyonu
  animEls.forEach(el => {
    el.classList.remove('text-wipe-in');
    void el.offsetWidth;
    el.classList.add('text-wipe-out');
  });

  const anchor = topEl || bottomEl || overEl || ctaText; // en az birini referans al
  const onEnd = () => {
    selectedLang = lang;
    localStorage.setItem('lang', selectedLang);
    const t = WELCOME_TEXTS[selectedLang];

    if (overEl)   overEl.textContent   = t.overline;
    if (topEl)    topEl.textContent    = t.titleTop;
    if (bottomEl) bottomEl.textContent = t.titleBottom;
    if (ctaText)  ctaText.textContent  = t.cta;

    // “yaz” animasyonu
    animEls.forEach(el => {
      el.classList.remove('text-wipe-out');
      void el.offsetWidth;
      el.classList.add('text-wipe-in');
    });

    // bayrak aktifliği
    document.getElementById('btn-lang-tr')?.classList.toggle('is-active', selectedLang==='tr');
    document.getElementById('btn-lang-en')?.classList.toggle('is-active', selectedLang==='en');

    // info ekranı metinleri
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    setTxt("info-title",     t.infoTitle);
    setTxt("details-button", t.infoBtn);
    setTxt("confirm-button", t.confirm);
    setTxt("status",         t.status);

    // How-it + Tech ekranlarını da senkronla
    updateHowItTexts(selectedLang);
    updateTechTexts(selectedLang);

    anchor?.removeEventListener('animationend', onEnd);
  };

  if (anchor) anchor.addEventListener('animationend', onEnd, { once:true });
  else onEnd();
}

/* ======================== SAYFALAR ARASI GEÇİŞ ======================== */
/* welcome ↔ how-it/tech arasında yumuşak geçiş */
function routeTo(fromId, toId){
  const from = document.getElementById(fromId);
  const to   = document.getElementById(toId);
  if (!from || !to){
    // güvenli fallback
    if (from) from.style.display = 'none';
    if (to)   to.style.display   = to.classList.contains('welcome') ? 'flex' : 'block';
    return Promise.resolve();
  }

  // hedefi görünür yap + giriş animasyonu
  to.style.display = to.classList.contains('welcome') ? 'flex' : 'block';
  to.classList.add('page-enter');
  // çıkış animasyonu
  from.classList.add('page-leave');

  return new Promise(resolve=>{
    let done = 0;
    const cleanup = ()=>{
      done++;
      if (done < 2) return;
      from.classList.remove('page-leave');
      to.classList.remove('page-enter');
      from.style.display = 'none';
      resolve();
    };
    const a1 = ()=>{ from.removeEventListener('animationend', a1); cleanup(); };
    const a2 = ()=>{ to.removeEventListener(  'animationend', a2); cleanup(); };
    from.addEventListener('animationend', a1, { once:true });
    to.addEventListener(  'animationend', a2, { once:true });
  });
}

/* ======================== WELCOME AKIŞI ======================== */
function initWelcome(){
  // İlk ziyaret: kayıtta ne varsa onu uygula (varsayılan dark+tr)
  document.documentElement.setAttribute('data-theme', savedTheme || 'dark');
  updateThemeToggleVisual();

  // selectedLang 'tr' değilse UI'yi senkronla
  if (selectedLang !== 'tr'){ applyLang(selectedLang); }
  else {
    // TR ise info ekranı metinlerini de hazırla
    const t = WELCOME_TEXTS.tr;
    document.getElementById("info-title").innerText = t.infoTitle;
    document.getElementById("details-button").innerText = t.infoBtn;
    document.getElementById("confirm-button").innerText = t.confirm;
    document.getElementById("status").innerText = t.status;

    // How-it + Tech başlat
    updateHowItTexts('tr');
    updateTechTexts('tr');
  }

  // Tema butonu
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn?.addEventListener('click', ()=>{
    const now = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(now === 'dark' ? 'light' : 'dark');
  });

  // Dil (bayrak) butonları
  document.getElementById('btn-lang-tr')?.addEventListener('click', ()=>applyLang('tr'));
  document.getElementById('btn-lang-en')?.addEventListener('click', ()=>applyLang('en'));

  // CTA → How-It
  document.getElementById('welcome-cta')?.addEventListener('click', async ()=>{
    selectLanguage(selectedLang);
    updateHowItTexts(selectedLang);
    updateTechTexts(selectedLang);
    await routeTo('welcome-screen','howit-screen');
  });

  // How-It ekranı butonları
  bindHowItEvents();

  // Teknik Detaylar ekranı (kapat, TOC, aktif takip)
  initTechScreen();
}

function bindHowItEvents(){
  // Geri → welcome
  document.getElementById('howit-back')?.addEventListener('click', ()=>{
    routeTo('howit-screen','welcome-screen');
  });

  // Teknik Detaylar → TECH SCREEN
  document.getElementById('howit-tech')?.addEventListener('click', async ()=>{
    updateTechTexts(selectedLang);
    await routeTo('howit-screen','tech-screen');
    // görünür oldu → MathJax türüt (gövdeler zaten enjekte edildi)
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise().catch(()=>{});
  });

  // Devam Et → ana akışa geç
  document.getElementById('howit-continue')?.addEventListener('click', ()=>{
    document.getElementById('howit-screen').style.display = 'none';
    startApp();
  });
}

/* ======================== YENİ: TECH SCREEN INIT ======================== */
function initTechScreen(){
  // Kapat butonu → How-it'e geri
  document.getElementById('tech-close')?.addEventListener('click', ()=>{
    routeTo('tech-screen','howit-screen');
  });

  // TOC chip → ilgili bölüme yumuşak kaydır
  const chips = document.querySelectorAll('.tech-toc .toc-chip');
  chips.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const sel = chip.getAttribute('data-target');
      const target = sel ? document.querySelector(sel) : null;
      if (target) target.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });

  // Görünür bölüme göre aktif chip vurgusu
  const cards = document.querySelectorAll('.tech-card');
  if (cards.length && chips.length){
    const mapIdToChip = {};
    chips.forEach(chip=>{
      const sel = chip.getAttribute('data-target');
      const el  = sel ? document.querySelector(sel) : null;
      if (el && el.id) mapIdToChip[el.id] = chip;
    });

    const io = new IntersectionObserver((entries)=>{
      let best = null, bestRatio = 0;
      entries.forEach(ent=>{
        if (ent.isIntersecting && ent.intersectionRatio > bestRatio){
          best = ent.target; bestRatio = ent.intersectionRatio;
        }
      });
      if (best && mapIdToChip[best.id]){
        chips.forEach(c=>c.classList.remove('is-active'));
        mapIdToChip[best.id].classList.add('is-active');
      }
    }, { root: null, threshold: [0.35, 0.6, 0.9] });

    cards.forEach(card=>io.observe(card));
  }
}

/* ======================== ORİJİNAL AKIŞ (HARİTA/AR) ======================== */
window.onload = () => {
  document.getElementById("welcome-screen").style.display = "flex";
  initWelcome();
};

/* ======================== INFO/DİL METİNLERİ ======================== */
function selectLanguage(lang) {
  selectedLang = lang;
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

        // Declination'ı sakla
        ARState.declination = (typeof data.declination === 'number') ? data.declination : 0;

        // AR başlat düğmesi
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

/* ======================== AR STATE & UTILS ======================== */

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
  declination: 0, // backend'ten gelen sapma (E+)
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

const sunBtn = document.getElementById('sunlock-btn');
const arMat  = document.getElementById('ar-mat');

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

/* ======================== ORIENTATION LISTENERS ======================== */

function startOrientationListener() {
  ARState.orientationAbsHandler = (e) => {
    ARState.useAbsolute = true;

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
    } else {
      return;
    }

    if (!isiOSTrue) {
      heading = norm360(heading + (ARState.declination || 0));
    }

    heading = norm360(heading - ARState.headingBias);
    pushHeadingSample(heading, betaAbs, gammaAbs);
  };

  ARState.orientationRelHandler = (e) => {
    if (ARState.useAbsolute) return;

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
    } else {
      return;
    }

    if (!isiOSTrue) {
      heading = norm360(heading + (ARState.declination || 0));
    }

    heading = norm360(heading - ARState.headingBias);
    pushHeadingSample(heading, betaAbs, gammaAbs);
  };

  window.addEventListener('deviceorientationabsolute', ARState.orientationAbsHandler, true);
  window.addEventListener('deviceorientation',          ARState.orientationRelHandler, true);

  startRenderLoop();
}

function stopOrientationListener() {
  if (ARState.orientationAbsHandler) {
    window.removeEventListener('deviceorientationabsolute', ARState.orientationAbsHandler, true);
    ARState.orientationAbsHandler = null;
  }
  if (ARState.orientationRelHandler) {
    window.removeEventListener('deviceorientation', ARState.orientationRelHandler, true);
    ARState.orientationRelHandler = null;
  }
  stopRenderLoop();
}

/* ======================== FILTER ======================== */

function pushHeadingSample(heading, betaAbs, gammaAbs) {
  ARState.lastSamples.push(heading);
  if (ARState.lastSamples.length > ARState.maxSamples) ARState.lastSamples.shift();

  const med  = median(ARState.lastSamples);
  const prev = (ARState.smoothHeading ?? med);
  const diff = Math.abs(shortestDelta(med, prev));

  let baseAlpha = (diff > 10) ? 0.08 : (diff > 5 ? 0.12 : 0.18);
  const platformScale = IS_ANDROID ? 0.75 : 1.0;
  let alphaEMA = baseAlpha * platformScale;

  const tiltFactor = clamp01((Math.max(betaAbs, gammaAbs) - 25) / 40);
  alphaEMA *= (1 - 0.6 * tiltFactor);

  if (ARState.smoothHeading == null) ARState.smoothHeading = med;
  else ARState.smoothHeading = norm360(prev + alphaEMA * shortestDelta(med, prev));

  ARState.heading = heading;
  ARState.needsUpdate = true;
}

/* ======================== RENDER LOOP (60 Hz) ======================== */

function startRenderLoop() {
  if (ARState.rafId) return;
  const targetMs = 1000 / 60;
  const tick = (ts) => {
    if (!ARState.rafId) return;
    if (ARState.lastFrameTime === 0 || (ts - ARState.lastFrameTime) >= targetMs) {
      ARState.lastFrameTime = ts;
      if (ARState.needsUpdate) { ARState.needsUpdate = false; updateARUI(); }
    }
    ARState.rafId = requestAnimationFrame(tick);
  };
  ARState.rafId = requestAnimationFrame(tick);
}
function stopRenderLoop() {
  if (ARState.rafId) { cancelAnimationFrame(ARState.rafId); ARState.rafId = null; }
  ARState.lastFrameTime = 0; ARState.needsUpdate = false;
}

/* ======================== UI UPDATE ======================== */

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

  if (!ARState.tiltOK) {
    hudDelta.textContent = selectedLang === 'tr' ? 'Telefonu dikleştir' : 'Hold phone flatter';
    arArrow.style.opacity = 0.85;
    if (arMat) arMat.style.opacity = 0.9;
  } else {
    arArrow.style.opacity = 1;
    if (arMat) arMat.style.opacity = 0.95;
  }

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

/* ======================== KALİBRASYON & AR ======================== */

const Cal = {
  active: false,
  startTime: 0,
  lastAlpha: null,
  yawUnwrapped: 0,
  yawMin: 0, yawMax: 0,
  pitchMin:  999, pitchMax: -999,
  rollMin:   999, rollMax:  -999,
  handler: null,
  ui: {}
};

function initCalibrationUI() {
  const calibScreen = document.getElementById('calibration-screen');
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
      </div>`;
    const btnRow = content.querySelector('.center-buttons');
    content.insertBefore(ui, btnRow);
  }

  const calibDoneBtn = document.getElementById('calibration-done-btn');
  const calibCancelBtn = document.getElementById('calibration-cancel-btn');
  calibDoneBtn.disabled = true;

  Cal.ui = {
    stepYaw: content.querySelector('#calib-step-yaw'),
    stepPitch: content.querySelector('#calib-step-pitch'),
    stepRoll: content.querySelector('#calib-step-roll'),
    bar: content.querySelector('#calib-bar'),
    badge: content.querySelector('#quality-badge'),
    hint: content.querySelector('#quality-hint')
  };
}

function startCalibration() {
  Cal.active = true;
  Cal.startTime = performance.now();
  Cal.lastAlpha = null;
  Cal.yawUnwrapped = 0;
  Cal.yawMin = 0; Cal.yawMax = 0;
  Cal.pitchMin = 999; Cal.pitchMax = -999;
  Cal.rollMin  = 999; Cal.rollMax  = -999;

  // Bias sıfırla
  ARState.headingBias = 0;
  localStorage.removeItem('headingBias');

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

    if (beta  < Cal.pitchMin) Cal.pitchMin = beta;
    if (beta  > Cal.pitchMax) Cal.pitchMax = beta;
    if (gamma < Cal.rollMin)  Cal.rollMin  = gamma;
    if (gamma > Cal.rollMax)  Cal.rollMax  = gamma;

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
  const yawSweep   = Math.abs(Cal.yawMax - Cal.yawMin);
  const pitchRange = Math.abs(Cal.pitchMax - Cal.pitchMin);
  const rollRange  = Math.abs(Cal.rollMax  - Cal.rollMin);

  const yawOK   = yawSweep   >= 270;
  const pitchOK = pitchRange >= 80;
  const rollOK  = rollRange  >= 80;

  Cal.ui.stepYaw.classList.toggle('done',   yawOK);
  Cal.ui.stepPitch.classList.toggle('done', pitchOK);
  Cal.ui.stepRoll.classList.toggle('done',  rollOK);

  const pYaw   = Math.max(0, Math.min(1, yawSweep/270));
  const pPitch = Math.max(0, Math.min(1, pitchRange/80));
  const pRoll  = Math.max(0, Math.min(1, rollRange/80));
  const prog   = Math.round(((pYaw + pPitch + pRoll) / 3) * 100);

  Cal.ui.bar.style.width = `${prog}%`;

  let qualityClass = 'bad';
  let qualityText  = selectedLang==='tr' ? 'Kalite: Düşük' : 'Quality: Low';
  let hintText     = selectedLang==='tr' ? 'Telefonu üç eksende hareket ettir' : 'Move phone on all 3 axes';
  const minDurationOK = (performance.now() - Cal.startTime) > 5000;

  if (prog >= 85) { qualityClass='good'; qualityText=selectedLang==='tr'?'Kalite: Yüksek':'Quality: High'; hintText=selectedLang==='tr'?'Harika! Devam edebilirsin.':'Great! You can proceed.'; }
  else if (prog >= 60) { qualityClass='ok'; qualityText=selectedLang==='tr'?'Kalite: Orta':'Quality: Medium'; hintText=selectedLang==='tr'?'Biraz daha çevir, tam tur dene':'Rotate more, try a full spin'; }

  Cal.ui.badge.className = `quality-badge ${qualityClass}`;
  Cal.ui.badge.textContent = qualityText;
  Cal.ui.hint.textContent  = hintText;

  const doneBtn = document.getElementById('calibration-done-btn');
  doneBtn.disabled = !(prog >= 85 && minDurationOK);
}

/* ======================== AKIŞ KONTROL ======================== */
function androidNoticeText() {
  return (selectedLang === 'tr')
    ? 'ÖNEMLİ: Android cihazlarda AR pusula doğruluğu geliştirme aşamasındadır. Sonuçlar cihaza ve ortama göre değişebilir. Geri bildirimlerinizi paylaşabilirsiniz.'
    : 'IMPORTANT: On Android devices, AR compass accuracy is under active development. Results may vary by device and environment. Please share feedback.';
}

function showCalibration() {
  const noticeEl = document.getElementById('android-notice');
  if (noticeEl) {
    if (IS_ANDROID) {
      noticeEl.textContent = androidNoticeText();
      noticeEl.classList.remove('hidden');
    } else {
      noticeEl.classList.add('hidden');
      noticeEl.textContent = '';
    }
  }

  const calibScreen = document.getElementById('calibration-screen');
  calibScreen.classList.remove('hidden');
  calibScreen.setAttribute('aria-hidden', 'false');
}

function hideCalibration() {
  const calibScreen = document.getElementById('calibration-screen');
  calibScreen.classList.add('hidden');
  calibScreen.setAttribute('aria-hidden', 'true');
}

function showAR() {
  document.body.classList.add('ar-mode');
  const arContainer = document.getElementById('ar-container');
  arContainer.classList.remove('hidden');
  arContainer.setAttribute('aria-hidden', 'false');
}
function hideAR() {
  document.body.classList.remove('ar-mode');
  const arContainer = document.getElementById('ar-container');
  arContainer.classList.add('hidden');
  arContainer.setAttribute('aria-hidden', 'true');
}

async function startARFlow() {
  if (!isARSupported()) {
    alert(selectedLang === 'tr' ? 'Bu cihaz AR modunu desteklemiyor.' : 'This device does not support AR mode.');
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
if (startArBtn) startArBtn.addEventListener('click', startARFlow);
if (calibDoneBtn) calibDoneBtn.addEventListener('click', beginRealAR);
if (calibCancelBtn) calibCancelBtn.addEventListener('click', () => { stopCalibration(); hideCalibration(); });
if (arExitBtn) arExitBtn.addEventListener('click', stopAR);

/* ======================== DİĞER ======================== */
function enableARButton(qiblaAngleDeg) {
  ARState.qiblaAngle = qiblaAngleDeg;
  if (startArBtn) startArBtn.style.display = 'inline-block';
}

/* ======================== GLOBAL INTRO ORKESTRASYONU ======================== */
/* Amaç: sayfa ilk yüklendiğinde tüm öğeler aynı uzun “fade+blur” animasyonuyla
   ortaya çıksın. CSS bunu .intro-on sınıfı varken uygular. Burada yalnızca
   o sınıfı doğru zamanda kaldırıyoruz. */
let __introPlayed = false;
function playIntro(){
  if (__introPlayed) return;
  __introPlayed = true;
  const html = document.documentElement;
  html.classList.remove('intro-on');
  html.classList.add('intro-played');
}

/* load geldikten kısa süre sonra oynat (görsel/CSS tamamen geldiyse) */
window.addEventListener('load', () => {
  setTimeout(playIntro, 300);      // küçük bekleme FOUC’ı azaltır
});
/* emniyet kemeri: load gecikirse en fazla 2.5s sonra gene oynat */
setTimeout(playIntro, 2500);
