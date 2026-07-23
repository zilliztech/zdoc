---
title: "hasRole() | Node.js"
slug: /node/node/Authentication-hasRole
sidebar_label: "hasRole()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、Milvus クラスターにロールが存在するかどうかを確認します。 | Node.js"
type: docx
token: Beq1d1hDUoTzIsxJ6WTcVtlpnah
sidebar_position: 29
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - hasRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# hasRole()

この操作は、Milvus クラスターにロールが存在するかどうかを確認します。

```javascript
await milvusClient.hasRole(data: HasRoleReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.hasRole({
    roleName: string,
    timeout?: number,
})
```

**パラメータ:**

- **roleName** (*string*) -

    **[REQUIRED]**

    確認するロールの名前。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウト。省略可能です。

**戻り値** *Promise&lt;HasRoleResponse&gt;*

このメソッドは、**HasRoleResponse** オブジェクトに解決される promise を返します。

```typescript
{
    hasRole: boolean,
    status:  ResStatus
}
```

**パラメータ:**

- **hasRole** (*boolean*) -<br/>
  要求されたロールが存在するかどうかを示す boolean 値です。ロールが存在する場合は **true**、存在しない場合は **false** です。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合、**0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合、**Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合、空文字列のままです。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await client.hasRole({ roleName: 'my_role' });
console.log(res.hasRole); // true or false
```
