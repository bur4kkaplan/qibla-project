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