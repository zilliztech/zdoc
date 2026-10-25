---
title: "TelemetryConfig | Java | v2"
slug: /java/java/v2-Client-TelemetryConfig
sidebar_label: "TelemetryConfig"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "TelemetryConfig インスタンスは、メトリクス、ハートビート、およびサーバーからプッシュされるコマンドを報告するために使用されるクライアントのテレメトリー設定を保持します。 | Java | v2"
type: docx
token: C5PrdABXTokjv0xcpb9cZQd5nSb
sidebar_position: 10
keywords: 
  - 大規模言語モデル
  - ベクトル化
  - k 近傍アルゴリズム
  - ANNS
  - zilliz
  - zilliz cloud
  - クラウド
  - TelemetryConfig
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# TelemetryConfig

TelemetryConfig インスタンスは、メトリクス、ハートビート、およびサーバーからプッシュされるコマンドを報告するために使用されるクライアントのテレメトリー設定を保持します。

```java
io.milvus.telemetry.TelemetryConfig
```

## コンストラクター\{#constructor}

このビルダーはテレメトリー設定を作成します。

```java
TelemetryConfig.builder()
    .enabled(boolean enabled)
    .heartbeatIntervalMs(long heartbeatIntervalMs)
    .samplingRate(double samplingRate)
    .errorMaxCount(int errorMaxCount)
    .clientId(String clientId)
    .build()
```

**BUILDER メソッド:**

- `enabled(boolean enabled)`<br/>
  テレメトリーの報告が有効かどうかです。デフォルトは `true` です。

- `heartbeatIntervalMs(long heartbeatIntervalMs)`<br/>
  ハートビート間の間隔（ミリ秒）です。これはメトリクスのウィンドウでもあります。各ハートビートには、前回のハートビート以降の操作が含まれます。デフォルトは `10000` です。

- `samplingRate(double samplingRate)`<br/>
  記録された操作のサンプリングレート（0.0～1.0）です。デフォルトは `1.0` です。

- `errorMaxCount(int errorMaxCount)`<br/>
  保持される記録済みエラーの最大数です。デフォルトは `100` です。

- `clientId(String clientId)`<br/>
  省略可能な安定した識別子です。空の場合はランダムな UUID が使用されます。

**戻り値の型:**

*TelemetryConfig*

**戻り値:**

**TelemetryConfig** オブジェクトには、次のフィールドが含まれます。

**パラメーター:**

- **enabled** (*boolean*) -

    テレメトリーの報告が有効かどうかです。デフォルトは `true` です。

- **heartbeatIntervalMs** (*long*) -

    ハートビート間の間隔（ミリ秒）です。これはメトリクスのウィンドウでもあります。デフォルトは `10000` です。

- **samplingRate** (*double*) -

    記録された操作のサンプリングレート（0.0～1.0）です。デフォルトは `1.0` です。

- **errorMaxCount** (*int*) -

    保持される記録済みエラーの最大数です。デフォルトは `100` です。

- **clientId** (*String*) -

    省略可能な安定したクライアント識別子です。空の場合はランダムな UUID が使用されます。

**メソッド:**

- `boolean isEnabled()`<br/>
  テレメトリーの報告が有効かどうかを返します。

- `long getHeartbeatIntervalMs()`<br/>
  ハートビート間隔をミリ秒単位で返します。

- `double getSamplingRate()`<br/>
  記録された操作のサンプリングレートを返します。

- `int getErrorMaxCount()`<br/>
  保持される記録済みエラーの最大数を返します。

- `String getClientId()`<br/>
  安定したクライアント識別子を返します。

## 例\{#example}

```java
ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .telemetryConfig(TelemetryConfig.builder()
                .enabled(true)
                .heartbeatIntervalMs(15000)
                .build())
        .build();
```
