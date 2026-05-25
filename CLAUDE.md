# Tuneaway

## Proje yapısı

- `tuneawaysinger/` → şarkıcının kullandığı uygulama (React Native + Expo)
- `tuneawayuser/` → dinleyicinin kullandığı uygulama (React Native + Expo)

## Tech stack

- React Native + Expo
- TypeScript
- Firebase (auth + Firestore)
- Redux Toolkit
- React Navigation

## Nasıl çalışır

1. Şarkıcı giriş yapar, bir oturum (session) başlatır
2. Şarkıcı QR kod oluşturur (bu QR, session ID'yi içerir)
3. Dinleyici QR kodu okutur, şarkıcının oturumuna bağlanır
4. Dinleyici o oturuma parça isteği gönderir
5. Şarkıcı dashboard'unda gelen istekleri görür

## Veri modelleri

### Singer

```ts
{
  uid: string;
  displayName: string;
  email: string;
}
```

### Session

```ts
{
  id: string;
  singerId: string;
  isActive: boolean;
  createdAt: timestamp;
}
```

### SongRequest

```ts
{
  id: string;
  sessionId: string;
  songName: string;
  artistName: string;
  requestedAt: timestamp;
}
```

## Firebase yapısı

- `sessions/{sessionId}` → aktif oturumlar
- `sessions/{sessionId}/requests/{requestId}` → parça istekleri

## Önemli notlar

- tuneawaysinger ve tuneawayuser ayrı repolar ama aynı Firebase projesini kullanır
- QR kod içinde sessionId taşınır
- Dinleyici kayıt/giriş gerektirmez (anonim kullanım)
