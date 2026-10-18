/* TWC Warehouse — Service Worker: เก็บหน้าเปิดแอปไว้ในเครื่อง เพื่อให้เปิดไวและแสดงหน้า "ไม่มีอินเทอร์เน็ต" ได้
 * ข้อมูลคลังสินค้าทั้งหมดยังอ่าน/เขียนผ่าน Google Apps Script แบบออนไลน์เสมอ (ไม่แคชข้อมูล) */
const CACHE = 'twc-app-v3';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // ไม่ยุ่งกับ Google Apps Script
  if (e.request.mode === 'navigate') {
    // ออนไลน์: เอาไฟล์ใหม่ล่าสุด (ได้ค่าตั้งค่าใหม่ทันที) · ออฟไลน์: ใช้ไฟล์ในเครื่อง
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
