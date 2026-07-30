---
displayed_sidbar: nodeSidebar
title: "useDatabase() | Node.js"
slug: /node/node/Database-useDatabase
sidebar_label: "useDatabase()"
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
beta: false
notebook: false
description: "This operation sets the active database for the gRPC client. | Node.js"
type: docx
token: NDcldy9OLo62DLxw1a9cFSLsnYb
sidebar_position: 6
keywords: 
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
  - zilliz
  - zilliz cloud
  - cloud
  - useDatabase()
  - nodejs26
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# useDatabase()

This operation sets the active database for the gRPC client.

```javascript
useDatabase(data?): Promise<ResStatus>
```

## Request Syntax

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

## Example

```javascript
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const resStatus = await milvusClient.useDatabase({ db_name: 'new_db' });
```
