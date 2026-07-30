---
title: "getPkField() | Node.js"
slug: /node/node/Collections-getPkField
sidebar_label: "getPkField()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the complete primary field schema of a collection. This is a convenient method that describes the collection and extracts the primary key field. | Node.js"
type: docx
token: LmnudtyV5owY2zx5D9WcENcsnFg
sidebar_position: 25
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - getPkField()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getPkField()

This operation gets the complete primary field schema of a collection. This is a convenient method that describes the collection and extracts the primary key field.

```javascript
await milvusClient.getPkField(data: DescribeCollectionReq)
```

## Request Syntax\{#request-syntax}

```javascript
getPkField({
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

*Promise\<FieldSchema\>*

The complete field schema object for the primary key, including name, data type, field ID, and other properties.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const pkField = await client.getPkField({
    collection_name: 'my_collection',
});
console.log(pkField.name, pkField.data_type);
```
