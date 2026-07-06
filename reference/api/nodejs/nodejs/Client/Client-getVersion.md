---
title: "getVersion() | Node.js"
slug: /node/node/Client-getVersion
sidebar_label: "getVersion()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns version information for the Milvus server. | Node.js"
type: docx
token: WA81dokeYotwt9xAiKKcaaIpnxc
sidebar_position: 8
keywords: 
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
  - zilliz
  - zilliz cloud
  - cloud
  - getVersion()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getVersion()

This operation returns version information for the Milvus server.

```javascript
await milvusClient.getVersion()
```

**RETURNS** *Promise&lt;GetVersionResponse&gt;*

This method returns a promise that resolves to a **GetVersionResponse** object.

```typescript
{
    version: string
}
```

**PARAMETERS:**

- **version** (*string*) -

    The semantic version of the Milvus server (for example, **"v3.0.0"**).

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
