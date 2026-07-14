---
title: "listGrants() | Node.js"
slug: /node/node/Authentication-listGrants
sidebar_label: "listGrants()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたロールに付与された権限を一覧表示します。 | Node.js"
type: docx
token: CJ9DdmU1ooquOnxcK5AciA3sn3g
sidebar_position: 18
keywords: 
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - listGrants()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listGrants()

この操作は、指定されたロールに付与された権限を一覧表示します。

```javascript
await milvusClient.listGrants(data)
```

## Request Syntax\{#request-syntax}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
 });
```

**PARAMETERS:**

- roleName (*string*)  

    対象のロール名

    これを存在しないロールの名前に設定すると、エラーが発生する可能性があります。

**RETURNS** *Promise&lt;SelectGrantResponse&gt;*

このメソッドは、**SelectGrantResponse** オブジェクトに解決される promise を返します。

```typescript
{
    entities: GrantEntity[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **entities** (*GrantEntity[]*) -
要求されたロールに関連付けられた付与された権限の一覧。各エントリは、権限とその対象オブジェクト、およびそれを付与したプリンシパルの組み合わせです。**GrantEntity** の完全なフィールドリファレンスについては、`describeRole()` のドキュメントを参照してください。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
 });
```
