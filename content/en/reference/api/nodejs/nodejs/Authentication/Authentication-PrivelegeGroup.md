---
title: "PrivelegeGroup | Node.js"
slug: /node/node/Authentication-PrivelegeGroup
sidebar_label: "PrivelegeGroup"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Describes a named set of privileges. | Node.js"
type: origin
token: shared-Authentication-PrivelegeGroup
keywords: 
  - privilege group
  - privileges
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# PrivelegeGroup

Describes a privilege group: a named set of privileges. (The type name is spelled as-is in the SDK source.)

```typescript
export type PrivelegeGroup = {
  group_name: string; // name
  privileges: PrivilegeEntity[]; // privileges
};
```

**FIELDS:**

- **group_name** (*string*) -

    The privilege group name.

- **privileges** (**[PrivilegeEntity](./Authentication-PrivilegeEntity)[]**) -

    The privileges contained in the group. See [PrivilegeEntity](./Authentication-PrivilegeEntity).

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.listPrivilegeGroups();

console.log(res.privilege_groups); // PrivelegeGroup[]
```

