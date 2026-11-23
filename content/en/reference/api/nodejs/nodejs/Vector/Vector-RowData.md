---
title: "RowData | Node.js"
slug: /node/node/Vector-RowData
sidebar_label: "RowData"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "One data row for insert or upsert, keyed by field name. | Node.js"
type: origin
token: shared-Vector-RowData
keywords: 
  - row data
  - insert
  - upsert
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RowData

One data row for insert or upsert: a record keyed by field name.

```typescript
export interface RowData {
  [x: string]: FieldData;
}
```

**FIELDS:**

- **[field: string]** (*FieldData*) -

    The field value, keyed by the field name.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.insert({
    collection_name: 'my_collection',
    data: [
        { id: 1, vector: [0.1, 0.2, 0.3, 0.4], text: 'Hello' },
        { id: 2, vector: [0.5, 0.6, 0.7, 0.8], text: 'World' },
    ],
});
```

