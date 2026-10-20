---
title: "getTelemetry() | Java | v2"
slug: /java/java/v2-Client-getTelemetry
sidebar_label: "getTelemetry()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、接続中のクライアントのテレメトリーマネージャーを返します。 | Java | v2"
type: docx
token: OykrdeI7zobXOuxXsxBcId4pn8c
sidebar_position: 7
keywords: 
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - zilliz
  - zilliz cloud
  - クラウド
  - getTelemetry()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getTelemetry()

この操作は、接続中のクライアントのテレメトリーマネージャーを返します。

```java
public ClientTelemetryManager getTelemetry()
```

**戻り値の型：**

*ClientTelemetryManager*

**戻り値：**

接続中のクライアントのテレメトリーマネージャー、またはテレメトリを利用できない場合は `null` を返します。

**パラメーター：**

- **telemetry**（*ClientTelemetryManager*） -

    接続中のクライアントの **ClientTelemetryManager** インスタンスです。`isSupported()` でテレメトリのサポートを確認し、`registerCommandHandler()` でサーバーからプッシュされるコマンドのハンドラーを登録し、`getConfig()` でアクティブな設定を読み取ります。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

ClientTelemetryManager telemetry = client.getTelemetry();
if (telemetry != null && telemetry.isSupported()) {
    telemetry.registerCommandHandler("custom_command", command -> {
        // Handle a server-pushed telemetry command.
        return TelemetryCommandReply.of(command);
    });
}
```
