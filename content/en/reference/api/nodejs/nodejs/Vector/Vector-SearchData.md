---
title: "SearchData | Node.js"
slug: /node/node/Vector-SearchData
sidebar_label: "SearchData"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A search target entry in one of the supported search input forms. | Node.js"
type: origin
token: shared-Vector-SearchData
keywords: 
  - search data
  - search
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# SearchData

A search target entry: one of the supported search input forms.

```typescript
export type SearchData = SearchVector | SearchText | SearchEmbList;

```

**FIELDS:**

- **SearchVector**

    Vector inputs.

- **SearchText**

    Text inputs for full-text / embedding search.

- **SearchEmbList**

    Embedding-list inputs.

## Example\{#example}

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

