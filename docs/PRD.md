# Ürün Gereksinim Dokümanı (PRD)

**Ürün adı:** Claude Token Dashboard
**Sürüm:** 0.1.0 (yeniden yazım)
**Doküman sahibi:** Strateji Bilişim
**Son güncelleme:** 2026-04-26
**Dil:** Türkçe (İngilizce sürüm: [`PRD.en.md`](./PRD.en.md))

---

## 1. Vizyon

Claude Code kullanıcılarının yerel oturum kayıtlarından (`.jsonl`) **hiçbir veriyi tarayıcı dışına çıkarmadan**, token tüketimlerini ve maliyetlerini görselleştirmesini sağlayan, hızlı, sade ve gözü yormayan bir analiz panosu sunmak.

## 2. Sorun

Claude Code, her oturumun ham kullanım kaydını `~/.claude/projects/<proje>/<oturum>.jsonl` altında tutar. Kullanıcı:

- Hangi projeye/oturuma ne kadar token harcadığını bilmiyor.
- Cache okuma/yazma maliyetinin toplam faturadaki payını göremiyor.
- Model bazlı (Opus/Sonnet/Haiku) maliyet kırılımı yok.
- Günlük/haftalık/aylık trendi takip edemiyor.

Anthropic Console'daki fatura sayfası proje/oturum kırılımı sunmuyor; mevcut üçüncü taraf araçlar genellikle dosyaları sunucuya yüklemek istiyor — bu da gizlilik açısından kabul edilemez.

## 3. Hedef kullanıcılar

| Persona | İhtiyaç |
|---|---|
| **Bireysel geliştirici** | Hangi projenin/oturumun para yaktığını görmek; aylık bütçeyi takip etmek. |
| **Takım lideri** | Takım içinde model seçim alışkanlıklarını analiz etmek; cache stratejisinin etkinliğini ölçmek. |
| **Danışman / freelancer** | Müşteri başına saatlik değil, oturum başına maliyet faturalandırmak için kanıt üretmek. |

## 4. Başarı kriterleri

- **K1** — `~/.claude/projects` klasörünün tamamı sürüklendiğinde **5 sn altında** ayrıştırma (10.000 satıra kadar).
- **K2** — Tüm hesaplamalar tarayıcıda; **ağ isteği yok** (CDN dışında).
- **K3** — Lighthouse performans skoru ≥ 95 (masaüstü).
- **K4** — Türkçe ve İngilizce eksiksiz; üçüncü dil eklemek tek bir sözlük dosyası iş.
- **K5** — Yeni bir görünüm (view) eklemenin maliyeti < 1 gün; UI tek bir bileşen kütüphanesinden gelir (shadcn/ui).

## 5. Kapsam (MVP — v0.1)

### 5.1 Veri girişi
- Klasör sürükle-bırak (`webkitdirectory`) — alt klasörler dahil tüm `.jsonl` dosyaları taranır.
- Tek tek `.jsonl` dosyası seçimi (Shift+tık ile çoklu).
- "Yeniden yükle" — son seçilen kaynağı yeniden okur.
- "Temizle" — bellekteki veriyi siler, fiyatlandırma ayarı korunur.

### 5.2 Görünümler
1. **Özet** — KPI kartları (toplam, giriş, çıkış, cache-r, cache-w, $ maliyet), token dağılımı donut grafiği, en yoğun 5 proje, en yoğun 5 oturum, model bazlı kırılım.
2. **Projeler** — Yığılmış bar grafik + sıralanabilir/aranabilir tablo (proje → genişletilince oturumlar).
3. **Oturumlar** — Tüm oturumlar tek tabloda; satıra tıklayınca oturum detay penceresi (model bazlı kırılım, kullanım, maliyet, süre).
4. **Zaman Çizgisi** — Günlük çizgi grafik (toplam / maliyet / ayrıntılı modları), en yoğun günler listesi, saat-bazlı dağılım (0–23).
5. **Tarihe Göre** — Günlük/haftalık/aylık gruplama tablosu, sıralama.

### 5.3 Filtreler
- Tarih aralığı: özel + hızlı pillar (Bugün, 7g, 30g, Bu ay, Geçen ay, Tümü).
- Tablolarda metin araması (proje / oturum adı).
- Tablo başlıklarından sıralama (artan/azalan).

### 5.4 Fiyatlandırma
- Anthropic resmi liste fiyatları varsayılan; Opus 4.x, Sonnet 4.x, Haiku 4.x ve eski sürümler için ayrı satırlar.
- Kullanıcı her satırı düzenleyebilir; `localStorage` ile saklanır.
- Sütunlar: giriş / çıkış / cache okuma / 5dk cache yazma / 1sa cache yazma (USD per 1M token).
- Bilinmeyen model için "default" satırı.

### 5.5 Tasarım
- **Varsayılan tema:** açık (light) — okunabilir, beyaz boşluğa öncelik.
- **Karanlık tema:** opsiyonel toggle, sistem tercihini takip eder.
- **Tipografi:** Geist Sans (UI) + Geist Mono (sayılar/yollar).
- **Renk paleti:** zinc nötrleri + tek bir vurgu (warm amber — Claude marka tonu); token tipleri için 4 renk (giriş/çıkış/cache-r/cache-w).
- Boşluk artırılmış, kenarlıklar yumuşatılmış, animasyonlar 120–200ms.
- Mobil/tablet tek sütun grid'e düşer.

### 5.6 i18n
- TR (varsayılan) + EN.
- URL prefix yok; dil kullanıcı tarafından `localStorage` üzerinden seçilir, `<html lang>` güncellenir.
- Tüm string'ler sözlük dosyalarında (`tr.json`, `en.json`); bileşenlerde sabit metin yok.

### 5.7 Gizlilik
- Hiçbir dosya/log sunucuya gitmez. Telemetri yok.
- `localStorage` yalnızca: tema tercihi, dil, fiyatlandırma override'ları.
- README ve uygulama footer'ı bu garantiyi açıkça belirtir.

## 6. Kapsam dışı (v0.1'de yok)

- Anthropic API ile direkt entegrasyon (oturum açma, fatura çekme).
- Çoklu kullanıcı / hesap senkronizasyonu.
- Sunucu tarafı persistence, veritabanı.
- PDF/CSV export (v0.2'de hedef).
- Bütçe alarmları / e-posta bildirimi.

## 7. Teknik gereksinimler

| Alan | Karar |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Dil | TypeScript (strict) |
| Stil | Tailwind CSS 4 + shadcn/ui |
| i18n | `next-intl` |
| Grafik | Tek seferlik küçük SVG bileşenleri (donut, bar, line, hist) — harici grafik kütüphanesi yok |
| Test | Vitest (domain + use case birim testleri); Playwright (kritik kullanıcı akışları) |
| Tarayıcı | Son 2 sürüm Chromium, Firefox, Safari |
| Deploy | Vercel (varsayılan); statik export ile GitHub Pages alternatifi |
| Lisans | MIT |

## 8. Mimari ilkeler

Detay için: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

- **Katmanlı (clean architecture):** `domain → application → infrastructure → presentation`.
- **Tek yön bağımlılık:** içe doğru. UI domain'e bağımlı, domain hiçbir şeye bağımlı değil.
- **Saf domain:** parsing/aggregation/cost hesabı framework bağımsız, doğrudan birim test edilebilir.
- **i18n-first:** ham metin yok; her string anahtar üzerinden çözülür.

## 9. Yol haritası

| Sürüm | Hedef |
|---|---|
| v0.1 | MVP (yukarıdaki kapsam) |
| v0.2 | CSV/JSON export, basit bütçe gösterge çubuğu |
| v0.3 | Toplu karşılaştırma (proje A vs B), tag sistemi |
| v0.4 | İsteğe bağlı PWA modu (offline kullanım) |
| v1.0 | Stabil API kontratı, dokümantasyon, ilk sürüm yayını |

## 10. Riskler

| Risk | Etki | Azaltım |
|---|---|---|
| Çok büyük `.jsonl` setleri (>100MB) | Tarayıcı belleği şişer | Stream parsing, `requestIdleCallback` ile yığın işleme |
| Anthropic fiyat değişikliği | Hesaplama yanlışı | Kullanıcı düzenlenebilir fiyat tablosu + sürüm notlarında uyarı |
| Yeni model isimlendirmeleri | Yanlış tier eşleşmesi | Domain'de `modelTier()` saf fonksiyon + birim test paketi |
| Tarayıcı API farkı (`webkitdirectory`) | Firefox'ta tutarsız davranış | Fallback: çoklu dosya seçici + drag-drop event'inden `entries` okuma |

## 11. Kabul kriterleri (MVP)

- [ ] `~/.claude/projects` klasörü sürüklendiğinde tüm 5 görünüm doluyor.
- [ ] Fiyatlandırma değişince tüm KPI'lar ve grafikler tek render'da güncelleniyor.
- [ ] Dil değişimi sayfa yenilemesi olmadan tüm metinleri çeviriyor.
- [ ] Tarih filtresi tüm görünümlere senkron uygulanıyor.
- [ ] Açık/karanlık tema arasında geçişte renkler okunabilir kontrastta.
- [ ] Mobilde sidebar üst banner'a dönüşüyor; tablolar yatay kaydırılıyor.
- [ ] Build sonrası `dist/` (static export) çift tıklamayla `index.html` üzerinden çalışıyor.
