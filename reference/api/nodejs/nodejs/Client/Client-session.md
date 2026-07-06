---
title: "session() | Node.js"
slug: /node/node/Client-session
sidebar_label: "session()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a lightweight DQL session bound to a target cluster ID. The session injects `clusterid` into search/query/get requests. | Node.js"
type: docx
token: LPfrdnntOogNMRxwqvCccBgnnve
sidebar_position: 7
keywords: 
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - zilliz
  - zilliz cloud
  - cloud
  - session()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# session()

This operation creates a lightweight DQL session bound to a target cluster ID. The session injects `cluster_id` into search/query/get requests.

```typescript
const session = milvusClient.session(clusterId: string)
```

## Request Syntax\{#request-syntax}

```typescript
const session = milvusClient.session('cluster-a')
```

**PARAMETERS:**

- **clusterId** (*string*) -

    **[REQUIRED]**

    Target cluster ID used for routing DQL requests.

**RETURNS:**

*MilvusClientSession*

A session object providing `search`, `hybridSearch`, `searchIterator`, `query`, `queryIterator`, `get`, and `close`.

**EXCEPTIONS:**

- **Error**

    Raised when `clusterId` is empty or not a string.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const session = client.session('cluster-a');
const hits = await session.search({
    collection_name: 'products',
    data: [[0.12, 0.35, 0.77]],
    limit: 5,
});
```
