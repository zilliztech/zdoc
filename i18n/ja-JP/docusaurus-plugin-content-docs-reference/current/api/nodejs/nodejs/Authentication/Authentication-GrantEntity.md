---
title: "GrantEntity | Node.js"
slug: /node/node/Authentication-GrantEntity
sidebar_label: "GrantEntity"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "オブジェクト、権限、ロール、付与者を含む 1 つの権限付与について説明します。 | Node.js"
type: origin
token: shared-Authentication-GrantEntity
keywords: 
  - 権限付与エンティティ
  - 権限
  - 付与
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# GrantEntity

1 つの権限付与について説明します。どのオブジェクトのどの権限が、どのロールに、誰によって付与されたかを示します。

```typescript
export type GrantEntity = {
  role: RoleEntity;
  object: ObjectEntity;
  object_name: string;
  grantor: Grantor;
  db_name: string;
};
```

**フィールド:**

- **role** (**[RoleEntity](./Authentication-RoleEntity)**) -

    権限の付与先となるロールです。[RoleEntity](./Authentication-RoleEntity) を参照してください。

- **object** (*ObjectEntity*) -

    保護対象のオブジェクト型です。

    - **name** (*RbacObjects*) -

        オブジェクト型です（`RbacObjects` の値。例: `Collection`、`Global`、`User`）。

- **object_name** (*string*) -

    権限の適用対象となるオブジェクトの名前です。

- **grantor** (*Grantor*) -

    権限を付与した主体です。

    - **user** (**[User](./Authentication-User)**) -

        付与者です。[User](./Authentication-User) を参照してください。

    - **privilege** (**[PrivilegeEntity](./Authentication-PrivilegeEntity)**) -

        付与された権限です。[PrivilegeEntity](./Authentication-PrivilegeEntity) を参照してください。

- **db_name** (*string*) -

    オブジェクトが属するデータベースです。

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

console.log(res.entities); // GrantEntity[]
```
