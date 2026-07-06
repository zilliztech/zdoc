---
title: "getLoadingProgress() | Node.js"
slug: /node/node/Management-getLoadingProgress
sidebar_label: "getLoadingProgress()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation gets the loading progress of a specific collection. | Node.js"
type: docx
token: DkImdRkJwoUmdqxzqn1cpQr9nhy
sidebar_position: 13
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - getLoadingProgress()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getLoadingProgress()

This operation gets the loading progress of a specific collection.

```javascript
await milvusClient.getLoadingProgress(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getLoadingProgress({
      db_name?: string,
      collection_name: string,
      partition_names?: string[]
      timeout?: number
});
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **partition_names** (*string[]*) -

    The name of the target partitions.

- **timeout** (number) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise&lt;GetLoadingProgressResponse&gt;*

This method returns a promise that resolves to a **GetLoadingProgressResponse** object.

```typescript
{
    progress: string,
    status:  ResStatus
}
```

**PARAMETERS:**

- **progress** (*string*) -
The completion percentage of the load operation as an integer between **"0"** and **"100"**. The collection is fully loaded once this value reaches **"100"**.

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
const resStatus = await milvusClient.getLoadingProgress({
    collection_name: 'my_collection',
});
```

