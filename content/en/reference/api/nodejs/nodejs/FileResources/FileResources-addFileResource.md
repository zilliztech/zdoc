---
title: "addFileResource() | Node.js"
slug: /node/node/FileResources-addFileResource
sidebar_label: "addFileResource()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation adds a named file resource to Milvus metadata. | Node.js"
type: docx
token: RnyUdtGbFoIC7AxyhmNcbudYnhb
sidebar_position: 1
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - addFileResource()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# addFileResource()

This operation adds a named file resource to Milvus metadata.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.addFileResource({ name, path, timeout? })
```

**PARAMETERS:**

- **name** (*string*) -

    The name to reference the file resource by.

- **path** (*string*) -

    The path of the remote file.

- **timeout** (*number*) -

    An optional duration of time in milliseconds to allow for the RPC. Default is undefined.

**RETURN TYPE:**

*ResStatus*

**RETURNS:**

A promise that resolves with the operation status.

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
await milvusClient.addFileResource({
  name: 'training_data',
  path: 's3://bucket/training.csv',
});
```
