---
title: "removeFileResource() | Node.js"
slug: /node/node/FileResources-removeFileResource
sidebar_label: "removeFileResource()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation removes a named file resource from Milvus metadata. | Node.js"
type: docx
token: TfFQdwR7borsLfxiwdCcXoKvnth
sidebar_position: 3
keywords: 
  - file resource
  - analyzer
  - dictionary
  - zilliz
  - zilliz cloud
  - cloud
  - removeFileResource()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# removeFileResource()

This operation removes a file resource from Milvus metadata.

```javascript
await milvusClient.removeFileResource(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.removeFileResource({
    name: string,
    timeout?: number
})
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    The name of the file resource to remove.

- **timeout** (*number*) -

    The timeout duration in milliseconds for this operation.

**RETURNS:**

*Promise&lt;ResStatus&gt;*

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

const resStatus = await milvusClient.removeFileResource({
    name: 'embedding_model',
});
```
