---
title: "getTelemetry() | Node.js"
slug: /node/node/Client-getTelemetry
sidebar_label: "getTelemetry()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、検査およびカスタムコマンドハンドラーで使用するために、このクライアントにアタッチされたテレメトリーマネージャーを返します。 | Node.js"
type: docx
token: LMSCdLflPoeX27xgsbocsSsHn2d
sidebar_position: 10
keywords: 
  - スパースベクトルと密ベクトル
  - 密ベクトル
  - Hierarchical Navigable Small Worlds
  - 密埋め込み
  - zilliz
  - zilliz cloud
  - cloud
  - getTelemetry()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# getTelemetry()

この操作は、検査およびカスタムコマンドハンドラーで使用するために、このクライアントにアタッチされたテレメトリーマネージャーを返します。

```typescript
milvusClient.getTelemetry()
```

**戻り値の型：**

*ClientTelemetryManager*

**戻り値：**

このクライアントにアタッチされたテレメトリーマネージャーです。テレメトリの状態を確認したり、カスタムコマンドハンドラーを登録したりするために使用します。

**メソッド：**

- **start** (*void*) -

    テレメトリのハートビートループを開始します。

- **setSdkVersion** (*void*) -

    テレメトリイベントで報告される SDK バージョンを設定します。

- **stop** (*void*) -

    テレメトリのハートビートループを停止します。

- **isSupported** (*boolean*) -

    接続中のサーバーがクライアントテレメトリーをサポートしているかどうかを報告します。

- **getConfig** (*Required&lt;TelemetryConfig&gt;*) -

    解決済みのテレメトリー設定（enabled、heartbeatIntervalMs、samplingRate、errorMaxCount、clientId）を返します。

**例外：**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
const telemetry = milvusClient.getTelemetry();
```
