---
title: "startTelemetry() | Java | v2"
slug: /java/java/v2-Client-startTelemetry
sidebar_label: "startTelemetry()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation starts a telemetry manager whose worker was intentionally deferred during connection setup. | Java | v2"
type: docx
token: NLr1dU4t1oyTHcxZvXUc10Aundb
sidebar_position: 9
keywords: 
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search
  - zilliz
  - zilliz cloud
  - cloud
  - startTelemetry()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# startTelemetry()

This operation starts a telemetry manager whose worker was intentionally deferred during connection setup.

```java
public void startTelemetry()
```

This method is useful when the client was created with a deferred telemetry start. Call it after connection setup to begin reporting metrics and heartbeats.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

client.startTelemetry();
```
