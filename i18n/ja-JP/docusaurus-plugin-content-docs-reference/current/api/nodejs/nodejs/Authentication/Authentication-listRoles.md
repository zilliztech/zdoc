---
title: "listRoles() | Node.js"
slug: /node/node/Authentication-listRoles
sidebar_label: "listRoles()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はすべてのカスタムロールを一覧表示します。 | Node.js"
type: docx
token: GIeMdvjlMoLwGrxUOu3cFw7bnWc
sidebar_position: 20
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - listRoles()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listRoles()

この操作はすべてのカスタムロールを一覧表示します。

```javascript
await milvusClient.listRoles(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.listRoles(
    includeUserInfo?: boolean,
    timeout?: number
)
```

**パラメータ:**

- **includeUserInfo** (*boolean*) -

    ユーザー情報を含めるかどうかを示すブール値です。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、いずれかの応答が到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;SelectRoleResponse&gt;*

このメソッドは、**SelectRoleResponse** オブジェクトに解決される promise を返します。

```typescript
{
    results: RoleResult[],
    status:  ResStatus
}
```

**パラメータ:**

- **results** (*RoleResult[]*) -<br/>
  現在の Milvus インスタンスで定義されている各ロールに対して 1 つずつの **RoleResult** オブジェクトのリストです。**RoleResult** の完全なフィールド参照については、`describeRole()` のドキュメントを参照してください。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java

```

