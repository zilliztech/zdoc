---
title: "compact() | Node.js"
slug: /node/node/Management-compact
sidebar_key: node/Management-compact
sidebar_label: "compact()"
added_since: v2.3.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation compacts and merges small segments into a larger one to save memory usage and improve search performance. | Node.js"
type: docx
token: DCK5d56UZop0kGxpQu8cLqlvndg
sidebar_position: 2
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - compact()
  - nodejs26
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# compact()

This operation compacts and merges small segments into a larger one to save memory usage and improve search performance.

```javascript
await milvusClient.compact(data)
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.compact()
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the target collection to reassign an alias to.

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\<CompactionResponse>*

This method returns a promise that resolves to a *CompactionResponse* object.

```javascript
{
    compactionID: string,
    status: {
        code: number,
        error_code: string | number,
        reason: string
    }
}
```

**PARAMETERS:**

- **compactionID** (*number*) -

    Compaction task ID.

- **status** (*ResStatus*) - 

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
 const resStatus = await milvusClient.compact({
      collection_name: 'my_collection',
 });
```

