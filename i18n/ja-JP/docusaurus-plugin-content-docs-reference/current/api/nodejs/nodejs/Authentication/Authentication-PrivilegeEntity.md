---
title: "PrivilegeEntity | Node.js"
slug: /node/node/Authentication-PrivilegeEntity
sidebar_label: "PrivilegeEntity"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "1 つの特権を名前で表します。 | Node.js"
type: origin
token: shared-Authentication-PrivilegeEntity
keywords: 
  - 特権エンティティ
  - 特権
  - zilliz
  - zilliz cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# PrivilegeEntity

1 つの特権を名前で表します。

```typescript
export type PrivilegeEntity = { name: PrivilegesTypes };
```

**フィールド:**

- **name** (*string*) -

    特権名です（`PrivilegesTypes` の値。例: `Insert`、`Query`）。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.listPrivilegeGroups();

console.log(res.privilege_groups[0]?.privileges); // PrivilegeEntity[]
```
