---
title: "TelemetryConfig | Cloud"
slug: /cpp/cpp/Client-TelemetryConfig
sidebar_label: "TelemetryConfig"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This struct holds the client telemetry configuration used to report metrics, heartbeat, and server-pushed commands. Pass a `TelemetryConfig` to `ConnectParam:WithTelemetryConfig()` when connecting. | Cloud"
type: docx
token: XTxZdqmCIoUv7vx2yMVccq3RnYc
sidebar_position: 16
keywords: 
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search
  - zilliz
  - zilliz cloud
  - cloud
  - TelemetryConfig
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# TelemetryConfig

This struct holds the client telemetry configuration used to report metrics, heartbeat, and server-pushed commands. Pass a `TelemetryConfig` to `ConnectParam::WithTelemetryConfig()` when connecting.

```c++
struct TelemetryConfig {
    bool enabled{true};
    uint64_t heartbeat_interval_ms{10000};
    double sampling_rate{1.0};
    size_t error_max_count{100};
    std::string client_id;
};
```

**PARAMETERS:**

- **enabled** (*bool*)

    Whether telemetry reporting is enabled. Default: `true`.

- **heartbeat_interval_ms** (*uint64_t*)

    Milliseconds between heartbeats, which is also the metrics window. Each heartbeat carries the operations since the last one. The coordinator answers a telemetry query from the window before the newest, so what a caller reads is between one and two intervals old. Default: `10000`.

- **sampling_rate** (*double*)

    Sampling rate of recorded operations (0.0 to 1.0). Default: `1.0`.

- **error_max_count** (*size_t*)

    Maximum number of recorded errors retained. Default: `100`.

- **client_id** (*std::string*)

    Optional stable identity; a random UUID is used when empty.

## Example\{#example}

```c++
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
milvus::TelemetryConfig telemetry_config;
telemetry_config.enabled = true;
connect_param.WithTelemetryConfig(telemetry_config);
```
