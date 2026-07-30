---
title: "hasCollection() | Node.js"
slug: /node/node/Collections-hasCollection
sidebar_label: "hasCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation checks whether a specific collection exists. | Node.js"
type: docx
token: FhbbdNrlNouBXJxHIdKctXVKnmf
sidebar_position: 13
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - hasCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# hasCollection()

This operation checks whether a specific collection exists.

```javascript
await milvusClient.hasCollection(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.hasCollection({ 
    db_name: string,
    collection_name: string,
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*str*) -

    The name of the database that holds the target collection.

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of a collection.

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

**RETURNS** *Promise&lt;BoolResponse&gt;*

This method returns a promise that resolves to a **BoolResponse** object.

```typescript
{
    value: boolean,
    status:  ResStatus
}
```

**PARAMETERS:**

- **value** (*boolean*) -
A boolean that indicates whether the requested collection exists. It is **true** when the collection exists and **false** when it does not.

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
const res = await milvusClient.hasCollection({ collection_name: 'my_collection' });
```

