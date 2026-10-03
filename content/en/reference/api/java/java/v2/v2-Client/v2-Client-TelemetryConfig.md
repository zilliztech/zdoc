---
title: "TelemetryConfig | Java | v2"
slug: /java/java/v2-Client-TelemetryConfig
sidebar_label: "TelemetryConfig"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "A `TelemetryConfig` holds the client telemetry configuration used to report metrics, heartbeats, and server-pushed commands. | Java | v2"
type: docx
token: C5PrdABXTokjv0xcpb9cZQd5nSb
sidebar_position: 10
keywords: 
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - TelemetryConfig
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# TelemetryConfig

A `TelemetryConfig` holds the client telemetry configuration used to report metrics, heartbeats, and server-pushed commands.

```java
io.milvus.telemetry.TelemetryConfig
```

## Constructor\{#constructor}

This builder creates a telemetry configuration.

```java
TelemetryConfig.builder()
    .enabled(boolean enabled)
    .heartbeatIntervalMs(long heartbeatIntervalMs)
    .samplingRate(double samplingRate)
    .errorMaxCount(int errorMaxCount)
    .clientId(String clientId)
    .build()
```

**BUILDER METHODS:**

- `enabled(boolean enabled)`

    Whether telemetry reporting is enabled. Defaults to `true`.

- `heartbeatIntervalMs(long heartbeatIntervalMs)`

    Milliseconds between heartbeats, which is also the metrics window. Each heartbeat carries the operations since the last one. Defaults to `10000`.

- `samplingRate(double samplingRate)`

    Sampling rate of recorded operations (0.0 to 1.0). Defaults to `1.0`.

- `errorMaxCount(int errorMaxCount)`

    The maximum number of recorded errors retained. Defaults to `100`.

- `clientId(String clientId)`

    An optional stable identity. A random UUID is used when empty.

**RETURN TYPE:**

*TelemetryConfig*

**METHODS:**

- `boolean isEnabled()`

    Returns whether telemetry reporting is enabled.

- `long getHeartbeatIntervalMs()`

    Returns the heartbeat interval in milliseconds.

- `double getSamplingRate()`

    Returns the sampling rate of recorded operations.

- `int getErrorMaxCount()`

    Returns the maximum number of recorded errors retained.

- `String getClientId()`

    Returns the stable client identity.

## Example\{#example}

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
