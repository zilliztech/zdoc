---
title: "dropIndex() | Node.js"
slug: /node/node/Management-dropIndex
sidebar_label: "dropIndex()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops an index from a specific collection. | Node.js"
type: docx
token: UBbndftiQo2HdOxUNtocIISnnVh
sidebar_position: 5
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - dropIndex()
  - nodejs26
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropIndex()

This operation drops an index from a specific collection.

```javascript
dropIndex(data): Promise<ResStatus>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.dropPartition({
    db_name: string,
    collection_name: string,
    field_name?: string,
    index_name?: string,
    timeout?: number
 });
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **field_name** (*string*) -

    The name of an existing field in the collection.

- **index_name** (string) -

    The name of the index to drop.

- **timeout** (*number*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

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

## Example\{#example}

```java
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const dropIndexReq = {
  collection_name: 'my_collection',
  index_name: 'my_index',
};
const res = await milvusClient.dropIndex(dropIndexReq);
console.log(res);
```

