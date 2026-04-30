---
title: "describeDatabase() | Node.js"
slug: /node/node/Database-describeDatabase
sidebar_key: node/Database-describeDatabase
sidebar_label: "describeDatabase()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists detailed information about the specified database. | Node.js"
type: docx
token: PzXldcfljoU9rOx9TFUcIoNknt6
sidebar_position: 8
keywords: 
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - zilliz
  - zilliz cloud
  - cloud
  - describeDatabase()
  - nodejs26
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# describeDatabase()

This operation lists detailed information about the specified database.

```javascript
describeDatabase(data): Promise<DescribeDatabaseResponse>
```

<Admonition type="info" icon="📘" title="Notes">

<p>This method applies only to dedicated clusters.</p>

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
milvusClient.describeDatabase({
    db_name: string,
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database to describe.

    There should be a database with the specified name. Otherwise, exceptions will occur.

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise |&lt;DescribeDatabaseResponse&gt;*

This method returns a promise that resolves to a **DescribeDatabaseResponse** object.

```javascript
{
    db_name: string,
    dbID: number,
    created_timestamp: number,
    properties: KeyValuePair<string, string | number>[],
    status: {
        code: number
        error_code: string | number,
        reason: string   
    }
}
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database.

- **dbID** (*number*) -

    The ID of the database.

- **created_timestamp** (*number*) -

    The time at which the database has been created.

- **properties** (*KeyValuePair\<string, string | number>[]*) -

    The database properties. Possible database properties are as follows:

    - **database.replica.number** (*int*) -

        Number of replicas for the database.

    - **database.resource_groups** (*[]str*) -

        Resource groups dedicated to the database.

    - **database.diskQuota.mb** (*int*) -

        Disk quota allocated to the database in megabytes (**MB**).

    - **database.max.collections** (*int*) -

        Maximum number of collections allowed in the database.

    - **database.force.deny.writing** (*bool*) -

        Whether to deny all write operations in the database.

    - **database.force.deny.reading** (*bool*) -

        Whether to deny all read operations in the database.

## Example\{#example}

```python
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const resStatus = await milvusClient.describeDatabase({ 
    db_name: 'new_db',
});

```
