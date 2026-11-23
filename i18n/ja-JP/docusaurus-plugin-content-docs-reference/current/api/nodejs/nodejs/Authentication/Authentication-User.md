---
title: "User | Node.js"
slug: /node/node/Authentication-User
sidebar_label: "User"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ユーザーを名前で表します。 | Node.js"
type: origin
token: shared-Authentication-User
keywords: 
  - ユーザー
  - ユーザー
  - zilliz
  - zilliz cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# User

ユーザーを名前で表します。これは `milvus/types/User.ts` のプレーンデータ型です。gRPC の `User` リソースクライアントと混同しないでください。

```typescript
export type User = { name: string };
```

**フィールド:**

- **name** (*string*) -

    ユーザー名です。

## 例\{#example}

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
