---
title: "listIndexes() | Node.js"
slug: /node/node/Management-listIndexes
sidebar_label: "listIndexes()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists the indexes of a specific collection | Node.js"
type: docx
token: N1fldMqhtoWBJPxh8VccivqxnZd
sidebar_position: 16
keywords: 
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - listIndexes()
  - nodejs26
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listIndexes()

This operation lists the indexes of a specific collection

```javascript
listIndexes(data): Promise<ListIndexResponse>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.listIndexes({
   db_name: string,
   collection_name: string,
   field_name?: string,
   index_name?: string
   timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **field_name** (*string*) -

    The name of an existing field in the collection. 

- **index_name** (*string*) -

    The name of the index to describe.

- **timeout** (*number*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\<DescribeIndexResponse>*

This method returns a promise that resolves to a **DescribeIndexResponse** object.

```javascript
{
    indexes: string[],
    status: object
}
```

**PARAMETERS:**

- **indexes** (*string[]*) -

    A list of index names.

- **status** (*object*) -

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.