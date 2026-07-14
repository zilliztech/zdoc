---
title: "revokeRole() | Node.js"
slug: /node/node/Authentication-revokeRole
sidebar_label: "revokeRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ユーザーに割り当てられたロールを取り消します。 | Node.js"
type: docx
token: W7XJdZDHnoFECDxCYoMcrZqrnnd
sidebar_position: 27
keywords: 
  - ベクトルデータベース チュートリアル
  - ベクトルデータベースの仕組み
  - ベクトル db 比較
  - openai vector db
  - zilliz
  - zilliz cloud
  - cloud
  - revokeRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# revokeRole()

この操作は、ユーザーに割り当てられたロールを取り消します。

```javascript
await milvusClient.revokeRole(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.revokeRole({
   username: string,
   roleName: string，
   timeout?: number
 })
```

**パラメータ:**

- **username** (*str*) -

    **[必須]**

    既存のユーザー名。

- **roleName** (*str*) -

    **[必須]**

    取り消すロールの名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが到着した時点またはエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される Promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメータ:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
await milvusClient.removeUserFromRole({
   username: 'my',
   roleName: 'myrole'
 });
```

