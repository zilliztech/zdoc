---
title: "listFileResources() | Node.js"
slug: /node/node/FileResources-listFileResources
sidebar_label: "listFileResources()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists the file resources registered in Milvus metadata. | Node.js"
type: docx
token: GK8hdiDs8olcOtxu0BKc89Vxn0b
sidebar_position: 2
keywords: 
  - file resource
  - analyzer
  - dictionary
  - zilliz
  - zilliz cloud
  - cloud
  - listFileResources()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listFileResources()

This operation lists the file resources registered in Milvus metadata.

```javascript
await milvusClient.listFileResources(data?)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.listFileResources({
    timeout?: number
})
```

**PARAMETERS:**

- **timeout** (*number*) -

    The timeout duration in milliseconds for this operation.

**RETURNS:**

*Promise&lt;ListFileResourcesResponse&gt;*

This method returns a promise that resolves to a **ListFileResourcesResponse** object.

```javascript
{
    resources: FileResourceInfo[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **resources** (*FileResourceInfo[]*) -

    A list of file resources registered in Milvus metadata.

    - **id** (*string*) -

        The internal ID of the file resource.

    - **name** (*string*) -

        The name of the file resource.

    - **path** (*string*) -

        The path of the file resource.

- **status** (*ResStatus*) -

    A **ResStatus** object.

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

const res = await milvusClient.listFileResources();
```
