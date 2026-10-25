---
title: "createRole() | Node.js"
slug: /node/node/Authentication-createRole
sidebar_label: "createRole()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、Milvus サーバーに新しいロールを作成します。 | Node.js"
type: docx
token: TR8xdMnzEo85sLxAtizcJWZdn6b
sidebar_position: 6
keywords: 
  - Milvus とは
  - milvus データベース
  - milvus lite
  - milvus ベンチマーク
  - zilliz
  - zilliz cloud
  - cloud
  - createRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# createRole()

この操作は、Milvus サーバーに新しいロールを作成します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.createRole({ roleName, description?, timeout? })
```

**PARAMETERS:**

- **roleName** (*string*) -

    新しいロールの名前です。

- **description** (*string*) -

    新しいロールの説明です。任意で指定できます。

- **timeout** (*number*) -

    RPC の実行に許容する時間をミリ秒単位で指定します。任意で指定できます。undefined に設定すると、サーバーが応答するかエラーが発生するまで、クライアントは待機し続けます。デフォルトは undefined です。

**RETURN TYPE:**

*ResStatus*

**RETURNS:**

レスポンスステータスは `{error_code, reason}` です。

**PARAMETERS:**

- **error_code** (*number*) -

    エラーコード番号です。0 は成功を意味します。

- **reason** (*string*) -

    該当する場合は、エラーの原因です。

**EXCEPTIONS:**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
await milvusClient.createRole({
  roleName: 'exampleRole',
});
```
