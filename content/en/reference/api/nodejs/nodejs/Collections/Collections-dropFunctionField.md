---
title: "dropFunctionField() | Node.js"
slug: /node/node/Collections-dropFunctionField
sidebar_label: "dropFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a function together with its output fields and bound indexes from a collection. | Node.js"
type: docx
token: MmABd2rdooxiLZxYzwEciyTanOg
sidebar_position: 32
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - dropFunctionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# dropFunctionField()

This operation drops a function together with its output fields and bound indexes from a collection.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.dropFunctionField({ collection_name, function_name, timeout? })
```

**PARAMETERS:**

- **collection_name** (*string*) -

    The name of an existing collection.

- **function_name** (*string*) -

    The name of the function to drop.

- **timeout** (*number*) -

    An optional duration of time in milliseconds to allow for the RPC. Default is undefined.

**RETURNS:**

*ResStatus*

The alter status returned by the schema change.

**PARAMETERS:**

- **error_code** (*number*) -

    The error code number: 0 means success.

- **reason** (*string*) -

    The cause of the error, if any.

**EXCEPTIONS:**

- **MilvusError**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Example\{#example}

```javascript
await milvusClient.dropFunctionField({
  collection_name: 'my_collection',
  function_name: 'bm25_fn',
});
```
