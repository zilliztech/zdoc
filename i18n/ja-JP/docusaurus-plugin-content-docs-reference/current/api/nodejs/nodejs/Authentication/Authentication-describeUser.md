---
title: "describeUser() | Node.js"
slug: /node/node/Authentication-describeUser
sidebar_label: "describeUser()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "これはメソッドテンプレートです。 | Node.js"
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

これはメソッドテンプレートです。

```javascript
await milvusClient.describeUser(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.describeUser({
    includeRoleInfo?: boolean,
    timeout?: number,
    username: string
})
```

**PARAMETERS:**

- **username** (*string*) -

    **[REQUIRED]**

    説明するユーザーの名前。

- **includeRoleInfo** (*boolean*) -

    ロール情報を含めるかどうかを示すブール値。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;SelectUserResponse&gt;*

このメソッドは、**SelectUserResponse** オブジェクトに解決される promise を返します。

```typescript
{
    results: UserResult[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **results** (*UserResult[]*) -
**UserResult** オブジェクトのリスト。`describeUser()` では、このリストには要求されたユーザーを説明する単一のエントリが含まれます。

    - **user** (*User*) -

        ユーザーを識別する **User** オブジェクト。

        - **name** (*string*) -

        ユーザー名。

        - **name** (*string*) -

            ユーザー名。

    - **roles** (*RoleEntity[]*) -

        このユーザーに割り当てられたロールのリスト。

        - **name** (*string*) -

        ロール名。

        - **name** (*string*) -

            ロール名。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
milvusClient.describeUser({username: 'name'})
```

