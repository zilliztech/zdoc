---
title: "createUser() | Node.js"
slug: /node/node/Authentication-createUser
sidebar_label: "createUser()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はユーザーを作成します。 | Node.js"
type: docx
token: JNZxdKEX3ohBl2xud7Wckhq7nVh
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

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createUser()

この操作はユーザーを作成します。

```javascript
await milvusClient.createUser(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.createUser({
   username: string,
   password: string,
   timeout?: number
 })
```

**パラメーター:**

- **username** (*string*) -

    **[必須]**

    作成するユーザーの名前。

- **password** (*string*) -

    **[必須]**

    作成するユーザーのパスワード。

- **timeout** (*number*)  -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、いずれかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

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

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す内容。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
await milvusClient.createUser({
   username: 'exampleUser',
   password: 'examplePassword',
 })
```

