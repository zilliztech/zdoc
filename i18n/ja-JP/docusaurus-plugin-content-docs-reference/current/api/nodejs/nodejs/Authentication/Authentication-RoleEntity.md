---
title: "RoleEntity | Node.js"
slug: /node/node/Authentication-RoleEntity
sidebar_label: "RoleEntity"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "名前と省略可能な説明を含むロールについて説明します。 | Node.js"
type: origin
token: shared-Authentication-RoleEntity
keywords: 
  - ロールエンティティ
  - ロール
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RoleEntity

ロールについて、その名前と省略可能な説明を記述します。

```typescript
export type RoleEntity = { name: string; description?: string };
```

**フィールド:**

- **name** (*string*) -

    ロールの名前です。

- **description** (*string*) -

    ロールの省略可能な説明です。

## 例\{#example}

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
