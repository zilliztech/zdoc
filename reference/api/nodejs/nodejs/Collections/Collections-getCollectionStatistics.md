---
title: "getCollectionStatistics() | Node.js"
slug: /node/node/Collections-getCollectionStatistics
sidebar_label: "getCollectionStatistics()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists the statistics collected on a specific collection. | Node.js"
type: docx
token: LQMGdRHjKogdeMxekCtcdBLqnNf
sidebar_position: 12
keywords: 
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - zilliz
  - zilliz cloud
  - cloud
  - getCollectionStatistics()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getCollectionStatistics()

This operation lists the statistics collected on a specific collection.

```javascript
await milvusClient.getCollectionStatistics(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getCollectionStatistics({ 
    db_name: string,
    collection_name: string,
    timeout?: number 
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of a collection.

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

**RETURNS** *Promise&lt;StatisticsResponse&gt;*

This method returns a promise that resolves to a **StatisticsResponse** object.

```typescript
{
    stats: KeyValuePair[],
    data: { [x: string]: any },
    status:  ResStatus
}
```

**PARAMETERS:**

- **stats** (*KeyValuePair[]*) -
The raw statistics list returned by Milvus. Each entry has a **key** (for example, **row_count**) and a **value** as a string.

- **data** (*Record&lt;string, any&gt;*) -
A flattened, key-indexed view of **stats** for convenience. For example, `data.row_count` returns the row count as a string.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const res = await milvusClient.getCollectionStatistics({ collection_name: 'my_collection' });
```

