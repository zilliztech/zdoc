---
title: "FunctionScore | Node.js"
slug: /node/node/Vector-FunctionScore
sidebar_label: "FunctionScore"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "描述用于搜索的 function-score 重排配置。 | Node.js"
type: origin
token: shared-Vector-FunctionScore
keywords: 
  - 函数分数
  - 重排
  - 搜索
  - zilliz
  - zilliz cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# FunctionScore

描述用于搜索的 function-score 重排配置。

```typescript
export interface FunctionScore {
  functions: FunctionObject[];
  params: keyValueObj;
}

```

**字段：**

- **functions**（*FunctionObject[]*）-

    应用于搜索结果的函数。请参见 [FunctionObject](./Collections-FunctionObject)。

- **params**（*keyValueObj*）-

    用于 function-score 重排的额外参数。

## 示例\{#example}

```javascript
import { MilvusClient, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.search({
    collection_name: 'my_collection',
    vector: [0.1, 0.2, 0.3, 0.4],
    limit: 5,
    rerank: {
        functions: [
            {
                name: 'bounded_linear',
                type: FunctionType.RERANK,
                input_field_names: ['vector'],
                output_field_names: ['vector'],
                params: { boost: 2.0, bound: 10.0 },
            },
        ],
        params: {},
    },
});
```
