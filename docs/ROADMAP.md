# Yol Haritası — Sonraki Adımlar

> **Dil:** Türkçe. Her madde, sonradan tek başına seçilip geliştirilebilecek bir kullanıcı hikâyesidir. Hikâyeler **yaklaşık öncelik sırasına** göre dizilmiştir; ama bağımlılık zinciri yoksa istediğin sıradan başlayabilirsin.

> **Son tamamlanan adım:** S10 — Sessions view (siralanabilir kolonlar, hizli arama ve satirdan acilan detay drawer tamamlandi).
>
> **Aktif adım:** S11 — Projects view.

---

## S10 · Sessions view

**Kullanıcı olarak**, hangi oturumun ne kadar token ve maliyet ürettiğini, hangi modeli kullandığını ve ne zaman olduğunu görmek istiyorum; **böylece** pahalı oturumları tek tıkla bulup gözden geçirebileyim.

**Kabul kriterleri**
- [x] Sol kenar çubuğundaki "Oturumlar" girişi `SessionsView`'i açar.
- [x] Tablo sütunları: oturum kısa-id'si, proje, son aktivite (relative), süre, mesaj sayısı, ana model, toplam token (compact), maliyet.
- [x] Sütunlar sıralanabilir (varsayılan: son aktivite desc).
- [x] Hızlı arama (proje adı veya session id alt-stringi).
- [x] Bir satıra tıklayınca tek-oturum drawer'ı açılır: model bazlı kırılım, ilk/son ts, süre, KPI'lar.
- [x] Tarih aralığı filtresi mevcut aggregation'dan geldiği için view ek bir şey yapmıyor (sadece `aggregation.sessions`'ı kullanıyor).

**Notlar**
- `aggregation.sessions` zaten sıralı (son aktivite desc) geliyor; tablo başlangıç datasını oradan al.
- Kısa session id için [`shared/utils/short-sid.ts`](src/shared/utils/short-sid.ts) hazır.
- Süre = `lastTs - firstTs`; `formatDuration` helper'ı kullan.
- Drawer için yeni bir `presentation/components/ui/drawer.tsx` (shadcn'den) ekle; `add-shadcn-component` skill'i bunu otomatize eder.

**Dosyalar (yeni)**
- `src/presentation/views/sessions-view.tsx`
- `src/presentation/components/data/sessions-table.tsx`
- `src/presentation/components/data/session-detail-drawer.tsx`
- `src/infrastructure/i18n/locales/{tr,en}.json` → `sessions.*` anahtarları

**Bağımlılık:** —

---

## S11 · Projects view

**Kullanıcı olarak**, projelere göre toplam maliyet ve oturum sayısı kırılımını görmek; **böylece** hangi projelere yatırım yaptığımı anlamak istiyorum.

**Kabul kriterleri**
- [ ] "Projeler" sidebar girişi `ProjectsView`'i açar.
- [ ] Tablo: proje adı, oturum sayısı, mesaj sayısı, toplam token (compact), maliyet, son aktivite. Sıralanabilir.
- [ ] Bir projeye tıklayınca alttaki bölme o projenin oturumlarını filtreli olarak gösterir (Sessions tablosunun kompakt bir versiyonu).
- [ ] Üst tarafta "top 5 proje" mini-bar listesi (mevcut `TopProjectsList` ile aynı görsel dil).

**Notlar**
- Kaynak: `aggregation.projects`.
- "Projedeki oturumlar" kompakt görüntüsü Sessions tablosundan ufak parametreyle türetilebilir (filter prop).

**Dosyalar (yeni)**
- `src/presentation/views/projects-view.tsx`
- `src/presentation/components/data/projects-table.tsx`

**Bağımlılık:** S10 — Sessions tablosunu ortak component yapacaksak önce o.

---

## S12 · By-date view (Tarihe Göre)

**Kullanıcı olarak**, günlük / haftalık / aylık gruplandırma ile ham aktiviteyi tablo halinde görmek; **böylece** belirli bir aralığa zoom yapabileyim.

**Kabul kriterleri**
- [ ] Sidebar "Tarihe Göre" girişi `ByDateView`'i açar.
- [ ] Üstte üç buton: Günlük / Haftalık / Aylık.
- [ ] Tablo: tarih (veya ISO hafta / ay), maliyet, toplam, input, output, cache-r, cache-w, mesaj, oturum, proje. Sıralanabilir.
- [ ] Hafta = ISO 8601 (Pazartesi başlangıç). Ay = `YYYY-MM`.
- [ ] Boş günler **tabloda gösterilmez** (timeline gap-fill'inden farklı: tabloda gürültü yapar).
- [ ] CSV indir butonu (opsiyonel, S15'te de yapılabilir).

**Notlar**
- Hafta/ay grupingi yeni bir `application/use-cases/group-daily-by.ts` use-case'i + sibling test ile ekle.
- ISO hafta hesabı için küçük helper: `domain/value-objects/iso-week.ts`.

**Dosyalar (yeni)**
- `src/application/use-cases/group-daily-by.ts` + test
- `src/domain/value-objects/iso-week.ts` + test
- `src/presentation/views/by-date-view.tsx`
- `src/presentation/components/data/by-date-table.tsx`

**Bağımlılık:** —

---

## S13 · Pricing editor

**Kullanıcı olarak**, default tarifeyi değiştirip kendi pazarlık ettiğim fiyatları kullanmak ve bunu cihazımda saklamak istiyorum.

**Kabul kriterleri**
- [ ] Sidebar "Fiyatlandırma" aksiyonu modal/drawer açar.
- [ ] Her tier için 5 alan: input, output, cache read, cache write 5m, cache write 1h ($/M).
- [ ] "Varsayılana sıfırla" butonu o tier'ı default'a döndürür.
- [ ] Kaydet butonu `localStorage`'a yazar; sayfa yenileme sonrası korunur.
- [ ] Geçersiz girdi (negatif sayı, NaN) form-level hata olarak gösterilir, kayıt engellenir.
- [ ] KPI / donut / model breakdown / timeline anında yeni fiyatla yeniden hesaplanır (mevcut memo zaten ref-eşitliğine bağlı; pricing değiştiğinde re-aggregate olmalı).

**Notlar**
- `application/use-cases/load-pricing.ts` ve `save-pricing.ts` zaten var; sadece UI eksik.
- `usePricing` hook'u şu an sadece okuyor olabilir; yazmayı da expose edecek şekilde gözden geçir.

**Dosyalar (yeni)**
- `src/presentation/components/data/pricing-editor.tsx`
- `src/presentation/components/ui/dialog.tsx` (shadcn primitive)
- (gerekirse) `src/presentation/hooks/use-pricing.ts` güncelle

**Bağımlılık:** —

---

## S14 · Reload & Clear aksiyonları

**Kullanıcı olarak**, sidebar'daki **Yeniden yükle** ve **Temizle** butonlarının fiilen çalışmasını istiyorum.

**Kabul kriterleri**
- [ ] **Yeniden yükle**: önceki klasör/dosya seçimi hatırlanıyorsa onu yeniden parse eder; hatırlanmıyorsa folder picker'ı açar.
- [ ] **Temizle**: confirmation prompt sonrası `events.clear()` çağırır ve filtreyi (`useFilters.reset()`) sıfırlar.
- [ ] Veri yokken her iki butonun davranışı tutarlı (clear no-op olabilir).

**Notlar**
- File System Access API ile dizin handle'ı persiste edilebilirse "yeniden yükle" gerçek anlamlı olur. Yoksa folder picker'ı tekrar açmaktan ibaret.
- Confirmation için S13'teki `dialog` primitive'i tekrar kullanılabilir.

**Dosyalar (etkilenen)**
- `src/app/page.tsx` (sidebar `onAction` handler'ı)
- (yeni) `src/presentation/hooks/use-folder-handle.ts` (FSA persiste etmek istersen)

**Bağımlılık:** S13 (dialog primitive'i ortak).

---

## S15 · CSV / JSON dışa aktarma

**Kullanıcı olarak**, mevcut görünümün verisini CSV (veya JSON) olarak indirmek; **böylece** tabloyu Excel'de açabilmek veya başka bir araca aktarmak istiyorum.

**Kabul kriterleri**
- [ ] By-date, Sessions ve Projects view'larında topbar'da bir "Dışa aktar" butonu var.
- [ ] CSV: BOM'lu UTF-8, virgül ayraçlı, ondalık nokta. Dosya adı: `claude-tokens-{view}-{YYYY-MM-DD}.csv`.
- [ ] JSON: pretty-printed, görünen kolonların aynısı.
- [ ] Aktarılan veri **mevcut filtreye uyar** (date range vs.).

**Dosyalar (yeni)**
- `src/shared/utils/to-csv.ts` + test
- (etkilenen) ilgili view'larda export butonu

**Bağımlılık:** S10 / S11 / S12'den en az biri.

---

## S16 · Static export ve GitHub Pages dağıtımı

**Kullanıcı olarak**, projeyi GitHub'a koyup statik bir Pages site olarak yayınlamak; **böylece** repo URL'sinden direkt panoyu açabilmek istiyorum.

**Kabul kriterleri**
- [ ] `npm run build:static` (`BUILD_STATIC=1 next build`) statik export üretir.
- [ ] `next.config.mjs` static export modunda doğru `basePath` ve `assetPrefix` kullanır.
- [ ] GitHub Actions workflow: push'ta build → `gh-pages` branch'ine deploy.
- [ ] README'de "live demo" linki + "kendi tarayıcında çalıştırma" yönergesi.
- [ ] Locale (TR/EN) tahmini sunucu yokken de çalışıyor (cookie / localStorage fallback).

**Notlar**
- `package.json` zaten `cross-env BUILD_STATIC=1 next build` script'ini içeriyor; tetik tarafı eksik.
- `next-intl`'in middleware'i statik export'la uyumlu olmayabilir; `Locale-as-state` (mevcut yaklaşım) muhtemelen yeterli.

**Dosyalar**
- `.github/workflows/deploy.yml` (yeni)
- `next.config.mjs` (etkilenen)
- `README.md` (etkilenen)

**Bağımlılık:** —

---

## S17 · Saatlik dağılıma "günün saati × hafta günü" heatmap

**Kullanıcı olarak**, hangi gün-saat kombinasyonunda yoğunlaştığımı (örn. Pazartesi 10:00) görmek istiyorum.

**Kabul kriterleri**
- [ ] Timeline view'a 7×24'lük heatmap kartı eklendi.
- [ ] Hücre rengi total token'a göre; tooltip cost + token + mesaj sayısı.
- [ ] Aggregation'a yeni bir bucket (`weekHourly: number[7][24]`) eklendi; mevcut single-pass aggregator'ı bozmadan extend et.

**Dosyalar (yeni / etkilenen)**
- `src/domain/entities/week-hourly-bucket.ts`
- `src/application/use-cases/aggregate-events.ts` (extend)
- `src/presentation/components/charts/week-hour-heatmap.tsx`

**Bağımlılık:** —

---

## S18 · Erişilebilirlik geçişi

**Kullanıcı olarak**, ekran okuyucu / klavye ile dolaşırken paneli rahat kullanmak istiyorum.

**Kabul kriterleri**
- [ ] Tüm interaktif element'lerde anlamlı `aria-label`.
- [ ] Tab sırası mantıklı; focus ring her zaman görünür.
- [ ] Donut / bar chart için tabloya text alternatifi (`aria-describedby` veya `<title>`).
- [ ] Renk kontrastı WCAG AA — özellikle dark mode'da accent + foreground.
- [ ] Drawer / dialog odak tuzağı (focus trap) çalışıyor; ESC kapatıyor.

**Notlar**
- `axe-core` veya Lighthouse run'ı ile başla; raporu repoya işle.

**Dosyalar:** her view'a ufak dokunuşlar.

**Bağımlılık:** S10–S13 (Drawer/Dialog primitive'leri yerleştikten sonra).

---

## S19 · Playwright E2E testleri

**Kullanıcı olarak**, kritik kullanıcı akışlarının regresyona uğramadığından emin olmak istiyorum.

**Kabul kriterleri**
- [ ] Fixture: küçük bir `.jsonl` dosyası (`jsonl-fixture-generator` skill'i ile üret).
- [ ] Senaryo 1: Dropzone'a fixture bırak → KPI'lar > 0.
- [ ] Senaryo 2: Timeline view → 7g preset → daily x-ekseni 7 etikete iniyor.
- [ ] Senaryo 3: Dil değiştir → string'ler değişiyor.
- [ ] CI'da çalışıyor (S16 deploy workflow'una bağla).

**Dosyalar (yeni)**
- `tests/e2e/*.spec.ts`
- `tests/fixtures/*.jsonl`

**Bağımlılık:** S16 (CI hazır olmalı; ama lokal koşmak için zorunlu değil).

---

## S20 · README + ekran görüntüleri

**Kullanıcı olarak**, GitHub'da projeyi açtığımda ne işe yaradığını ve nasıl çalıştırılacağını saniyeler içinde anlamak istiyorum.

**Kabul kriterleri**
- [ ] Üstte tek paragraf "ne işe yarar".
- [ ] Bir GIF veya 2–3 ekran görüntüsü (overview, timeline, sessions).
- [ ] "Çalıştırma" / "Build" / "Deploy" bölümleri.
- [ ] Veri gizliliği vurgusu: "tarayıcı dışına çıkmaz".
- [ ] Lisans + katkı rehberi linki.

**Dosyalar:** `README.md` (etkilenen), `docs/screenshots/` (yeni).

**Bağımlılık:** S16.

---

## Geri kalan fikirler (henüz hikâye değil)

Aşağıdakiler senaryoyu netleştirmeden iş başına alma; önce küçük bir sketch / kullanıcı geri bildirimi iyi olur.

- **Bütçe/uyarı**: aylık $X eşiği; aşılırsa banner.
- **Karşılaştırma modu**: iki tarih aralığını yan yana koyma.
- **Maliyet projeksiyonu**: son 7 günün eğilimine göre ay sonu tahmini.
- **Tag'ler**: oturuma manuel etiket atama (proje gruplaması haricinde).
- **PWA / offline first**: service worker ile cache; tabloya bookmark gibi davranma.
- **Multi-cwd merge**: aynı projenin farklı path varyantlarını (Windows vs WSL) tek anahtar altında birleştir.

---

### Hatırlatma

- Yeni iş başlatırken: **CLAUDE / projenin mimari katman kuralı** geçerli (`domain/`, `application/`, `infrastructure/`, `presentation/`, `shared/`). Use-case yokken view'a iş yaptırma; UI string'i `tr.json` + `en.json`'a yazmadan komponent'a yazma.
- Her hikâye ideal olarak: **bir use-case (varsa) + sibling vitest** + **bir/iki presentation komponenti** + **i18n anahtarları** + (varsa) **küçük bir domain helper'ı** + tarayıcıda göz ile doğrulama.
- "Devam" akışı: büyük hikâyeyi alt-adımlara böl, her alt-adımdan sonra dur, kullanıcı "devam" dedikçe ilerle.
