---
title: "alterDatabaseProperties() | Node.js"
slug: /node/node/Database-alterDatabaseProperties
sidebar_label: "alterDatabaseProperties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation modifies the properties of the specified database. | Node.js"
type: docx
token: NNWed9Vd1o7vDkxY4pncM4wYnaf
sidebar_position: 7
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - alterDatabaseProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterDatabaseProperties()

This operation modifies the properties of the specified database.

```javascript
await milvusClient.alterDatabaseProperties(data)
```

<Admonition type="info" icon="📘" title="Notes">

This method applies only to dedicated clusters.

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.alterDatabaseProperties({
    db_name: string,
    delete_keys: Object,
    properties: Record<string, string | number | boolean>
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database whose properties are to be modified.

    There should be a database with the specified name. Otherwise, exceptions will occur.

- **delete_properties** (*string[]*) -

    Names of the properties to drop in an array. Possible database properties are as follows:

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

- **properties** (*Record&lt;string, string | number | boolean&gt;*) -

    Properties and their values in key-value pairs.

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

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise |&lt;ResStatus&gt;*

This method returns a promise that resolves to a **ResStatus** object.

```javascript
{
    code: number
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

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.alterDatabaseProperties({ 
    db_name: 'new_db',
    delete_properties: {'database.replica.number': 3} 
});
```

