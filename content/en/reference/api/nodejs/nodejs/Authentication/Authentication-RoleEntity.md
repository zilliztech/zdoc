---
title: "RoleEntity | Node.js"
slug: /node/node/Authentication-RoleEntity
sidebar_label: "RoleEntity"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Describes a role, including its name and optional description. | Node.js"
type: origin
token: shared-Authentication-RoleEntity
keywords: 
  - role entity
  - role
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RoleEntity

Describes a role: its name and optional description.

```typescript
export type RoleEntity = { name: string; description?: string };
```

**FIELDS:**

- **name** (*string*) -

    The role name.

- **description** (*string*) -

    Optional description of the role.

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

console.log(res.entities.map(entity => entity.role)); // RoleEntity[]
```

