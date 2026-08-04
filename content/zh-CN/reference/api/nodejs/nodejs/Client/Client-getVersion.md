---
title: "getVersion() | Node.js"
slug: /node/node/Client-getVersion
sidebar_label: "getVersion()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回 Milvus 服务器的版本信息。 | Node.js"
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

此操作返回 Milvus 服务器的版本信息。

```javascript
await milvusClient.getVersion()
```

**返回值** *Promise&lt;GetVersionResponse&gt;*

此方法返回一个 Promise，该 Promise 会解析为一个 **GetVersionResponse** 对象。

```typescript
{
    version: string
}
```

**参数：**

- **version** (*string*) -

    Milvus 服务器的语义版本号（例如 **"v3.0.0"**）。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await client.getVersion();
console.log(res.version); // "2.6.9"
```
