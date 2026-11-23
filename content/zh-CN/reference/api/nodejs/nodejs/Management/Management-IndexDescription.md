---
title: "IndexDescription | Node.js"
slug: /node/node/Management-IndexDescription
sidebar_label: "IndexDescription"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "描述 Collection 上的一个索引，由索引描述操作返回。 | Node.js"
type: origin
token: shared-Management-IndexDescription
keywords: 
  - 索引说明
  - 索引
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# IndexDescription

描述 Collection 上的一个索引，由索引描述操作返回。

```typescript
export interface IndexDescription {
  index_name: string;
  indexID: number;
  params: KeyValuePair[];
  field_name: string;
  indexed_rows: string;
  total_rows: string;
  state: string;
  index_state_fail_reason: string;
  pending_index_rows: string;
}
```

**字段：**

- **index_name**（*string*）-

    索引名称。

- **indexID**（*number*）-

    索引 ID。

- **params**（*KeyValuePair[]*）-

    以键值对形式表示的索引参数。

- **field_name**（*string*）-

    构建该索引所基于的字段。

- **indexed_rows**（*string*）-

    到目前为止已建立索引的行数。

- **total_rows**（*string*）-

    要建立索引的总行数。

- **state**（*string*）-

    索引的构建状态。

- **index_state_fail_reason**（*string*）-

    索引构建失败时的失败原因。

- **pending_index_rows**（*string*）-

    待建立索引的行数。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.describeIndex({
    collection_name: 'my_collection',
});

console.log(res.index_descriptions); // IndexDescription[]
```

