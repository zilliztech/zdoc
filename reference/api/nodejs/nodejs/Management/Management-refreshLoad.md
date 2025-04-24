---
displayed_sidbar: nodeSidebar
title: "refreshLoad() | Node.js"
slug: /node/node/Management-refreshLoad
sidebar_label: "refreshLoad()"
beta: false
notebook: false
description: "This operation refreshes the loading status of a specific collection. | Node.js"
type: docx
token: Jc43d397doxCRkxal2XcQ1Wyn2g
sidebar_position: 16
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - refreshLoad()
  - nodejs25
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# refreshLoad()

This operation refreshes the loading status of a specific collection.

```javascript
refreshLoad(data): Promise<ResStatus>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.refreshLoad({
   db_name?: string,
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

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

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
const resStatus = await milvusClient.refreshLoad({ collection_name: 'my_collection' });
```

