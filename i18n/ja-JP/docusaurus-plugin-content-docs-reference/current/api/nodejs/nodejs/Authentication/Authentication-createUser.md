---
title: "createUser() | Node.js"
slug: /node/node/Authentication-createUser
sidebar_label: "createUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、Milvus サーバーの新しいユーザーアカウントを作成します。 | Node.js"
type: docx
token: MtHHdvQ36oZcM8xEDpwcCUBynmb
sidebar_position: 7
keywords: 
  - 自然言語処理
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - cloud
  - createUser()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# createUser()

この操作は、Milvus サーバーの新しいユーザーアカウントを作成します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.createUser({ username, password, description?, timeout? })
```

**パラメーター:**

- **username** (*string*) -

    新しいユーザーのユーザー名です。

- **password** (*string*) -

    新しいユーザーのパスワードです。

- **description** (*string*) -

    新しいユーザーの説明です（任意）。

- **timeout** (*number*) -

    RPC に許可する時間をミリ秒単位で指定します（任意）。undefined に設定すると、サーバーが応答するかエラーが発生するまで、クライアントは待機し続けます。デフォルトは undefined です。

**戻り値の型:**

*ResStatus*

**戻り値:**

レスポンスステータス：`{error_code, reason}`。

**パラメーター:**

- **error_code** (*number*) -

    エラーコード番号です。0 は成功を意味します。

- **reason** (*string*) -

    エラーの原因です（存在する場合）。

**例外:**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
await milvusClient.createUser({
  username: 'exampleUser',
  password: 'examplePassword',
});
```
