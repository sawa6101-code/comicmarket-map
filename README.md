# コミケマップ PWA

Expo Web + React Native Webベースのコミケ会場マップPWAです。

## 機能
- SVG会場マップ
- サークル選択
- 未訪問 / 訪問済み / 完売
- サークル名・スペース検索
- 状態フィルター
- localStorageによる状態保存
- PWA manifest / Service Worker
- Firebase同期を追加できる構成

## 開発
```bash
npm install
npm run web
```

## PWAビルド
```bash
npm run build:pwa
```

現在のサークル情報はサンプルデータです。実際のコミケ配置図・サークル一覧を追加して完成版へ更新できます。