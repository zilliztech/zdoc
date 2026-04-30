---
title: "checkHealth() | Node.js"
slug: /node/node/Client-checkHealth
sidebar_key: node/Client-checkHealth
sidebar_label: "checkHealth()"
added_since: v2.3.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation checks the health status of the Milvus server. | Node.js"
type: docx
token: DDvudeY20o6tV5xwwo4cKovjnHf
sidebar_position: 2
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - checkHealth()
  - nodejs26
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# checkHealth()

This operation checks the health status of the Milvus server.

```javascript
await milvusClient.checkHealth()
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
