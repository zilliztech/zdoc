---
title: "RerankerObj | Node.js"
slug: /node/node/Vector-RerankerObj
sidebar_label: "RerankerObj"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "描述用于搜索的重排器配置。 | Node.js"
type: origin
token: shared-Vector-RerankerObj
keywords: 
  - 重排器
  - 重排
  - 搜索
  - zilliz
  - zilliz cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RerankerObj

描述用于搜索的重排器配置。

```typescript
export type RerankerObj = {
  strategy: RANKER_TYPE | string; // rerank strategy
  params: keyValueObj; // rerank parameters
};

```

**字段：**

- **strategy**（*RANKER_TYPE | string*）-

    重排策略。

- **params**（*keyValueObj*）-

    重排参数。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.hybridSearch({
    collection_name: 'my_collection',
    data: [
        {
            anns_field: 'dense_vector',
            data: [0.1, 0.2, 0.3, 0.4, 0.5],
        },
    ],
    limit: 10,
    rerank: { strategy: 'rrf', params: { k: 60 } }, // RerankerObj
    output_fields: ['id', 'text'],
});
```
