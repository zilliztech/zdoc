---
title: "dropCollectionField() | Node.js"
slug: /node/node/Collections-dropCollectionField
sidebar_label: "dropCollectionField()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation drops a field from the collection schema. | Node.js"
type: docx
token: ANWZdmEMkocWK3xo2ZxcnqtLnUh
sidebar_position: 31
keywords: 
  - drop field
  - schema
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# dropCollectionField()

This operation drops a field from an existing collection by name or ID.

```javascript
await milvusClient.dropCollectionField(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.dropCollectionField({
    collection_name: string,
    field_name?: string,
    field_id?: number | string,
    db_name?: string,
    timeout?: number
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the collection that holds the field.

- **field_name** (*string*) -

    The name of the field to drop. Provide either `field_name` or `field_id`, not both.

- **field_id** (*number* | *string*) -

    The ID of the field to drop. Provide either `field_name` or `field_id`, not both.

- **db_name** (*string*) -

    The name of the database where the collection resides.

- **timeout** (*number*) -

    The timeout duration in milliseconds for this operation.

**RETURNS:**

*Promise&lt;ResStatus&gt;*

This method returns a promise that resolves to a **ResStatus** object.

**EXCEPTIONS:**

- **Error**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.dropCollectionField({
    collection_name: 'my_collection',
    field_name: 'sparse_vector',
});
```
