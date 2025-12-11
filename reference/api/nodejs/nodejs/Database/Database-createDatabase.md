---
title: "createDatabase() | Node.js"
slug: /node/node/Database-createDatabase
sidebar_label: "createDatabase()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "This operation creates a database. | Node.js"
type: docx
token: JmlKdBz7Io91Ffx9rpKce3vUnMc
sidebar_position: 2
keywords: 
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - createDatabase()
  - nodejs26
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createDatabase()

This operation creates a database.

```javascript
createDatabase(data): Promise<ResStatus>
```

<Admonition type="info" icon="📘" title="Notes">

<p>This method applies only to dedicated clusters.</p>

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
milvusClient.createDatabase({
    db_name: string,
    properties?: Object
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database to create.

    There should be no database that has the specified name. Otherwise, exceptions will occur.

- **properties** (*Object*) -

    Properties to set along with database creation. Possible database properties are as follows:

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

## Example\{#example}

```javascript
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const resStatus = await milvusClient.createDatabase({ db_name: 'new_db' });
```
