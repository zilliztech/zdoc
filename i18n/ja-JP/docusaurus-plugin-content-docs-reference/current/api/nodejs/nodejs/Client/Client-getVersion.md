---
title: "getVersion() | Node.js"
slug: /node/node/Client-getVersion
sidebar_label: "getVersion()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は Milvus server のバージョン情報を返します。 | Node.js"
type: docx
token: WA81dokeYotwt9xAiKKcaaIpnxc
sidebar_position: 8
keywords: 
  - vector database の例
  - rag vector database
  - vector db とは
  - vector databases とは
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

この操作は Milvus server のバージョン情報を返します。

```javascript
await milvusClient.getVersion()
```

**RETURNS** *Promise&lt;GetVersionResponse&gt;*

このメソッドは、**GetVersionResponse** オブジェクトに解決される promise を返します。

```typescript
{
    version: string
}
```

**PARAMETERS:**

- **version** (*string*) -

    Milvus server のセマンティックバージョン（例: **"v3.0.0"**）。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await client.getVersion();
console.log(res.version); // "2.6.9"
```
