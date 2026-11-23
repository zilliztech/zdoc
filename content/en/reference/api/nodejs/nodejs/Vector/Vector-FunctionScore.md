---
title: "FunctionScore | Node.js"
slug: /node/node/Vector-FunctionScore
sidebar_label: "FunctionScore"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Describes a function-score reranking configuration for search. | Node.js"
type: origin
token: shared-Vector-FunctionScore
keywords: 
  - function score
  - rerank
  - search
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# FunctionScore

Describes a function-score reranking configuration for search.

```typescript
export interface FunctionScore {
  functions: FunctionObject[];
  params: keyValueObj;
}

```

**FIELDS:**

- **functions** (*FunctionObject[]*) -

    The functions applied to the search results. See [FunctionObject](./Collections-FunctionObject).

- **params** (*keyValueObj*) -

    Extra parameters for the function-score reranking.

## Example\{#example}

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

