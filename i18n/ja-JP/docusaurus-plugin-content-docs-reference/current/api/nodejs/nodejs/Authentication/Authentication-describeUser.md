---
title: "describeUser() | Node.js"
slug: /node/node/Authentication-describeUser
sidebar_label: "describeUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "これはメソッドのテンプレートです。 | Node.js"
type: docx
token: Da9KdvvWroKX9cxOwsmcLRBxnVb
sidebar_position: 10
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - describeUser()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeUser()

これはメソッドのテンプレートです。

```javascript
await milvusClient.describeUser(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.describeUser({
    includeRoleInfo?: boolean,
    timeout?: number,
    username: string
})
```

**パラメータ:**

- **username** (*string*) -

    **[必須]**

    説明対象のユーザー名。

- **includeRoleInfo** (*boolean*) -

    ロール情報を含めるかどうかを示すブール値です。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、レスポンスが到着した時点、またはエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;SelectUserResponse&gt;*

このメソッドは、**SelectUserResponse** オブジェクトに解決される promise を返します。

```typescript
{
    results: UserResult[],
    status:  ResStatus
}
```

**パラメータ:**

- **results** (*UserResult[]*) -<br/>
  **UserResult** オブジェクトのリストです。`describeUser()` の場合、このリストには要求されたユーザーを説明する単一のエントリが含まれます。

    - **user** (*User*) -

        ユーザーを識別する **User** オブジェクトです。

        - **name** (*string*) -

        ユーザー名。

        - **name** (*string*) -

            ユーザー名。

    - **roles** (*RoleEntity[]*) -

        このユーザーに割り当てられているロールのリストです。

        - **name** (*string*) -

        ロール名。

        - **name** (*string*) -

            ロール名。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
milvusClient.describeUser({username: 'name'})
```

