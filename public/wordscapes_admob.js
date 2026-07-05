/* ══════════════════════════════════════════════════
   ADMOB SERVICE — wordscapes_admob.js
   ══════════════════════════════════════════════════
   Kurulum:
   1) npm install @capacitor-community/admob
   2) npx cap sync android
   3) Bu dosyayı public/ klasörüne koy (index.html ile aynı yere)
   4) AndroidManifest.xml'e App ID ekli (AndroidManifest_HAZIR.xml'e bak)
══════════════════════════════════════════════════ */

import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

// ─── GERÇEK REKLAM ID'LERİ ───
const AD_IDS = {
  appId:        'ca-app-pub-5151659845948742~4890171078', // App ID
  banner:       'ca-app-pub-5151659845948742/8937227295', // Banner Ad Unit ID
  interstitial: 'ca-app-pub-5151659845948742/6372597532', // Interstitial Ad Unit ID
};

let admobInitialized = false;
let interstitialReady = false;
let levelsCompletedSinceLastAd = 0;
const LEVELS_PER_INTERSTITIAL = 5; // Her 5 levelde bir interstitial göster

/* ── AdMob başlat ── */
export async function initAdMob() {
  if (admobInitialized) return;
  try {
    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: false, // GERÇEK REKLAMLAR AÇIK
    });
    admobInitialized = true;
    console.log('[AdMob] Initialized successfully');

    // İlk interstitial'ı önceden yükle
    await prepareInterstitial();

    // Banner'ı göster
    await showBanner();
  } catch (e) {
    console.error('[AdMob] Init failed:', e);
  }
}

/* ── BANNER REKLAM — sürekli ekranda alt kısımda ── */
export async function showBanner() {
  try {
    await AdMob.showBanner({
      adId: AD_IDS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false, // GERÇEK REKLAMLAR AÇIK
    });
    console.log('[AdMob] Banner shown');
  } catch (e) {
    console.error('[AdMob] Banner failed:', e);
  }
}

export async function hideBanner() {
  try {
    await AdMob.hideBanner();
  } catch (e) {
    console.error('[AdMob] Hide banner failed:', e);
  }
}

/* ── INTERSTITIAL REKLAM — her 5 levelde bir ── */
export async function prepareInterstitial() {
  try {
    await AdMob.prepareInterstitial({
      adId: AD_IDS.interstitial,
      isTesting: false, // GERÇEK REKLAMLAR AÇIK
    });
    interstitialReady = true;
    console.log('[AdMob] Interstitial prepared');
  } catch (e) {
    console.error('[AdMob] Prepare interstitial failed:', e);
    interstitialReady = false;
  }
}

/* ── Level tamamlandığında çağrılır ── */
export async function onLevelCompleted() {
  levelsCompletedSinceLastAd++;

  if (levelsCompletedSinceLastAd >= LEVELS_PER_INTERSTITIAL) {
    levelsCompletedSinceLastAd = 0;
    await showInterstitial();
  }
}

async function showInterstitial() {
  if (!interstitialReady) {
    console.log('[AdMob] Interstitial not ready, skipping');
    await prepareInterstitial();
    return;
  }
  try {
    await AdMob.showInterstitial();
    interstitialReady = false;
    console.log('[AdMob] Interstitial shown');
    // Sonraki gösterim için yeni reklam hazırla
    setTimeout(() => prepareInterstitial(), 1000);
  } catch (e) {
    console.error('[AdMob] Show interstitial failed:', e);
    prepareInterstitial();
  }
}

// Global olarak erişilebilir yap
window.WSAdMob = {
  init: initAdMob,
  onLevelCompleted,
  showBanner,
  hideBanner,
};
