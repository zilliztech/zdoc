---
title: "describeDatabase() | Node.js"
slug: /node/node/Database-describeDatabase
sidebar_label: "describeDatabase()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation describes a database, returning details such as the database name, ID, creation timestamp, and properties. | Node.js"
type: docx
token: PzXldcfljoU9rOx9TFUcIoNknt6
sidebar_position: 8
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - describeDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeDatabase()

This operation describes a database, returning details such as the database name, ID, creation timestamp, and properties.

```javascript
await milvusClient.describeDatabase(data: DescribeDatabaseRequest)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.describeDatabase({
    db_name: string,
    timeout?: number,
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    The name of the database to describe.

- **timeout** (*number*) -

    RPC timeout in milliseconds. Optional.

**RETURNS** *Promise&lt;DescribeDatabaseResponse&gt;*

This method returns a promise that resolves to a **DescribeDatabaseResponse** object.

```typescript
{
    db_name: string,
    dbID: number,
    created_timestamp: number,
    properties: KeyValuePair[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **db_name** (*string*) -
The database name.

- **dbID** (*number*) -
The internal database identifier.

- **created_timestamp** (*number*) -
The creation timestamp of the database, in milliseconds.

- **properties** (*KeyValuePair[]*) -
Database-level properties (for example, **database.replica.number**, **database.resource_groups**) declared at creation or set via `alterDatabaseProperties()`.

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
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await client.describeDatabase({ db_name: 'default' });
console.log(res.db_name, res.dbID, res.properties);
```
