---
title: "listDatabases() | Node.js"
slug: /node/node/Database-listDatabases
sidebar_key: node/Database-listDatabases
sidebar_label: "listDatabases()"
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all existing databases. | Node.js"
type: docx
token: Kp9Dd2dIgoxyDixuqtqctPZXnFb
sidebar_position: 5
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - listDatabases()
  - nodejs26
displayed_sidebar: nodeSidebar

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

**RETURNS** *Promise |&lt;ListDatabaseResponse&gt;*

This method returns a promise that resolves to a **ListDatabaseResponse** object.

```javascript
{
    db_names: string[],
    status: {
        code: number,
        error_code: string | number,
        reason: string
    }
}
```

**PARAMETERS:**

- **db_names** (*string[]*) -

    A list of database names.

- **status** (**ResStatus**) -

    The operation status.

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
