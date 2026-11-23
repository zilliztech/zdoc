---
title: "RBACMeta | Node.js"
slug: /node/node/Authentication-RBACMeta
sidebar_label: "RBACMeta"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Describes the full RBAC state carried by privilege backup and restore operations. | Node.js"
type: origin
token: shared-Authentication-RBACMeta
keywords: 
  - rbac meta
  - rbac
  - backup
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RBACMeta

Describes the full RBAC state carried by privilege backup and restore operations.

```typescript
export type RBACMeta = {
  users: User[];
  roles: RoleEntity[];
  grants: GrantEntity[];
  privilege_groups: PrivelegeGroup[];
};
```

**FIELDS:**

- **users** (**[User](./Authentication-User)[]**) -

    All users. See [User](./Authentication-User).

- **roles** (**[RoleEntity](./Authentication-RoleEntity)[]**) -

    All roles. See [RoleEntity](./Authentication-RoleEntity).

- **grants** (**[GrantEntity](./Authentication-GrantEntity)[]**) -

    All privilege grants. See [GrantEntity](./Authentication-GrantEntity).

- **privilege_groups** (**[PrivelegeGroup](./Authentication-PrivelegeGroup)[]**) -

    All privilege groups. See [PrivelegeGroup](./Authentication-PrivelegeGroup).

## Example\{#example}

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

