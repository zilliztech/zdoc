---
title: "MetricType | Node.js"
slug: /node/node/Management-MetricType
sidebar_label: "MetricType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "这是一个提供以下常量的枚举。| Node.js"
type: docx
token: KQDEdcccXozuKpxDg78cSmxYnQg
sidebar_position: 21
keywords: 
  - Faiss
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - zilliz
  - zilliz cloud
  - 云
  - MetricType
  - nodejs30
displayed_sidebar: nodeSidebar

---

# MetricType

定义用于度量向量之间距离或相似度的度量类型。

```typescript
export enum MetricType {
  L2 = 'L2',
  IP = 'IP',
  COSINE = 'COSINE',
  HAMMING = 'HAMMING',
  JACCARD = 'JACCARD',
  TANIMOTO = 'TANIMOTO',
  SUBSTRUCTURE = 'SUBSTRUCTURE',
  SUPERSTRUCTURE = 'SUPERSTRUCTURE',
  BM25 = 'BM25',
  MHJACCARD = 'MHJACCARD',
  MAX_SIM = 'MAX_SIM',
  MAX_SIM_COSINE = 'MAX_SIM_COSINE',
  MAX_SIM_IP = 'MAX_SIM_IP',
  MAX_SIM_L2 = 'MAX_SIM_L2',
  DTW_COSINE = 'DTW_COSINE',
  DTW_IP = 'DTW_IP',
}
```

**常量：**

- **L2** ('L2')

    将度量类型设置为欧几里得距离（L2）。这仅适用于浮点向量。

- **IP** ('IP')

    将度量类型设置为内积（IP）。这仅适用于浮点向量。

- **COSINE** ('COSINE')

    将度量类型设置为 COSINE。这仅适用于浮点向量。

- **HAMMING** ('HAMMING')

    将度量类型设置为 HAMMING。这仅适用于二进制向量。

- **JACCARD** ('JACCARD')

    将度量类型设置为 JACCARD。这仅适用于二进制向量。

- **TANIMOTO** ('TANIMOTO')

    将度量类型设置为 TANIMOTO。这仅适用于二进制向量。

- **SUBSTRUCTURE** ('SUBSTRUCTURE')

    将度量类型设置为 SUBSTRUCTURE。这仅适用于二进制向量。

- **SUPERSTRUCTURE** ('SUPERSTRUCTURE')

    将度量类型设置为 SUPERSTRUCTURE。这仅适用于二进制向量。

- **BM25** ('BM25')

    将度量类型设置为 BM25。这仅适用于稀疏向量。

- **MHJACCARD** ('MHJACCARD')

    将度量类型设置为 MHJACCARD。这仅适用于二进制向量。

- **MAX_SIM** ('MAX_SIM')

    将度量类型设置为 MAX_SIM。这仅适用于 embedding 列表。

- **MAX_SIM_COSINE** ('MAX_SIM_COSINE')

    将度量类型设置为 MAX_SIM_COSINE。这仅适用于 embedding 列表。

- **MAX_SIM_IP** ('MAX_SIM_IP')

    将度量类型设置为 MAX_SIM_IP。这仅适用于 embedding 列表。

- **MAX_SIM_L2** ('MAX_SIM_L2')

    将度量类型设置为 MAX_SIM_L2。这仅适用于 embedding 列表。

- **DTW_COSINE** ('DTW_COSINE')

    将度量类型设置为 DTW_COSINE。这仅适用于 embedding 列表。

- **DTW_IP** ('DTW_IP')

    将度量类型设置为 DTW_IP。这仅适用于 embedding 列表。

## 示例\{#example}

```javascript
import { MilvusClient, IndexType, MetricType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

await milvusClient.createIndex({
    collection_name: 'my_collection',
    field_name: 'vector',
    index_type: IndexType.HNSW,
    metric_type: MetricType.COSINE,
});
```
