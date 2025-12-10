---
title: "listAliases() | Node.js"
slug: /node/node/Collections-listAliases
sidebar_label: "listAliases()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This is a method template. | Node.js"
type: docx
token: KeoKdlitaog6n1xpX8McIIIrnWb
sidebar_position: 14
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - listAliases()
  - nodejs26
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listAliases()

This is a method template.

```javascript
listAliases(data): Promise<ResStatus>
```

## Request Syntax\{#request-syntax}

This method has the following alternatives.

```javascript
listAliases({
    db_name: string
    collection_name: string
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

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

## Example\{#example}

```java
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const res = await milvusClient.listAliases({ collection_name: 'my_collection' });
```

