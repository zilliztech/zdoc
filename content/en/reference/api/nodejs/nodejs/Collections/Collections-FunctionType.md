---
title: "FunctionType | Node.js"
slug: /node/node/Collections-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This is an enumeration that provides the following constants. | Node.js"
type: docx
token: Vq2VdsWJaoufsGx5stJcTuyPnDb
sidebar_position: 17
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionType
  - nodejs30
displayed_sidebar: nodeSidebar

---

# FunctionType

Defines the type of a schema function that transforms raw data into vectors.

```typescript
export enum FunctionType {
  Unknown = 0,
  BM25 = 1,
  TEXTEMBEDDING = 2,
  RERANK = 3,
  MINHASH = 4,
  MOLFINGERPRINT = 5,
}
```

**Constants:**

- **Unknown** (0)

    Sets the function type to **Unknown**.

- **BM25** (1)

    Sets the function type to **BM25**, a sparse-vector function based on the BM25 algorithm.

- **TEXTEMBEDDING** (2)

    Sets the function type to **TEXTEMBEDDING**, a text-embedding function that produces dense vectors.

- **RERANK** (3)

    Sets the function type to **RERANK**, a reranking function.

- **MINHASH** (4)

    Sets the function type to **MINHASH**, a MinHash function for similarity detection.

- **MOLFINGERPRINT** (5)

    Sets the function type to **MOLFINGERPRINT**, a molecule-fingerprint function.

## Example\{#example}

```javascript
import { MilvusClient, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

await milvusClient.createCollection({
    collection_name: 'my_collection',
    functions: [
        {
            name: 'bm25_fn',
            type: FunctionType.BM25,
            input_field_names: ['text'],
            output_field_names: ['sparse_vector'],
            params: {},
        },
    ],
});
```

