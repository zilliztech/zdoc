---
title: "ConsistencyLevelEnum | Node.js"
slug: /node/node/Collections-ConsistencyLevelEnum
sidebar_label: "ConsistencyLevelEnum"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作说明目标 Collection 支持的一致性级别。 | Node.js"
type: origin
token: shared-Collections-ConsistencyLevelEnum
keywords: 
  - 一致性级别
  - 有界
  - 会话
  - 最终
  - Zilliz
  - Zilliz Cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# ConsistencyLevelEnum

定义应用于读取和查询的一致性保证。

```typescript
export enum ConsistencyLevelEnum {
  Strong = 0,
  Session = 1, // default in PyMilvus
  Bounded = 2,
  Eventually = 3,
  Customized = 4, // Users pass their own `guarantee_timestamp`. Deprecated
}
```

**常量：**

- **Strong** (0)

    最强保证：读取操作可以看到请求开始前已提交的所有数据。

- **Session** (1)

    通过每个会话的时间戳提供读己之写一致性（PyMilvus 中的默认值）。

- **Bounded** (2)

    读取操作可容忍有界时间窗口内的数据陈旧。

- **Eventually** (3)

    最弱保证：副本最终会收敛；延迟最低。

- **Customized** (4)

    调用方会传入自己的保证时间戳。已弃用。

## 示例\{#example}

```javascript
import { MilvusClient, ConsistencyLevelEnum, DataType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

await milvusClient.createCollection({
    collection_name: 'my_collection',
    consistency_level: ConsistencyLevelEnum.Strong,
    fields: [
        { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: true },
        { name: 'vector', data_type: DataType.FloatVector, type_params: { dim: 8 } },
    ],
});
```
