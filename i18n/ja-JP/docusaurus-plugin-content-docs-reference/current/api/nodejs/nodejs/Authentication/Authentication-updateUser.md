---
title: "updateUser() | Node.js"
slug: /node/node/Authentication-updateUser
sidebar_label: "updateUser()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のユーザーのパスワードを更新します。 | Node.js"
type: docx
token: BCGKdCttdotF32xUJTec8UFlndg
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

この操作は、特定のユーザーのパスワードを更新します。

```javascript
await milvusClient.updateUser(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.updateUser({
   username: string,
   newPassword: string,
   oldPassword: string,
   timeout?: number
 })
```

**パラメーター:**

- **username** (*str*) -

    **[REQUIRED]**

    既存ユーザーの名前。

- **oldPassword** (*str*) -

    **[REQUIRED]**

    ユーザーの元のパスワード。

- **newPassword** (*str*) -

    **[REQUIRED]**

    ユーザーの新しいパスワード。

- **timeout** (*number*) -  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着した時点、またはエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメーター:**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
await milvusClient.updateUser({
   username: 'exampleUser',
   newPassword: 'newPassword',
   oldPassword: 'oldPassword',
 })
```

