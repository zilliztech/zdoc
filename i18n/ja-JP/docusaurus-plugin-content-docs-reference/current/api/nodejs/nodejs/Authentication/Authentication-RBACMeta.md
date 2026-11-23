---
title: "RBACMeta | Node.js"
slug: /node/node/Authentication-RBACMeta
sidebar_label: "RBACMeta"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "特権のバックアップおよび復元操作で扱われる RBAC 状態全体について説明します。 | Node.js"
type: origin
token: shared-Authentication-RBACMeta
keywords: 
  - RBAC メタデータ
  - RBAC
  - バックアップ
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RBACMeta

特権のバックアップおよび復元操作で扱われる RBAC 状態全体について説明します。

```typescript
export type RBACMeta = {
  users: User[];
  roles: RoleEntity[];
  grants: GrantEntity[];
  privilege_groups: PrivelegeGroup[];
};
```

**フィールド:**

- **users** (**[User](./Authentication-User)[]**) -

    すべてのユーザーです。[User](./Authentication-User) を参照してください。

- **roles** (**[RoleEntity](./Authentication-RoleEntity)[]**) -

    すべてのロールです。[RoleEntity](./Authentication-RoleEntity) を参照してください。

- **grants** (**[GrantEntity](./Authentication-GrantEntity)[]**) -

    すべての権限付与です。[GrantEntity](./Authentication-GrantEntity) を参照してください。

- **privilege_groups** (**[PrivelegeGroup](./Authentication-PrivelegeGroup)[]**) -

    すべての権限グループです。[PrivelegeGroup](./Authentication-PrivelegeGroup) を参照してください。

## 例\{#example}

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
