---
title: "dropRole() | Node.js"
slug: /node/node/Authentication-dropRole
sidebar_label: "dropRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はカスタムロールを削除します。 | Node.js"
type: docx
token: AnkUdEHXmob3Vwx9GIWcDOQanng
sidebar_position: 13
keywords: 
  - ベクトルストア
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - オープンソースベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - dropRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropRole()

この操作はカスタムロールを削除します。

```javascript
await milvusClient.dropRole(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.dropRole({
   roleName: string,
   timeout?: number
 })
```

**パラメータ:**

- **roleName** (*string*) -

    **[必須]**

    削除するロールの名前です。

- **timeout** (number)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、レスポンスが返されるかエラーが発生した時点で、この操作はタイムアウトします。

**戻り値** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメータ:**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
await milvusClient.dropRole({
   roleName: 'exampleRole',
 })
```

