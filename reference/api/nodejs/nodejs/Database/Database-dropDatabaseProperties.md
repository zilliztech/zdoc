---
displayed_sidbar: nodeSidebar
title: "dropDatabaseProperties() | Node.js"
slug: /node/node/Database-dropDatabaseProperties
sidebar_label: "dropDatabaseProperties()"
beta: false
notebook: false
description: "This operation drops the setting of the specified properties. | Node.js"
type: docx
token: GulFdOWMboEK9bxnzMSc8Uf8n8b
sidebar_position: 4
keywords: 
  - Image Search
  - LLMs
  - Machine Learning
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - dropDatabaseProperties()
  - nodejs25
  - LLMs
  - Machine Learning
  - RAG
  - NLP
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# dropDatabaseProperties()

This operation drops the setting of the specified properties.

```javascript
dropDatabaseProperties(data): Promise<ResStatus>
```

<Admonition type="info" icon="📘" title="Notes">

<p>This method applies only to dedicated clusters.</p>

</Admonition>

## Request Syntax{#request-syntax}

```javascript
milvusClient.dropDatabaseProperties({
    db_name: string,
    delete_properties: string[],
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database whose properties are to be dropped.

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

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise |\<ResStatus>*

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

## Example{#example}

```javascript
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const resStatus = await milvusClient.dropDatabaseProperties({ 
    db_name: 'new_db',
    delete_properties: ["database.replica.number"] 
});
```
