---
title: "useDatabase() | Node.js"
slug: /node/node/Database-useDatabase
sidebar_label: "useDatabase()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "This operation sets the active database for the gRPC client. | Node.js"
type: docx
token: NDcldy9OLo62DLxw1a9cFSLsnYb
sidebar_position: 6
keywords: 
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance
  - zilliz
  - zilliz cloud
  - cloud
  - useDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# useDatabase()

This operation sets the active database for the gRPC client.

```javascript
await milvusClient.useDatabase(data?)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.useDatabase({
    db_name: string
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database to use.

    There should be a database with the specified name. Otherwise, exceptions will occur.

**RETURNS:**

*Promise&lt;\{ error_code: string, reason: string }&gt;*

This method returns a promise that resolves to an object carrying the result status.

```javascript
{
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **error_code** (*string* | *number*) -

    An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

- **reason** (*string*) - 

    The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.


**EXCEPTIONS:**

- **Error**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.useDatabase({ db_name: 'new_db' });
```
