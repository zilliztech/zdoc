---
title: "GrantEntity | Node.js"
slug: /node/node/Authentication-GrantEntity
sidebar_label: "GrantEntity"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "描述一次权限授予，包括其对象、权限、角色和授权者。 | Node.js"
type: origin
token: shared-Authentication-GrantEntity
keywords: 
  - 授权 Entity
  - 权限
  - 授权
  - zilliz
  - zilliz cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# GrantEntity

描述一次权限授予：将哪个对象上的哪个权限授予哪个角色，以及由谁授予。

```typescript
export type GrantEntity = {
  role: RoleEntity;
  object: ObjectEntity;
  object_name: string;
  grantor: Grantor;
  db_name: string;
};
```

**字段：**

- **role** （**[RoleEntity](./Authentication-RoleEntity)**） -

    授予该权限的角色。请参见 [RoleEntity](./Authentication-RoleEntity)。

- **object** （*ObjectEntity*） -

    受保护的对象类型。

    - **name** （*RbacObjects*） -

        对象类型（一个 `RbacObjects` 值，例如 `Collection`、`Global` 和 `User`）。

- **object_name** （*string*） -

    权限适用的对象名称。

- **grantor** （*Grantor*） -

    授予该权限的主体。

    - **user** （**[User](./Authentication-User)**） -

        授权者。请参见 [User](./Authentication-User)。

    - **privilege** （**[PrivilegeEntity](./Authentication-PrivilegeEntity)**） -

        已授予的权限。请参见 [PrivilegeEntity](./Authentication-PrivilegeEntity)。

- **db_name** （*string*） -

    该对象所属的 Database。

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

console.log(res.entities); // GrantEntity[]
```
