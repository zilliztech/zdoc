---
title: "TelemetryConfig | Cloud"
slug: /cpp/cpp/Client-TelemetryConfig
sidebar_label: "TelemetryConfig"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この構造体は、メトリクス、ハートビート、およびサーバーからプッシュされるコマンドを報告するために使用されるクライアントテレメトリ設定を保持します。接続時には、`TelemetryConfig` を `ConnectParam:WithTelemetryConfig()` に渡します。 | Cloud"
type: docx
token: XTxZdqmCIoUv7vx2yMVccq3RnYc
sidebar_position: 16
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベースの比較
  - Faiss
  - 動画検索
  - zilliz
  - zilliz cloud
  - クラウド
  - TelemetryConfig
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# TelemetryConfig

この構造体は、メトリクス、ハートビート、およびサーバーからプッシュされるコマンドを報告するために使用されるクライアントテレメトリ設定を保持します。接続時には、`TelemetryConfig` を `ConnectParam::WithTelemetryConfig()` に渡します。

```c++
struct TelemetryConfig {
    bool enabled{true};
    uint64_t heartbeat_interval_ms{10000};
    double sampling_rate{1.0};
    size_t error_max_count{100};
    std::string client_id;
};
```

**パラメーター:**

- **enabled** (*bool*)

    テレメトリレポートを有効にするかどうかです。デフォルト値は `true` です。

- **heartbeat_interval_ms** (*uint64_t*)

    ハートビートの間隔（ミリ秒単位）です。これはメトリクスのウィンドウでもあります。各ハートビートには、前回のハートビート以降の操作が含まれます。コーディネーターは、最新のウィンドウの 1 つ前のウィンドウからテレメトリクエリに応答するため、呼び出し元が読み取る値は 1～2 インターバル分古いものになります。デフォルト値は `10000` です。

- **sampling_rate** (*double*)

    記録される操作のサンプリングレート（0.0～1.0）です。デフォルト値は `1.0` です。

- **error_max_count** (*size_t*)

    保持される記録済みエラーの最大数です。デフォルト値は `100` です。

- **client_id** (*std::string*)

    省略可能な固定識別子です。空の場合は、ランダムな UUID が使用されます。

## 例\{#example}

```c++
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
milvus::TelemetryConfig telemetry_config;
telemetry_config.enabled = true;
connect_param.WithTelemetryConfig(telemetry_config);
```
