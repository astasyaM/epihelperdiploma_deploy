Поместите сюда собранный release APK с именем episvyaz-release.apk

Сборка (из корня проекта Flutter):
  flutter build apk --release

После сборки скопируйте файл:
  build\app\outputs\flutter-apk\app-release.apk
  -> deploy\website\downloads\episvyaz-release.apk

Обновите метаданные:
  deploy\scripts\update-apk-metadata.ps1
