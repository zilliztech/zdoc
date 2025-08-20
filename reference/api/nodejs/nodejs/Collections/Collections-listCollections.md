---
displayed_sidbar: nodeSidebar
title: "listCollections() | Node.js"
slug: /node/node/Collections-listCollections
sidebar_label: "listCollections()"
beta: false
notebook: false
description: "This operation lists all existing collections. | Node.js"
type: docx
token: Djg7dlb5NoINz9xOAs1cyY67nsh
sidebar_position: 18
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - listCollections()
  - nodejs25
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# listCollections()

This operation lists all existing collections.

```javascript
milvusClient.listCollections();
```

## Request Syntax{#request-syntax}

```javascript
listCollections({
    collection_name: string
    type: ShowCollectionsType,
    timeout?: number
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **&#91;REQUIRED&#93;**

    The name of an existing collection.

- **type** (*ShowCollectionsType*) 

    The scope of this operation. Possible values are **All** or **Loaded**.

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

**RETURNS** *Promise\&lt;ShowCollectionsResponse&gt;*

This method returns a promise that resolves to a **ShowCollectionsResponse** object.

```javascript
{
    created_timestamps: string | list[string],
    created_utc_timestamps: string | list[string]
    data: object,
    status: object
}
```

**PARAMETERS:**

- **created_timestamps** (*string* | *list&#91;string&#93;*) -

    The timestamps indicating the creation time of the collections.

- **created_utc_timestamps** (*string* | *list&#91;string&#93;*) -

    The timestamps in UTC indicating the creation time of the collections.

- **data** (*object*) -

    - **id** (*string*) -

        The ID of the collection.

    - **loadedPercentage** (*string*) -

        The percentage of inserted entities in the collection.

    - **name** (*string*) -

        The name of the collection.

    - **timestamp** (*string*) -

        The timestamp indicating the creation time of the collection.

- **status** (*object*) -

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example{#example}

```java
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const res = await milvusClient.listCollections({ collection_name: 'my_collection' });
```

