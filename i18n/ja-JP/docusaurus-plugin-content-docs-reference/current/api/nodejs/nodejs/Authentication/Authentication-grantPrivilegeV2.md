---
title: "grantPrivilegeV2() | Node.js"
slug: /node/node/Authentication-grantPrivilegeV2
sidebar_label: "grantPrivilegeV2()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、権限または権限グループをロールに割り当てます。 | Node.js"
type: docx
token: R618dfeMYo9GdmxMwe9cQLclncs
sidebar_position: 15
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - grantPrivilegeV2()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# grantPrivilegeV2()

この操作は、権限または権限グループをロールに割り当てます。

```javascript
await milvusClient.grantPrivilegeV2(data)
```

## Request Syntax\{#request-syntax}

```javascript
 milvusClient.grantPrivilegeV2({
   role: string,
   privilege: string,
   db_name: string,
   collection_name: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **role** (*string*) -

    **[REQUIRED]**

    権限を割り当てる対象のロール名。

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

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

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

    報告されたエラーの理由を示す内容。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
await milvusClient.grantPrivilegeV2({
    role: 'exampleRole',
    privilege: 'CreateCollection',
    db_name: 'exampleDB',
    collection_name: 'exampleCollection',
});
```

