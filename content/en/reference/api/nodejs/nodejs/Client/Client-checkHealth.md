---
title: "checkHealth() | Node.js"
slug: /node/node/Client-checkHealth
sidebar_label: "checkHealth()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation checks the health status of the Milvus server. | Node.js"
type: docx
token: DDvudeY20o6tV5xwwo4cKovjnHf
sidebar_position: 2
keywords: 
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - zilliz
  - zilliz cloud
  - cloud
  - checkHealth()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# checkHealth()

This operation checks the health status of the Milvus server.

```javascript
await milvusClient.checkHealth()
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.checkHealth()
```

**RETURNS:**

*Promise&lt;CheckHealthResponse&gt;*

This method returns a promise that resolves to a **CheckHealthResponse** object.

```javascript
{
    isHealthy: boolean,
    reasons: string[]
}
```

**PARAMETERS:**

- **isHealthy** (*boolean*) -

    A boolean that indicates whether all critical components of the Milvus deployment are healthy.

- **reasons** (*string[]*) -

    When **isHealthy** is **false**, a list of human-readable reasons explaining which components are unhealthy. The list is empty when **isHealthy** is **true**.


**EXCEPTIONS:**

- **Error**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```javascript
milvusClient.checkHealth()
```
