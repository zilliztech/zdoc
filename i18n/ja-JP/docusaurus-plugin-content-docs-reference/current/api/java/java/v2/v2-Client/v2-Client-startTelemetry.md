---
title: "startTelemetry() | Java | v2"
slug: /java/java/v2-Client-startTelemetry
sidebar_label: "startTelemetry()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、接続のセットアップ中にワーカーが意図的に延期されたテレメトリーマネージャーを起動します。 | Java | v2"
type: docx
token: NLr1dU4t1oyTHcxZvXUc10Aundb
sidebar_position: 9
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベースの比較
  - Faiss
  - 動画検索
  - zilliz
  - zilliz cloud
  - クラウド
  - startTelemetry()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# startTelemetry()

この操作は、接続のセットアップ中にワーカーが意図的に延期されたテレメトリーマネージャーを起動します。

```java
public void startTelemetry()
```

このメソッドは、テレメトリの開始を延期した状態でクライアントを作成した場合に便利です。接続のセットアップ後にこれを呼び出すと、メトリクスとハートビートのレポートを開始できます。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

client.startTelemetry();
```
