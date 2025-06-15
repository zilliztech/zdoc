---
displayed_sidbar: nodeSidebar
title: "releaseCollection() | Node.js"
slug: /node/node/Management-releaseCollection
sidebar_label: "releaseCollection()"
beta: false
notebook: false
description: "This operation releases the data of a specific collection from memory. | Node.js"
type: docx
token: UxOXdeKF1oOIBuxTjPhcKBtPnRb
sidebar_position: 17
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - releaseCollection()
  - nodejs25
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# releaseCollection()

This operation releases the data of a specific collection from memory.

```javascript
releaseCollection(data): Promise<ResStatus>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.releaseCollection({ 
    db_name: string,
    collection_name: 'my_collection',
    timeout?: number 
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of a collection.

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

**RETURNS** *Promise\<ResStatus>*

This method returns a promise that resolves to a **ResStatus** object.

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    A code that indicates the operation result. It remains **0** if this operation succeeds.

- **error_code** (*string* | *number*) -

    An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

- **reason** (*string*) - 

    The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example{#example}

```java
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const resStatus = await milvusClient.releaseCollection({ collection_name: 'my_collection' });
```

