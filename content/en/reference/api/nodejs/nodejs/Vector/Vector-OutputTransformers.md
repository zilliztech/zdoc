---
title: "OutputTransformers | Node.js"
slug: /node/node/Vector-OutputTransformers
sidebar_label: "OutputTransformers"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Describes the per-datatype transformer functions applied to search results before they are returned. | Node.js"
type: origin
token: shared-Vector-OutputTransformers
keywords: 
  - output transformer
  - transformer
  - search
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# OutputTransformers

Describes the per-datatype transformer functions applied to search results before they are returned.

```typescript
export type OutputTransformers = {
  [DataType.BFloat16Vector]?: (bf16bytes: Uint8Array) => BFloat16Vector;
  [DataType.Float16Vector]?: (f16: Uint8Array) => Float16Vector;
  [DataType.SparseFloatVector]?: (sparse: SparseVectorDic) => SparseFloatVector;
  [DataType.Int8Vector]?: (int8Vector: Int8Array) => Int8Vector;
};
```

**FIELDS:**

- **[DataType.BFloat16Vector]** (*(bf16bytes: Uint8Array) => BFloat16Vector*) -

    Transforms BFloat16 vector bytes.

- **[DataType.Float16Vector]** (*(f16: Uint8Array) => Float16Vector*) -

    Transforms Float16 vector bytes.

- **[DataType.SparseFloatVector]** (*(sparse: SparseVectorDic) => SparseFloatVector*) -

    Transforms sparse vector dictionaries.

- **[DataType.Int8Vector]** (*(int8Vector: Int8Array) => Int8Vector*) -

    Transforms Int8 vector arrays.

## Example\{#example}

```javascript
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.search({
    collection_name: 'my_collection',
    vector: [0.1, 0.2, 0.3, 0.4],
    limit: 5,
    transformers: {
        [DataType.Float16Vector]: bytes => new Float32Array(bytes),
    },
});
```

