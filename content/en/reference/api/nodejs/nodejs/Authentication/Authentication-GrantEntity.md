---
title: "GrantEntity | Node.js"
slug: /node/node/Authentication-GrantEntity
sidebar_label: "GrantEntity"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Describes one privilege grant with its object, privilege, role, and grantor. | Node.js"
type: origin
token: shared-Authentication-GrantEntity
keywords: 
  - grant entity
  - privilege
  - grant
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# GrantEntity

Describes one privilege grant: which privilege on which object is granted to which role, and by whom.

```typescript
export type GrantEntity = {
  role: RoleEntity;
  object: ObjectEntity;
  object_name: string;
  grantor: Grantor;
  db_name: string;
};
```

**FIELDS:**

- **role** (**[RoleEntity](./Authentication-RoleEntity)**) -

    The role the privilege is granted to. See [RoleEntity](./Authentication-RoleEntity).

- **object** (*ObjectEntity*) -

    The protected object type.

    - **name** (*RbacObjects*) -

        The object type (an `RbacObjects` value, e.g. `Collection`, `Global`, `User`).

- **object_name** (*string*) -

    The name of the object the privilege applies to.

- **grantor** (*Grantor*) -

    Who granted the privilege.

    - **user** (**[User](./Authentication-User)**) -

        The grantor. See [User](./Authentication-User).

    - **privilege** (**[PrivilegeEntity](./Authentication-PrivilegeEntity)**) -

        The granted privilege. See [PrivilegeEntity](./Authentication-PrivilegeEntity).

- **db_name** (*string*) -

    The database the object belongs to.

## Example\{#example}

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
