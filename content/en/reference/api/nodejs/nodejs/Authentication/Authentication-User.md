---
title: "User | Node.js"
slug: /node/node/Authentication-User
sidebar_label: "User"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Describes a user by name. | Node.js"
type: origin
token: shared-Authentication-User
keywords: 
  - user
  - users
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# User

Describes a user by name. This is the plain data type from `milvus/types/User.ts` — not to be confused with the gRPC `User` resource client.

```typescript
export type User = { name: string };
```

**FIELDS:**

- **name** (*string*) -

    The user name.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.describeUser({
    username: 'root',
});

console.log(res.results[0]?.user); // User
```

