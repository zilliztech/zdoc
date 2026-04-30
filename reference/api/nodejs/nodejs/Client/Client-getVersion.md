---
title: "getVersion() | Node.js"
slug: /node/node/Client-getVersion
sidebar_key: node/Client-getVersion
sidebar_label: "getVersion()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation returns version information for the Milvus server. | Node.js"
type: docx
token: WA81dokeYotwt9xAiKKcaaIpnxc
sidebar_position: 6
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - getVersion()
  - nodejs26
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# getVersion()

This operation returns version information for the Milvus server.

```javascript
await milvusClient.getVersion()
```

**RETURNS:**

*Promise\<GetVersionResponse\>*

The response contains the version string of the connected server.

**EXCEPTIONS:**

- **MilvusError**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await client.getVersion();
console.log(res.version); // "2.6.9"
```
