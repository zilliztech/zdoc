---
title: "truncateCollection() | Node.js"
slug: /node/node/Collections-truncateCollection
sidebar_key: node/Collections-truncateCollection
sidebar_label: "truncateCollection()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation removes all data from a collection but retains the collection schema and structure. | Node.js"
type: docx
token: J0IBdbw3Voyqw9xnInUcn9EonTe
sidebar_position: 27
keywords: 
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db
  - zilliz
  - zilliz cloud
  - cloud
  - truncateCollection()
  - nodejs26
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# truncateCollection()

This operation removes all data from a collection but retains the collection schema and structure.

```javascript
await milvusClient.truncateCollection(data: TruncateCollectionRequest)
```

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><strong>Irreversible operation</strong></li>
</ul>
<p>Truncating a collection permanently removes all data.</p>
<ul>
<li><strong>Schema preserved</strong></li>
</ul>
<p>The collection structure, fields, indexes, and properties remain intact.</p>

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
truncateCollection({
    db_name?: string,
    collection_name: string,
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database containing the collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **timeout** (*number*) -

    RPC timeout in milliseconds.

**RETURNS:**

*Promise\<ResStatus\>*

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

### Basic usage\{#basic-usage}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

// Truncate collection
const res = await milvusClient.truncateCollection({
  collection_name: 'my_collection',
});

console.log(res);
// Output: { error_code: 'Success', reason: '' }
```

### With database specified\{#with-database-specified}

```javascript
const res = await milvusClient.truncateCollection({
  db_name: 'my_database',
  collection_name: 'my_collection',
});
```
