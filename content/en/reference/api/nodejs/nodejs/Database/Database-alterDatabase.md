---
title: "alterDatabase() | Node.js"
slug: /node/node/Database-alterDatabase
sidebar_label: "alterDatabase()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation modifies database properties, such as setting or deleting configuration key-value pairs. | Node.js"
type: docx
token: HTGgd3icQo2ssuxywUocz02Enhe
sidebar_position: 1
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - alterDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterDatabase()

This operation modifies database properties, such as setting or deleting configuration key-value pairs.

```javascript
await milvusClient.alterDatabase(data: AlterDatabaseRequest)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.alterDatabase({
    db_name: string,
    db_id?: string,
    properties: object,
    delete_keys?: string[],
    timeout?: number,
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    The name of the database.

- **db_id** (*string*) -

    The ID of the database to modify. Optional.

- **properties** (*object*) -

    **[REQUIRED]**

    An object of properties to set (e.g., `{ "database.resource_groups": "rg1" }` to set database resource groups).

- **delete_keys** (*string[]*) -

    Property keys to delete. Optional.

- **timeout** (*number*) -

    RPC timeout in milliseconds. Optional.

**RETURNS:**

*Promise\<ResStatus\>*

**EXCEPTIONS:**

- **MilvusError**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
await client.alterDatabase({
    db_name: 'my_database',
    properties: { 'database.resource_groups': 'rg1' },
});
```
