---
title: "updateUser() | Node.js"
slug: /node/node/Authentication-updateUser
sidebar_label: "updateUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ユーザーアカウントのパスワード、説明、またはその両方を更新します。 | Node.js"
type: docx
token: L4tGd5KqLoLtp2xQRyhcaXjsnL5
sidebar_position: 28
keywords: 
  - 情報検索
  - 次元削減
  - hnsw algorithm
  - ベクトル類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - updateUser()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# updateUser()

この操作は、ユーザーアカウントのパスワード、説明、またはその両方を更新します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.updateUser({ username, newPassword?, oldPassword?, description?, timeout? })
```

**パラメーター:**

- **username** (*string*) -

    更新するユーザーのユーザー名です。

- **newPassword** (*string*) -

    ユーザーの新しいパスワードです。パスワードを更新する場合にのみ必要です。

- **oldPassword** (*string*) -

    ユーザーの旧パスワードです。パスワードの更新を要求する場合に必要です。

- **description** (*string*) -

    ユーザーの新しい説明です。

- **timeout** (*number*) -

    RPC に許可する時間をミリ秒単位で指定する任意の値です。undefined に設定すると、サーバーが応答するかエラーが発生するまで、クライアントは待機し続けます。デフォルト値は undefined です。

**戻り値の型:**

*ResStatus*

**戻り値:**

レスポンスステータスは `{error_code, reason}` です。

**パラメーター:**

- **error_code** (*number*) -

    エラーコード番号です。0 は成功を意味します。

- **reason** (*string*) -

    エラーが発生した場合、その原因です。

**例外:**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
await milvusClient.updateUser({
  username: 'exampleUser',
  description: 'new description',
});
```
