---
title: "PrivelegeGroup | Node.js"
slug: /node/node/Authentication-PrivelegeGroup
sidebar_label: "PrivelegeGroup"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "描述一组已命名的权限。 | Node.js"
type: origin
token: shared-Authentication-PrivelegeGroup
keywords: 
  - 权限组
  - 权限
  - Zilliz
  - Zilliz Cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# PrivelegeGroup

描述权限组：一组已命名的权限。（类型名在 SDK 源码中按原样拼写。）

```typescript
export type PrivelegeGroup = {
  group_name: string; // name
  privileges: PrivilegeEntity[]; // privileges
};
```

**字段：**

- **group_name**（*string*） -

    权限组名称。

- **privileges**（**[PrivilegeEntity](./Authentication-PrivilegeEntity)[]**） -

    组中包含的权限。请参见 [PrivilegeEntity](./Authentication-PrivilegeEntity)。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.listPrivilegeGroups();

console.log(res.privilege_groups); // PrivelegeGroup[]
```

