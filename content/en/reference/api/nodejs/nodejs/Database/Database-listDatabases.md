---
title: "listDatabases() | Node.js"
slug: /node/node/Database-listDatabases
sidebar_label: "listDatabases()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all existing databases. | Node.js"
type: docx
token: DZMUdKbtfoT1HbxaXEDcgFkJnsh
sidebar_position: 5
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - listDatabases()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listDatabases()

This operation lists all existing databases.

```javascript
await milvusClient.listDatabases(data?)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.listDatabases({
    timeout?: number
})
```

**PARAMETERS:**

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise&lt;ListDatabasesResponse&gt;*

This method returns a promise that resolves to a **ListDatabasesResponse** object.

```typescript
{
    db_names: string[],
    db_ids: string[],
    created_timestamp: string[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **db_names** (*string[]*) -
A list of database names defined in the current Milvus instance.

- **db_ids** (*string[]*) -
The internal database identifiers, in the same order as **db_names**.

- **created_timestamp** (*string[]*) -
The creation timestamps of the databases, in the same order as **db_names**.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.listDatabases();
```
