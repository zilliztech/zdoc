---
title: "RBACMeta | Node.js"
slug: /node/node/Authentication-RBACMeta
sidebar_label: "RBACMeta"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "描述权限备份和恢复操作所携带的完整 RBAC 状态。 | Node.js"
type: origin
token: shared-Authentication-RBACMeta
keywords: 
  - RBAC 元数据
  - RBAC
  - 备份
  - Zilliz
  - Zilliz Cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RBACMeta

描述权限备份和恢复操作所携带的完整 RBAC 状态。

```typescript
export type RBACMeta = {
  users: User[];
  roles: RoleEntity[];
  grants: GrantEntity[];
  privilege_groups: PrivelegeGroup[];
};
```

**字段：**

- **users** (**[User](./Authentication-User)[]**) -

    所有用户。请参见 [User](./Authentication-User)。

- **roles** (**[RoleEntity](./Authentication-RoleEntity)[]**) -

    所有角色。请参见 [RoleEntity](./Authentication-RoleEntity)。

- **grants** (**[GrantEntity](./Authentication-GrantEntity)[]**) -

    所有权限授权。请参见 [GrantEntity](./Authentication-GrantEntity)。

- **privilege_groups** (**[PrivelegeGroup](./Authentication-PrivelegeGroup)[]**) -

    所有权限组。请参见 [PrivelegeGroup](./Authentication-PrivelegeGroup)。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.backupRBAC();

await milvusClient.restoreRBAC({
    RBAC_meta: res.RBAC_meta, // RBACMeta
});
```

