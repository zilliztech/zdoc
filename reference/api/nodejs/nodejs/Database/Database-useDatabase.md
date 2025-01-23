---
displayed_sidbar: nodeSidebar
title: "useDatabase() | Node.js"
slug: /node/node/Database-useDatabase
sidebar_label: "useDatabase()"
beta: false
notebook: false
description: "This operation sets the active database for the gRPC client. | Node.js"
type: docx
token: NDcldy9OLo62DLxw1a9cFSLsnYb
sidebar_position: 4
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - useDatabase()
  - nodejs25
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# useDatabase()

This operation sets the active database for the gRPC client.

```javascript
useDatabase(data?): Promise<ResStatus>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.useDatabase({
    db_name: string
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database to use.

    There should be a database with the specified name. Otherwise, exceptions will occur.

**RETURNS** *Promise |\<ResStatus>*

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

```javascript
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const resStatus = await milvusClient.useDatabase({ db_name: 'new_db' });
```
