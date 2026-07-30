---
title: "listCollections() | Node.js"
slug: /node/node/Collections-listCollections
sidebar_label: "listCollections()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all existing collections. | Node.js"
type: docx
token: Djg7dlb5NoINz9xOAs1cyY67nsh
sidebar_position: 15
keywords: 
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - zilliz
  - zilliz cloud
  - cloud
  - listCollections()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listCollections()

This operation lists all existing collections.

```javascript
milvusClient.listCollections();
```

## Request Syntax\{#request-syntax}

```javascript
listCollections({
    collection_name: string
    type: ShowCollectionsType,
    timeout?: number
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **type** (*ShowCollectionsType*) 

    The scope of this operation. Possible values are **All** or **Loaded**.

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

**RETURNS** *Promise&lt;ShowCollectionsResponse&gt;*

This method returns a promise that resolves to a **ShowCollectionsResponse** object.

```typescript
{
    data: CollectionData[],
    created_timestamps: string[],
    created_utc_timestamps: string[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **data** (*CollectionData[]*) -
A list of collection data objects. Each entry contains the collection name, ID, timestamp, and loaded percentage.

- **created_timestamps** (*string[]*) -
A list of hybrid timestamps indicating when each collection was created.

- **created_utc_timestamps** (*string[]*) -
A list of UTC timestamps indicating when each collection was created.

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
const res = await milvusClient.listCollections({ collection_name: 'my_collection' });
```

