---
title: "getPkFieldName() | Node.js"
slug: /node/node/Collections-getPkFieldName
sidebar_label: "getPkFieldName()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the primary key field name of a collection. This is a convenient method that describes the collection and extracts the primary key field name. | Node.js"
type: docx
token: WiVnd8VXooFQ9PxVgiyc7FkqnAg
sidebar_position: 26
keywords: 
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - zilliz
  - zilliz cloud
  - cloud
  - getPkFieldName()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getPkFieldName()

This operation gets the primary key field name of a collection. This is a convenient method that describes the collection and extracts the primary key field name.

```javascript
await milvusClient.getPkFieldName(data: DescribeCollectionReq)
```

## Request Syntax\{#request-syntax}

```javascript
getPkFieldName({
    collection_name: string,
    timeout: number
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the collection.

- **timeout** (*number*) -

    RPC timeout in milliseconds. Optional.

**RETURNS:**

*Promise\<string\>*

The name of the primary key field.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const pkName = await client.getPkFieldName({
    collection_name: 'my_collection',
});
console.log(pkName); // e.g., "id"
```
