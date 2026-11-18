---
title: "MetricType | Node.js"
slug: /node/node/Management-MetricType
sidebar_label: "MetricType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This is an enumeration that provides the following constants. | Node.js"
type: docx
token: KQDEdcccXozuKpxDg78cSmxYnQg
sidebar_position: 21
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - MetricType
  - nodejs30
displayed_sidebar: nodeSidebar

---

# MetricType

Defines the metric types used to measure the distance or similarity between vectors.

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

**Constants:**

- **L2** ('L2')

    Sets the metric type to Euclidean distance (L2). This applies only to float vectors.

- **IP** ('IP')

    Sets the metric type to inner product (IP). This applies only to float vectors.

- **COSINE** ('COSINE')

    Sets the metric type to COSINE. This applies only to float vectors.

- **HAMMING** ('HAMMING')

    Sets the metric type to HAMMING. This applies only to binary vectors.

- **JACCARD** ('JACCARD')

    Sets the metric type to JACCARD. This applies only to binary vectors.

- **TANIMOTO** ('TANIMOTO')

    Sets the metric type to TANIMOTO. This applies only to binary vectors.

- **SUBSTRUCTURE** ('SUBSTRUCTURE')

    Sets the metric type to SUBSTRUCTURE. This applies only to binary vectors.

- **SUPERSTRUCTURE** ('SUPERSTRUCTURE')

    Sets the metric type to SUPERSTRUCTURE. This applies only to binary vectors.

- **BM25** ('BM25')

    Sets the metric type to BM25. This applies only to sparse vectors.

- **MHJACCARD** ('MHJACCARD')

    Sets the metric type to MHJACCARD. This applies only to binary vectors.

- **MAX_SIM** ('MAX_SIM')

    Sets the metric type to MAX_SIM. This applies only to embedding lists.

- **MAX_SIM_COSINE** ('MAX_SIM_COSINE')

    Sets the metric type to MAX_SIM_COSINE. This applies only to embedding lists.

- **MAX_SIM_IP** ('MAX_SIM_IP')

    Sets the metric type to MAX_SIM_IP. This applies only to embedding lists.

- **MAX_SIM_L2** ('MAX_SIM_L2')

    Sets the metric type to MAX_SIM_L2. This applies only to embedding lists.

- **DTW_COSINE** ('DTW_COSINE')

    Sets the metric type to DTW_COSINE. This applies only to embedding lists.

- **DTW_IP** ('DTW_IP')

    Sets the metric type to DTW_IP. This applies only to embedding lists.

## Example\{#example}

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

