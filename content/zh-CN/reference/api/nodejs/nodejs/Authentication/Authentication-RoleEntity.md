---
title: "RoleEntity | Node.js"
slug: /node/node/Authentication-RoleEntity
sidebar_label: "RoleEntity"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "描述角色，包括角色名称和可选描述。 | Node.js"
type: origin
token: shared-Authentication-RoleEntity
keywords: 
  - 角色 Entity
  - 角色
  - Zilliz
  - 云
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RoleEntity

描述角色：其名称和可选描述。

```typescript
export type RoleEntity = { name: string; description?: string };
```

**字段：**

- **name** （*string*） -

    角色名称。

- **description** （*string*） -

    角色的可选描述。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.listGrants({
    roleName: 'exampleRole',
});

console.log(res.entities.map(entity => entity.role)); // RoleEntity[]
```
