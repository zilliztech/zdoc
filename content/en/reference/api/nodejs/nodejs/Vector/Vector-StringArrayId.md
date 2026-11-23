---
title: "StringArrayId | Node.js"
slug: /node/node/Vector-StringArrayId
sidebar_label: "StringArrayId"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A primary-key ID list given as strings. | Node.js"
type: origin
token: shared-Vector-StringArrayId
keywords: 
  - string array id
  - primary key
  - id list
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# StringArrayId

A primary-key ID list given as strings.

```typescript
export interface StringArrayId {
  str_id: StringArray;
}
```

**FIELDS:**

- **str_id** (*StringArray*) -

    The string primary key values.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.insert({
    collection_name: 'my_collection',
    data: [{ id: 'a1', vector: [0.1, 0.2, 0.3, 0.4] }],
});

console.log(res.IDs); // StringArrayId, e.g. { str_id: { data: ['a1'] } }
```

