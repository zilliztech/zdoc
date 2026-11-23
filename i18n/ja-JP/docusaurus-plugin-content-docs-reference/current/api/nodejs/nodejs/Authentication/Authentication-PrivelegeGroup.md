---
title: "PrivelegeGroup | Node.js"
slug: /node/node/Authentication-PrivelegeGroup
sidebar_label: "PrivelegeGroup"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "名前付きの特権セットについて説明します。 | Node.js"
type: origin
token: shared-Authentication-PrivelegeGroup
keywords: 
  - 特権グループ
  - 特権
  - zilliz
  - zilliz cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# PrivelegeGroup

特権グループ（名前付きの特権セット）について説明します。（この型名は、SDK のソースコードに記載されているとおりの綴りです。）

```typescript
export type PrivelegeGroup = {
  group_name: string; // name
  privileges: PrivilegeEntity[]; // privileges
};
```

**フィールド:**

- **group_name**（*string*） -

    特権グループの名前です。

- **privileges**（**[PrivilegeEntity](./Authentication-PrivilegeEntity)[]**） -

    グループに含まれる特権です。詳細については、[PrivilegeEntity](./Authentication-PrivilegeEntity) を参照してください。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.listPrivilegeGroups();

console.log(res.privilege_groups); // PrivelegeGroup[]
```

