---
title: "getTelemetry() | Node.js"
slug: /node/node/Client-getTelemetry
sidebar_label: "getTelemetry()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、検査およびカスタムコマンドハンドラー用に、このクライアントに接続されたテレメトリーマネージャーを返します。 | Node.js"
type: docx
token: LMSCdLflPoeX27xgsbocsSsHn2d
sidebar_position: 10
keywords: 
  - クライアントテレメトリー
  - コマンドハンドラー
  - テレメトリーマネージャー
  - zilliz
  - zilliz cloud
  - クラウド
  - getTelemetry()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getTelemetry()

この操作は、検査およびカスタムコマンドハンドラー用に、このクライアントに接続されたテレメトリーマネージャーを返します。

```typescript
milvusClient.getTelemetry()
```

**戻り値の型：**

*ClientTelemetryManager*

**戻り値：**

このクライアントに接続されたテレメトリーマネージャーです。テレメトリーの状態を確認する場合や、カスタムコマンドハンドラーを登録する場合に使用します。

**メソッド：**

- **start** (*void*) -

    テレメトリーのハートビートループを開始します。

- **setSdkVersion** (*void*) -

    テレメトリーイベントで報告される SDK バージョンを設定します。

- **stop** (*void*) -

    テレメトリーのハートビートループを停止します。

- **isSupported** (*boolean*) -

    接続先のサーバーがクライアントテレメトリーをサポートしているかどうかを報告します。

- **getConfig** (*Required&lt;TelemetryConfig&gt;*) -

    解決済みのテレメトリー設定を返します。設定項目は enabled、heartbeatIntervalMs、samplingRate、errorMaxCount、clientId です。

- **registerCommandHandler** (*void*) -

    名前付きのサーバーコマンドタイプに対するハンドラーを登録します。サーバーが `processCommands()` を通じて一致するコマンドを配信すると、ハンドラーが実行されます。

- **recordOperation** (*void*) -

    1 回のクライアント操作（レイテンシー、コレクション、成功またはエラー）をテレメトリーコレクターに記録します。記録は、設定されたサンプリングレートに従ってサンプリングされます。

- **getRecentErrors** (*TelemetryError[]*) -

    最新のテレメトリーエラーを新しい順に、`maxCount`（デフォルト 100）まで返します。

- **getMetricsSnapshots** (*TelemetrySnapshot[]*) -

    保持期間に絞り込んだ、操作ごとの現在のメトリクススナップショットを返します。

- **processCommands** (*Promise&lt;void&gt;*) -

    登録済みのハンドラーを通じてサーバーから配信されたコマンドを処理します。コマンドハンドラーから再帰的に呼び出すことはできません。

**例外：**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
const telemetry = milvusClient.getTelemetry();
```
