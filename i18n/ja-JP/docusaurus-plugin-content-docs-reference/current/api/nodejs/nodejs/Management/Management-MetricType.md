---
title: "MetricType | Node.js"
slug: /node/node/Management-MetricType
sidebar_label: "MetricType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "以下の定数を提供する列挙型です。 | Node.js"
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

ベクトル間の距離または類似度を測定するために使用されるメトリックタイプを定義します。

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

**定数:**

- **L2** ('L2')

    メトリックタイプをユークリッド距離（L2）に設定します。これは浮動小数点ベクトルにのみ適用されます。

- **IP** ('IP')

    メトリックタイプを内積（IP）に設定します。これは浮動小数点ベクトルにのみ適用されます。

- **COSINE** ('COSINE')

    メトリックタイプを COSINE に設定します。これは浮動小数点ベクトルにのみ適用されます。

- **HAMMING** ('HAMMING')

    メトリックタイプを HAMMING に設定します。これはバイナリベクトルにのみ適用されます。

- **JACCARD** ('JACCARD')

    メトリックタイプを JACCARD に設定します。これはバイナリベクトルにのみ適用されます。

- **TANIMOTO** ('TANIMOTO')

    メトリックタイプを TANIMOTO に設定します。これはバイナリベクトルにのみ適用されます。

- **SUBSTRUCTURE** ('SUBSTRUCTURE')

    メトリックタイプを SUBSTRUCTURE に設定します。これはバイナリベクトルにのみ適用されます。

- **SUPERSTRUCTURE** ('SUPERSTRUCTURE')

    メトリックタイプを SUPERSTRUCTURE に設定します。これはバイナリベクトルにのみ適用されます。

- **BM25** ('BM25')

    メトリックタイプを BM25 に設定します。これはスパースベクトルにのみ適用されます。

- **MHJACCARD** ('MHJACCARD')

    メトリックタイプを MHJACCARD に設定します。これはバイナリベクトルにのみ適用されます。

- **MAX_SIM** ('MAX_SIM')

    メトリックタイプを MAX_SIM に設定します。これは埋め込みリストにのみ適用されます。

- **MAX_SIM_COSINE** ('MAX_SIM_COSINE')

    メトリックタイプを MAX_SIM_COSINE に設定します。これは埋め込みリストにのみ適用されます。

- **MAX_SIM_IP** ('MAX_SIM_IP')

    メトリックタイプを MAX_SIM_IP に設定します。これは埋め込みリストにのみ適用されます。

- **MAX_SIM_L2** ('MAX_SIM_L2')

    メトリックタイプを MAX_SIM_L2 に設定します。これは埋め込みリストにのみ適用されます。

- **DTW_COSINE** ('DTW_COSINE')

    メトリックタイプを DTW_COSINE に設定します。これは埋め込みリストにのみ適用されます。

- **DTW_IP** ('DTW_IP')

    メトリックタイプを DTW_IP に設定します。これは埋め込みリストにのみ適用されます。

## 例\{#example}

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
