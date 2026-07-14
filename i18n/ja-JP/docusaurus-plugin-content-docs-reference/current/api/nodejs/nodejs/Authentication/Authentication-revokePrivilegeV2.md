---
title: "revokePrivilegeV2() | Node.js"
slug: /node/node/Authentication-revokePrivilegeV2
sidebar_label: "revokePrivilegeV2()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ロールにすでに割り当てられている権限を取り消します。 | Node.js"
type: docx
token: UlAUdLNkCo1Mp8xFZYWclSL9n6b
sidebar_position: 26
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - revokePrivilegeV2()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# revokePrivilegeV2()

この操作は、ロールにすでに割り当てられている権限を取り消します。

```javascript
await milvusClient.revokePrivilegeV2(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.revokePrivilege({
   role: string,
   privilege: string,
   db_name: string,
   collection_name: string,
   timeout?: number
 })
```

**パラメータ:**

- **role** (*string*) -

    **[REQUIRED]**

    指定された権限を取り消す対象のロール名。

- **privilege** (*string*) -

    **[REQUIRED]**

    割り当てる権限または権限グループの名前。 

    詳細については、[Users and Roles](https://milvus.io/docs/users_and_roles.md) を参照してください。

- **db_name** (*string*) -

    **[REQUIRED]**

    この操作の対象データベース名。 

- **collection_name** (*string*) -

    **[REQUIRED]**

    この操作の対象コレクション名。 

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

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

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
await milvusClient.revokePrivilegeV2({
    role: 'exampleRole',
    privilege: 'CreateCollection',
    db_name: 'exampleDB',
    collection_name: 'exampleCollection',
});
```

