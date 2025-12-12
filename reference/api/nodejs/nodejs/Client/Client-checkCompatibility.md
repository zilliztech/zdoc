---
title: "checkCompatibility() | Node.js"
slug: /node/node/Client-checkCompatibility
sidebar_label: "checkCompatibility()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation checks the compatibility of the SDK with the Milvus server. | Node.js"
type: docx
token: Tq1Md4GuIoNbfuxK03ncIa7onMc
sidebar_position: 1
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - checkCompatibility()
  - nodejs26
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# checkCompatibility()

This operation checks the compatibility of the SDK with the Milvus server.

```javascript
checkCompatibility(data?): Promise<any>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.checkCompatibility({
    checker?: Function,
    message?: string
})
```

**PARAMETERS:**

- **checker** (*Function*) -

    A callback function that will be called if the current SDK is compatible.

- **message** (*string*) -  

    The error message to throw if the SDK is incompatible.

**RETURN TYPE:**

*Promise*\<*any*>

**RETURNS:**

A promise that resolves to the result of the specified checker function.

## Examples\{#examples}

```javascript
milvusClient.checkCompatibility({
   checker: () => { console.log("compatible") },
   message: "incompatible"
});
```
