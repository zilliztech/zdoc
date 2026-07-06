---
title: "close() | Node.js"
slug: /node/node/Client-close
sidebar_label: "close()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation closes a `MilvusClientSession` instance and prevents further session requests. | Node.js"
type: docx
token: Xwg8dMovYoRP94xNDjOc1TSNnsg
sidebar_position: 6
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - close()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# close()

This operation closes a `MilvusClientSession` instance and prevents further session requests.

```typescript
session.close(): void
```

## Request Syntax\{#request-syntax}

```typescript
session.close()
```

**PARAMETERS:**

This operation has no parameters.

**RETURNS:**

*void*

Closes the session handle only. It does not close the parent `MilvusClient` connection pool.

**EXCEPTIONS:**

- **Error**

    Subsequent session operations throw `MilvusClient session is closed`.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const session = client.session('cluster-a');
session.close();
```
