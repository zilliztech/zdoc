---
title: "session() | Node.js"
slug: /node/node/Client-session
sidebar_label: "session()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、対象の cluster ID にバインドされた軽量な DQL session を作成します。この session は search/query/get リクエストに `clusterid` を注入します。 | Node.js"
type: docx
token: LPfrdnntOogNMRxwqvCccBgnnve
sidebar_position: 7
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - Elastic vector database
  - zilliz
  - zilliz cloud
  - cloud
  - session()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# session()

この操作は、対象の cluster ID にバインドされた軽量な DQL session を作成します。この session は search/query/get リクエストに `cluster_id` を注入します。

```typescript
const session = milvusClient.session(clusterId: string)
```

## Request Syntax\{#request-syntax}

```typescript
const session = milvusClient.session('cluster-a')
```

**PARAMETERS:**

- **clusterId** (*string*) -

    **[REQUIRED]**

    DQL リクエストのルーティングに使用される対象 cluster ID。

**RETURNS:**

*MilvusClientSession*

`search`、`hybridSearch`、`searchIterator`、`query`、`queryIterator`、`get`、`close` を提供する session オブジェクトです。

**EXCEPTIONS:**

- **Error**

    `clusterId` が空、または文字列ではない場合に発生します。

## Example\{#example}

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
