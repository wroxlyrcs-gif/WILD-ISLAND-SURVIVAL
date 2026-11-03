# WILD ISLAND: SURVIVAL

Three.js tabanlı, Android yatay ekran hedefli açık dünya hayatta kalma prototipi.

## Gereksinimler
- Node.js 18 veya üzeri
- npm
- Android APK için Android Studio, Android SDK ve JDK 17

## Web sürümünü çalıştırma
1. `npm install`
2. `npm run build`
3. `dist/index.html` dosyasını yerel bir web sunucusu üzerinden açın.

Örnek: `npx serve dist`

`index.html` dosyasını doğrudan `file://` üzerinden açmak her tarayıcıda güvenilir değildir.

## Android
1. `npm install`
2. `npm run build`
3. İlk kurulumda: `npx cap add android`
4. `npx cap sync android`
5. `npx cap open android`

Android Studio'da Build > Build Bundle(s) / APK(s) > Build APK(s) seçin.

Komut satırında:
- Windows: `cd android && gradlew.bat assembleDebug`
- macOS/Linux: `cd android && ./gradlew assembleDebug`

Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`

## Kontroller
- Sol joystick: hareket
- Sağ ekran: kamerayı döndürme
- ZIPLA: zıplama
- KOŞ: basılı tutarak koşma
- TOPLA: yakındaki kaynağı toplama
- Üst düğmeler: harita, envanter, üretim ve duraklatma

## Durum
Bu teslimat oynanabilir bir temel prototiptir. Gelişmiş hayvan AI, gerçek arazi yükseklik haritası, balık tutma, görev zinciri, çok bölgeli dünya, ayrıntılı bina yerleştirme ve tam animasyonlu karakter henüz tamamlanmış özellikler değildir.
