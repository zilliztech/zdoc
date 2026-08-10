---
title: "session() | Node.js"
slug: /node/node/Client-session
sidebar_label: "session()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建一个绑定到目标集群 ID 的轻量级 DQL 会话。该会话会将 `clusterid` 注入到 search/query/get 请求中。 | Node.js"
type: docx
token: LPfrdnntOogNMRxwqvCccBgnnve
sidebar_position: 7
keywords: 
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - session()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# session()

此操作会创建一个绑定到目标集群 ID 的轻量级 DQL 会话。该会话会将 `cluster_id` 注入到 search/query/get 请求中。

```typescript
const session = milvusClient.session(clusterId: string)
```

## 请求语法\{#request-syntax}

```typescript
const session = milvusClient.session('cluster-a')
```

**参数：**

- **clusterId** (*string*) -

    **[必需]**

    用于路由 DQL 请求的目标集群 ID。

**返回：**

*MilvusClientSession*

一个会话对象，提供 `search`、`hybridSearch`、`searchIterator`、`query`、`queryIterator`、`get` 和 `close`。

**异常：**

- **Error**

    当 `clusterId` 为空或不是字符串时引发。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const session = client.session('cluster-a');
const hits = await session.search({
    collection_name: 'products',
    data: [[0.12, 0.35, 0.77]],
    limit: 5,
});
```
