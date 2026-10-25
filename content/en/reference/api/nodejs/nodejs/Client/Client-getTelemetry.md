---
title: "getTelemetry() | Node.js"
slug: /node/node/Client-getTelemetry
sidebar_label: "getTelemetry()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns the telemetry manager attached to this client for inspection and custom command handlers. | Node.js"
type: docx
token: LMSCdLflPoeX27xgsbocsSsHn2d
sidebar_position: 10
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - getTelemetry()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# getTelemetry()

This operation returns the telemetry manager attached to this client for inspection and custom command handlers.

```typescript
milvusClient.getTelemetry()
```

**RETURN TYPE:**

*ClientTelemetryManager*

**RETURNS:**

The telemetry manager attached to this client. Use it to inspect telemetry state and to register custom command handlers.

**METHODS:**

- **start** (*void*) -

    Starts the telemetry heartbeat loop.

- **setSdkVersion** (*void*) -

    Sets the SDK version reported with telemetry events.

- **stop** (*void*) -

    Stops the telemetry heartbeat loop.

- **isSupported** (*boolean*) -

    Reports whether the connected server supports client telemetry.

- **getConfig** (*Required&lt;TelemetryConfig&gt;*) -

    Returns the resolved telemetry configuration: enabled, heartbeatIntervalMs, samplingRate, errorMaxCount, and clientId.

**EXCEPTIONS:**

- **MilvusError**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Example\{#example}

```javascript
const telemetry = milvusClient.getTelemetry();
```
