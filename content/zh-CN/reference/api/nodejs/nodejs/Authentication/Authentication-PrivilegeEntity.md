---
title: "PrivilegeEntity | Node.js"
slug: /node/node/Authentication-PrivilegeEntity
sidebar_label: "PrivilegeEntity"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "描述一个按名称指定的权限。 | Node.js"
type: origin
token: shared-Authentication-PrivilegeEntity
keywords: 
  - 权限 Entity
  - 权限
  - zilliz
  - zilliz cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# PrivilegeEntity

描述一个按名称指定的权限。

```typescript
export type PrivilegeEntity = { name: PrivilegesTypes };
```

**字段：**

- **name** （*string*） -

    权限名称（一个 `PrivilegesTypes` 值，例如 `Insert`、`Query`）。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.listPrivilegeGroups();

console.log(res.privilege_groups[0]?.privileges); // PrivilegeEntity[]
```
