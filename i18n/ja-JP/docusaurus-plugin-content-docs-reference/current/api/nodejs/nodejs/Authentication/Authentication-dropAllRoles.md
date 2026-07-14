---
title: "dropAllRoles() | Node.js"
slug: /node/node/Authentication-dropAllRoles
sidebar_label: "dropAllRoles()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Milvus 内のすべてのロールを削除します。 | Node.js"
type: docx
token: E5rYdw3EWo2WKZxEyGac049an3e
sidebar_position: 11
keywords: 
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似性検索
  - マルチモーダルRAG
  - zilliz
  - zilliz cloud
  - cloud
  - dropAllRoles()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropAllRoles()

この操作は、Milvus 内のすべてのロールを削除します。

```javascript
await milvusClient.dropAllRoles(data?)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.dropAllRoles({
   timeout?: number
})
```

**パラメーター:**

- **timeout** (*number*) -  

    この操作のタイムアウト期間。 

    これを **None** に設定すると、レスポンスが到着した時点、またはエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise\<ResStatus[]>*

このメソッドは Promise のリストを返し、それぞれが **ResStatus** オブジェクトに解決されます。

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

    報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
milvusClient.dropAllRoles()
```

