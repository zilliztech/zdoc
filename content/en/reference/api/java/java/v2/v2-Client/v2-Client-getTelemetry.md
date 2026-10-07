---
title: "getTelemetry() | Java | v2"
slug: /java/java/v2-Client-getTelemetry
sidebar_label: "getTelemetry()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the telemetry manager for the connected client. | Java | v2"
type: docx
token: OykrdeI7zobXOuxXsxBcId4pn8c
sidebar_position: 7
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - getTelemetry()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getTelemetry()

This operation returns the telemetry manager for the connected client.

```java
public ClientTelemetryManager getTelemetry()
```

**RETURN TYPE:**

*ClientTelemetryManager*

**RETURNS:**

The telemetry manager for the connected client, or `null` when telemetry is not available.

**PARAMETERS:**

- **telemetry** (*ClientTelemetryManager*) -

    The **ClientTelemetryManager** instance for the connected client. Check telemetry support with `isSupported()`, register a server-pushed command handler with `registerCommandHandler()`, and read the active configuration with `getConfig()`.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

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
