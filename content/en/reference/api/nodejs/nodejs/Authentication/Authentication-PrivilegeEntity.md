---
title: "PrivilegeEntity | Node.js"
slug: /node/node/Authentication-PrivilegeEntity
sidebar_label: "PrivilegeEntity"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Describes one privilege by name. | Node.js"
type: origin
token: shared-Authentication-PrivilegeEntity
keywords: 
  - privilege entity
  - privilege
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# PrivilegeEntity

Describes one privilege by name.

```typescript
export type PrivilegeEntity = { name: PrivilegesTypes };
```

**FIELDS:**

- **name** (*string*) -

    The privilege name (a `PrivilegesTypes` value, e.g. `Insert`, `Query`).

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.listPrivilegeGroups();

console.log(res.privilege_groups[0]?.privileges); // PrivilegeEntity[]
```

