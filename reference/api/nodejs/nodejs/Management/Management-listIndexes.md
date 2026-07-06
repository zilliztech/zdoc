---
title: "listIndexes() | Node.js"
slug: /node/node/Management-listIndexes
sidebar_label: "listIndexes()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists the indexes of a specific collection | Node.js"
type: docx
token: N1fldMqhtoWBJPxh8VccivqxnZd
sidebar_position: 16
keywords: 
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
  - zilliz
  - zilliz cloud
  - cloud
  - listIndexes()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listIndexes()

This operation lists the indexes of a specific collection

```javascript
await milvusClient.listIndexes(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.listIndexes({
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

**RETURNS** *Promise&lt;ListIndexResponse&gt;*

This method returns a promise that resolves to a **ListIndexResponse** object.

```typescript
{
    indexes: string[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **indexes** (*string[]*) -
A list of index names defined on the requested collection.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.