---
title: "User | Node.js"
slug: /node/node/Authentication-User
sidebar_label: "User"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "按名称描述用户。 | Node.js"
type: origin
token: shared-Authentication-User
keywords: 
  - 用户
  - 用户
  - Zilliz
  - Zilliz Cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# User

按名称描述用户。这是来自 `milvus/types/User.ts` 的普通数据类型，不要与 gRPC `User` 资源客户端混淆。

```typescript
export type User = { name: string };
```

**字段：**

- **name** （*string*） -

    用户名。

## 示例\{#example}

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
