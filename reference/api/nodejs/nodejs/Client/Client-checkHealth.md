---
title: "checkHealth() | Node.js"
slug: /node/node/Client-checkHealth
sidebar_label: "checkHealth()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation checks the health status of the Milvus server. | Node.js"
type: docx
token: DDvudeY20o6tV5xwwo4cKovjnHf
sidebar_position: 2
keywords: 
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - checkHealth()
  - nodejs26
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# checkHealth()

This operation checks the health status of the Milvus server.

```javascript
checkHealth(): Promise<CheckHealthResponse>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.checkHealth()
```

**RETURN TYPE:**

*Promise*\<*CheckHealthResponse*>

**RETURNS:**

A promise that resolves to a **CheckHealthResponse** object.

```javascript
{
    isHealthy: boolean,
    reasons: []
}
```

**PARAMETERS:**

- **isHealthy** (*boolean*) -

    Whether the currently connected Milvus server is healthy.

- **reasons** (*[]*) - 

    The reasons for the currently connected Milvus server is unhealthy.

## Examples\{#examples}

```javascript
milvusClient.checkHealth()
```
