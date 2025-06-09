---
displayed_sidbar: nodeSidebar
title: "dropCollection() | Node.js"
slug: /node/node/Collections-dropCollection
sidebar_label: "dropCollection()"
beta: false
notebook: false
description: "This operation drops a collection. | Node.js"
type: docx
token: KLknda2VtocQSBx7PKVc6F9Nnug
sidebar_position: 11
keywords: 
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollection()
  - nodejs25
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# dropCollection()

This operation drops a collection.

```javascript
dropCollection(data): Promise<ResStatus>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.dropCollection({ 
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

    The name of an existing collection.

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

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
 const resStatus = await milvusClient.dropCollection({ collection_name: 'my_collection' });
```

