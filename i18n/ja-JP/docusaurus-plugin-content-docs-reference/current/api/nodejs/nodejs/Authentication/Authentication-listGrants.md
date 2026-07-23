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
  - 管理されたベクトルデータベース
  - Pinecone ベクトルデータベース
  - 音声検索
  - セマンティック検索とは
  - zilliz
  - zilliz cloud
  - クラウド
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

## リクエスト構文\{#request-syntax}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
 });
```

**パラメータ:**

- roleName (*string*)  

    対象のロール名

    これを存在しないロール名に設定すると、エラーが発生する可能性があります。

**戻り値** *Promise&lt;SelectGrantResponse&gt;*

このメソッドは、**SelectGrantResponse** オブジェクトに解決される promise を返します。

```typescript
{
    entities: GrantEntity[],
    status:  ResStatus
}
```

**パラメータ:**

- **entities** (*GrantEntity[]*) -<br/>
  要求されたロールに関連付けられた grant の一覧です。各エントリは、権限、対象オブジェクト、およびそれを付与した principal を組み合わせたものです。**GrantEntity** の完全なフィールドリファレンスについては、`describeRole()` のドキュメントを参照してください。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は常に **0** です。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は常に **Success** です。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
 });
```
