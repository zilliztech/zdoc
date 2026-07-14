---
title: "createRole() | Node.js"
slug: /node/node/Authentication-createRole
sidebar_label: "createRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はカスタムロールを作成します。 | Node.js"
type: docx
token: SDoYdccLWo1W3PxkNFncibwDnch
sidebar_position: 6
keywords: 
  - milvus とは
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - createRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createRole()

この操作はカスタムロールを作成します。

```javascript
await milvusClient.createRole(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.createRole({
   roleName: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **roleName** (*string*) -

    **[REQUIRED]**

    作成するロールの名前。

- **timeout** (*number*) -

    この操作のタイムアウト期間。 

    これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
await milvusClient.createRole({
   roleName: 'exampleRole',
 })
```

