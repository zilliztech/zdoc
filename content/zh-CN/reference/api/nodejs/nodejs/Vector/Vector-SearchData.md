---
title: "SearchData | Node.js"
slug: /node/node/Vector-SearchData
sidebar_label: "SearchData"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "受支持的搜索输入形式之一中的搜索目标条目。 | Node.js"
type: origin
token: shared-Vector-SearchData
keywords: 
  - 搜索数据
  - 搜索
  - zilliz
  - zilliz cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# SearchData

搜索目标条目：受支持的搜索输入形式之一。

```typescript
export type SearchData = SearchVector | SearchText | SearchEmbList;

```

**字段：**

- **SearchVector**

    向量输入。

- **SearchText**

    用于全文检索/嵌入搜索的文本输入。

- **SearchEmbList**

    嵌入列表输入。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.search({
    collection_name: 'my_collection',
    vector: [0.1, 0.2, 0.3, 0.4], // SearchData (SearchVector)
    limit: 5,
});
```
