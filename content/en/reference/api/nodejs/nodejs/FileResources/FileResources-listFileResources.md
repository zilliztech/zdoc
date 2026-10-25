---
title: "listFileResources() | Node.js"
slug: /node/node/FileResources-listFileResources
sidebar_label: "listFileResources()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists the file resources registered in Milvus metadata. | Node.js"
type: docx
token: GK8hdiDs8olcOtxu0BKc89Vxn0b
sidebar_position: 2
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - listFileResources()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# listFileResources()

This operation lists the file resources registered in Milvus metadata.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.listFileResources({ timeout? })
```

**PARAMETERS:**

- **timeout** (*number*) -

    An optional duration of time in milliseconds to allow for the RPC. Default is undefined.

**RETURN TYPE:**

*ListFileResourcesResponse*

**RETURNS:**

The response status and the list of registered file resources.

**PARAMETERS:**

- **status** (*ResStatus*) -

    The operation status: `{error_code, reason}`.

- **resources** (*FileResourceInfo[]*) -

    The registered file resources: each entry carries `{id, name, path}`.

**EXCEPTIONS:**

- **MilvusError**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Example\{#example}

```javascript
const response = await milvusClient.listFileResources({});
```
