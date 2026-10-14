---
title: "removeFileResource() | Node.js"
slug: /node/node/FileResources-removeFileResource
sidebar_label: "removeFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes a named file resource from Milvus metadata. | Node.js"
type: docx
token: TfFQdwR7borsLfxiwdCcXoKvnth
sidebar_position: 3
keywords: 
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
  - zilliz
  - zilliz cloud
  - cloud
  - removeFileResource()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# removeFileResource()

This operation removes a named file resource from Milvus metadata.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.removeFileResource({ name, timeout? })
```

**PARAMETERS:**

- **name** (*string*) -

    The name of the file resource to remove.

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
await milvusClient.removeFileResource({
  name: 'training_data',
});
```
